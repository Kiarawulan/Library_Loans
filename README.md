# Library Loans API

REST API sederhana untuk mencatat peminjaman buku perpustakaan. Dibangun dengan Node.js dan Express.js, menggunakan Supabase sebagai database, dan dideploy ke Vercel.

## Teknologi

- Node.js 18+ dan Express.js
- Supabase PostgreSQL
- Vercel Functions

## Struktur data

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | ID otomatis, primary key |
| member_name | text | Nama anggota |
| book_title | text | Judul buku |
| borrow_date | date | Tanggal pinjam, default hari ini |
| due_date | date | Batas pengembalian |
| status | text | Dipinjam, Dikembalikan, atau Terlambat |
| created_at | timestamptz | Waktu pencatatan |

SQL tersedia di `supabase/schema.sql`. Untuk database baru, jalankan melalui Supabase SQL Editor.

## Endpoint

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/` | Daftar endpoint API |
| GET | `/health` | Status API |
| GET | `/loans` | Daftar peminjaman |
| GET | `/loans?status=Terlambat` | Filter status |
| GET | `/loans?member_name=Kiara` | Cari nama anggota |
| GET | `/loans/:id` | Detail peminjaman |
| POST | `/loans` | Tambah peminjaman |
| PUT / PATCH | `/loans/:id` | Ubah peminjaman |
| DELETE | `/loans/:id` | Hapus peminjaman |

### Contoh request

POST `/loans` dengan `Content-Type: application/json`:

```json
{
  "member_name": "Kiara Wulan",
  "book_title": "Laskar Pelangi",
  "due_date": "2026-10-24",
  "status": "Dipinjam"
}
```

Kolom `borrow_date` otomatis memakai tanggal hari ini bila tidak dikirim. Contoh respons `201 Created`:

```json
{
  "data": {
    "id": "uuid-dari-database",
    "member_name": "Kiara Wulan",
    "book_title": "Laskar Pelangi",
    "borrow_date": "2026-10-10",
    "due_date": "2026-10-24",
    "status": "Dipinjam"
  }
}
```

Contoh filter: `GET /loans?status=Terlambat`. Contoh update parsial: `PATCH /loans/ID` dengan body `{"status":"Dikembalikan"}`.

## Instalasi dan menjalankan lokal

1. Siapkan Node.js 18+ dan proyek Supabase.
2. Jalankan `supabase/schema.sql` melalui SQL Editor untuk membuat tabel pada database baru.
3. Salin `.env.example` menjadi `.env`, lalu isi `SUPABASE_URL` dan `SUPABASE_ANON_KEY`.
4. Jalankan:

```bash
npm install
npm run dev
```

API lokal tersedia di `http://localhost:3000`.

## Deployment

Base URL publik: [https://library-loans.vercel.app](https://library-loans.vercel.app). Contoh filter terlambat: [GET /loans?status=Terlambat](https://library-loans.vercel.app/loans?status=Terlambat).

Pengaturan Vercel membutuhkan environment variables `SUPABASE_URL` dan `SUPABASE_ANON_KEY`.

## Catatan keamanan

Jangan commit `.env` atau Supabase `service_role` key. Policy pada schema memberi akses CRUD publik kepada role `anon` untuk keperluan tugas ini.
