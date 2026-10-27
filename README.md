# Arsipin

Frontend Next.js untuk Arsipin. Aplikasi ini tidak mengakses PostgreSQL atau Prisma secara langsung; semua autentikasi dan data diminta melalui backend API. Source frontend berada langsung di root repository, terutama pada folder `src/`.

## Menjalankan lokal

1. Salin `.env.example` menjadi `.env.local`.
2. Atur `NEXT_PUBLIC_API_URL` ke alamat API, misalnya `http://localhost:4000/api`.
3. Jalankan `npm install`, lalu `npm run dev`.
4. Buka `http://localhost:3000`.

Kontrak endpoint yang diperlukan ada di [API_CONTRACT.md](./API_CONTRACT.md). Sebelum backend tersedia, halaman yang memerlukan data akan menampilkan status backend belum dapat dihubungi.

## Image Docker

Build dari root repository dan berikan URL API publik sebagai build argument:

```powershell
docker build --build-arg NEXT_PUBLIC_API_URL=https://api.example.com/api -t arsipin:0.1.0 .
```

URL API dimasukkan ke bundle browser saat image dibangun. Backend harus mengizinkan origin frontend dan cookie credentials.
