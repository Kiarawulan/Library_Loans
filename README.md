# Library Loans API

REST API untuk mencatat peminjaman buku anggota perpustakaan. Dibuat dengan Node.js dan Express.js, menggunakan Supabase PostgreSQL sebagai database. Fitur mencakup CRUD peminjaman dan filter query.

## Teknologi

- Node.js 18 atau lebih baru dan Express.js
- Supabase PostgreSQL
- Vercel Functions

## Struktur data

| Field | Tipe | Keterangan |
|---|---|---|
| id | bigint | ID otomatis, primary key |
| member_name | text | Nama anggota |
| book_title | text | Judul buku |
| loan_date | date | Tanggal pinjam, default hari ini |
| due_date | date | Batas pengembalian |
| return_date | date / null | Tanggal dikembalikan |
| status | text | Dipinjam, Dikembalikan, atau Terlambat |
| created_at, updated_at | timestamptz | Waktu pencatatan dan pembaruan |

Jalankan SQL pada supabase/schema.sql melalui Supabase SQL Editor.

## Endpoint

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | / | Informasi API |
| GET | /health | Status API dan konfigurasi database |
| GET | /loans | Daftar peminjaman |
| GET | /loans?status=Terlambat | Filter status |
| GET | /loans?member_name=Kiara | Cari nama anggota |
| GET | /loans/:id | Detail peminjaman |
| POST | /loans | Tambah peminjaman |
| PUT / PATCH | /loans/:id | Ubah peminjaman |
| DELETE | /loans/:id | Hapus peminjaman |

### Contoh request dan response

Request POST /loans dengan Content-Type application/json:

    {
      "member_name": "Kiara Wulan",
      "book_title": "Laskar Pelangi",
      "loan_date": "2026-10-10",
      "due_date": "2026-10-24",
      "status": "Dipinjam"
    }

Respons 201 Created:

    { "data": { "id": 1, "member_name": "Kiara Wulan", "book_title": "Laskar Pelangi", "loan_date": "2026-10-10", "due_date": "2026-10-24", "return_date": null, "status": "Dipinjam" } }

Filter keterlambatan: GET /loans?status=Terlambat. Update parsial menggunakan PATCH /loans/1 dengan body {"status":"Dikembalikan","return_date":"2026-10-12"}. Delete mengembalikan pesan sukses dan ID. Status error: 400 untuk input tidak valid, 404 jika data tidak ditemukan, dan 500 untuk error database.

## Instalasi dan menjalankan lokal

1. Siapkan Node.js 18+ dan proyek Supabase.
2. Jalankan supabase/schema.sql melalui Supabase SQL Editor.
3. Salin .env.example sebagai .env, lalu isi SUPABASE_URL dan SUPABASE_ANON_KEY.
4. Jalankan npm install lalu npm run dev.

API tersedia di http://localhost:3000. Coba /health atau /loans.

## Deploy ke Vercel

API sudah aktif di base URL [https://library-loans.vercel.app](https://library-loans.vercel.app). Endpoint untuk dicoba: [health](https://library-loans.vercel.app/health), [daftar peminjaman](https://library-loans.vercel.app/loans), dan filter [status terlambat](https://library-loans.vercel.app/loans?status=Terlambat).

Untuk deploy ulang, impor repository ini di Vercel, atur environment variables SUPABASE_URL dan SUPABASE_ANON_KEY, lalu deploy. vercel.json mengarahkan semua rute ke function api/index.js.

## Keamanan

Jangan commit .env atau Supabase service_role key. Gunakan anon/publishable key dan atur Row Level Security serta policy Supabase yang sesuai. Policy SQL untuk tugas ini memberikan akses CRUD publik kepada role anon.
