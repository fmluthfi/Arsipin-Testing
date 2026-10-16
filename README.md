# Arsipin

Arsipin adalah aplikasi internal untuk menulis, merevisi, meninjau, dan menerbitkan dokumen Petunjuk Teknis (Juknis). Fase 1 menyediakan fondasi Next.js App Router, PostgreSQL + Prisma, login Google melalui Auth.js, role default `PENULIS`, proteksi rute server, dan layout dasar.

## Struktur awal

- `src/app`: halaman dan Route Handler API.
- `src/auth.ts`: konfigurasi Auth.js dan sinkronisasi user ke database.
- `src/components`: komponen UI bersama.
- `src/lib/prisma.ts`: singleton Prisma Client.
- `prisma/schema.prisma`: skema database fase berjalan.
- `middleware.ts`: proteksi rute `/documents`, `/reviews`, dan `/admin`.

## Menyiapkan lokal

1. Pastikan Node.js 20+ dan PostgreSQL tersedia.
2. Salin `.env.example` menjadi `.env` dan isi `DATABASE_URL`, `AUTH_SECRET`, serta kredensial Google.
3. Di Google Cloud Console, buat OAuth Client ID bertipe **Web application**. Tambahkan redirect URI `http://localhost:3000/api/auth/callback/google` dan origin `http://localhost:3000`.
4. Jalankan `npm install`.
5. Jalankan `npm run db:generate`, lalu `npm run db:migrate -- --name init`.
6. Jalankan `npm run dev` dan buka `http://localhost:3000`.

Auth.js menggunakan strategi sesi JWT pada fase ini. Pilihan ini mengurangi tabel sesi tambahan dan cukup untuk role yang dibaca ulang dari database pada callback JWT. Role tetap dikelola di tabel `User`, bukan dari klaim Google.

## Endpoint pemeriksaan

`GET /api/health` menguji koneksi database dan mengembalikan status JSON. Endpoint ini tidak membutuhkan login agar dapat dipakai untuk pemeriksaan lokal.

## Build image dan deployment

Arsipin memakai Next.js App Router sebagai frontend sekaligus backend (Route Handlers, server actions, dan Auth.js). Karena itu, satu image Docker menjalankan aplikasi web lengkap; PostgreSQL tetap harus tersedia terpisah, misalnya pada server atau layanan PostgreSQL terkelola. Image tidak membawa database dan tidak menjalankan migrasi otomatis.

Di Linux/server yang sudah memasang Docker Engine, dari salinan repository jalankan:

```bash
bash scripts/build-image.sh
```

Tag image bisa dipilih sebagai argumen, misalnya `bash scripts/build-image.sh 1.0.0`. Alternatifnya, build langsung dengan `docker build -t arsipin:latest .`. Jalankan image dengan environment runtime yang benar (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `GOOGLE_CLIENT_ID`, dan `GOOGLE_CLIENT_SECRET`) serta port `3000`; jangan masukkan rahasia ke Dockerfile atau image.

Sebelum menjalankan versi aplikasi yang memakai migrasi baru, jalankan `npm ci`, isi `DATABASE_URL` ke PostgreSQL tujuan, lalu `npm run db:deploy` dari checkout repository. Perintah itu menerapkan migrasi yang sudah tersimpan, bukan membuat migrasi baru.

## Backup PostgreSQL

Pada mesin yang memiliki PostgreSQL client (`pg_dump`) dan akses jaringan ke database, isi `DATABASE_URL`, lalu jalankan:

```bash
bash scripts/backup-db.sh
```

File custom-format akan tersimpan dalam folder `backups/` dengan izin terbatas dan tidak ikut Git. Folder tujuan dapat diubah dengan `BACKUP_DIR=/lokasi/backup`. Simpan salinan backup di media/server terpisah dari database produksi. Untuk restore ke database kosong, gunakan `pg_restore --dbname="$DATABASE_URL" --clean --if-exists backups/nama-file.dump`; perintah restore dapat menimpa objek pada database tujuan, jadi pastikan URL benar sebelum menjalankannya.

Backup ini dijalankan manual; penjadwalan rutin dan pengiriman salinan ke penyimpanan eksternal belum dikonfigurasi.

## Acceptance criteria Fase 1

- Login Google tersedia di `/login`.
- User baru di-upsert ke database dan otomatis mendapat role `PENULIS`.
- Rute dokumen, review, dan admin mengarahkan user anonim ke `/login`.
- Navigasi utama dan identitas Arsipin tampil dalam Bahasa Indonesia serta responsif.
- `GET /api/health` mengembalikan `200` bila PostgreSQL tersambung.

Verifikasi: isi `.env`, jalankan migrasi, jalankan `npm run dev`, buka `/login`, selesaikan OAuth, lalu coba akses `/documents` dan `/api/health`.

## Tahap berikutnya

Fase 2 akan menambahkan CRUD dokumen dan versioning append-only. Fitur review, diff, rollback, admin, dan seed akan masuk pada fase yang telah ditentukan.
