# Kontrak API frontend Arsipin

Frontend mengirim request ke `NEXT_PUBLIC_API_URL` dengan cookie sesi (`credentials: include`). Backend perlu mengaktifkan CORS untuk origin frontend dan mengizinkan credentials. Semua rute di bawah relatif terhadap prefix API tersebut.

## Sesi dan autentikasi

- `GET /auth/session` menghasilkan `{ "user": null }` atau `{ "user": { "id", "name", "email", "username", "role" } }`.
- `POST /auth/login` menerima `{ "identifier", "password" }`.
- `POST /auth/register` menerima `{ "username", "email", "password", "passwordConfirmation" }`.
- `POST /auth/logout` menghapus sesi.
- `GET /auth/google?returnTo=<frontend-url>` memulai OAuth Google, lalu mengarahkan kembali ke `returnTo` setelah berhasil.

Login dan pendaftaran membuat cookie sesi HTTP-only. Error mengembalikan status HTTP yang sesuai dan `{ "message": "..." }`; sesi yang tidak valid mengembalikan `401`.

## Dokumen

- `GET /documents?q=&status=&page=1&limit=10` menghasilkan `{ "items": [...], "total": 0, "page": 1, "totalPages": 1 }`.
- Setiap item berisi `id`, `judul`, `status`, `createdBy: { name, username }`, `currentVersion: { nomor } | null`, dan `updatedAt` dalam format ISO-8601.
- `POST /documents` menerima `{ "judul", "isi" }` dan mengembalikan `{ "id" }`.
- `GET /documents/:id` mengembalikan item dokumen dengan `createdById`, `canEdit`, dan `currentVersion: { nomor, isi } | null`.
- `POST /documents/:id/versions` menerima `{ "judul", "isi", "ringkasan" }` dan mengembalikan `204` atau objek hasil.

Backend tetap bertanggung jawab memvalidasi sesi, kepemilikan dokumen, status, dan seluruh input. Pemeriksaan di frontend hanya membantu alur penggunaan.
