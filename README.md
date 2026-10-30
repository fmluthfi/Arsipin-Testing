# Arsipin

Arsipin adalah aplikasi web untuk menyusun dan mengelola dokumen **Petunjuk Teknis (Juknis)**. Dokumen dapat dimulai sebagai draf, diperbarui sebagai versi baru, lalu dilacak berdasarkan statusnya. Tujuannya: isi terbaru mudah ditemukan tanpa kehilangan jejak perubahan sebelumnya.

Repository ini berisi **frontend** Arsipin. Autentikasi, penyimpanan dokumen, versi, dan otorisasi ditangani oleh backend API terpisah; frontend tidak mengakses PostgreSQL atau Prisma secara langsung.

## Fitur frontend

- Masuk dan mendaftar dengan akun lokal; masuk dengan Google melalui backend.
- Melihat daftar dokumen, mencari berdasarkan judul, memfilter status, dan berpindah halaman.
- Membuat draf Juknis dengan isi Markdown.
- Melihat dokumen dan menyimpan revisi sebagai versi baru, beserta ringkasan perubahan. Versi sebelumnya tidak ditimpa.
- Menampilkan status dokumen: draf, dalam review, disetujui, dan terbit.

> **Status pengembangan:** halaman `/reviews` saat ini masih placeholder. Antrean review dan alur persetujuan belum tersedia di frontend.

## Teknologi

- Next.js 15 dengan App Router
- React 19 dan TypeScript
- GSAP untuk animasi halaman
- Backend API dengan sesi berbasis cookie

## Menjalankan secara lokal

### Prasyarat

- Node.js 22 dan npm
- Backend Arsipin yang dapat diakses dari browser

### Langkah

```bash
git clone https://github.com/fmluthfi/Arsipin-Testing.git
cd Arsipin-Testing
npm install
```

Buat `.env.local` di root project dan isi alamat API:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Ganti URL tersebut jika backend berjalan di alamat lain. Nilainya adalah prefix API yang digunakan frontend. Karena variabel ini diawali `NEXT_PUBLIC_`, nilainya dimasukkan ke bundle browser dan **bukan tempat untuk menyimpan secret**.

Jalankan frontend:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

Backend harus berjalan agar login dan halaman yang memerlukan data dapat digunakan. Jika API belum dapat dihubungi, aplikasi menampilkan pesan error yang sesuai.

## Halaman utama

| Route | Fungsi |
| --- | --- |
| `/` | Pengenalan Arsipin dan gambaran alur kerja dokumen |
| `/login` | Masuk atau mendaftar |
| `/documents` | Daftar, pencarian, dan filter dokumen |
| `/documents/new` | Membuat draf Juknis |
| `/documents/[id]` | Melihat isi dan status dokumen |
| `/documents/[id]/edit` | Membuat versi baru dari draf yang dapat diedit |
| `/reviews` | Placeholder untuk fitur review yang direncanakan |

## Integrasi backend

Frontend mengirim request ke `NEXT_PUBLIC_API_URL` dengan cookie sesi (`credentials: include`). Karena itu, backend perlu mengizinkan origin frontend melalui CORS dan mengizinkan credentials. Backend juga bertanggung jawab memvalidasi sesi, hak akses, status dokumen, dan seluruh input.

Endpoint dan format request/response yang dipakai frontend didokumentasikan di [API_CONTRACT.md](./API_CONTRACT.md).

## Build dan production

Validasi build lokal:

```bash
npm run build
```

Jalankan hasil build:

```bash
npm run start
```
