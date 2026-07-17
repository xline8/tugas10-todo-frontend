# Aplikasi Todo Frontend — Praktikum 10 Pemrograman Web

Aplikasi Todo berbasis React yang terintegrasi dengan REST API **NestJS** (dibangun pada Modul 9).
Fokus praktikum: integrasi Frontend–Backend menggunakan **CORS** dan **Axios** (beserta interceptor),
pengelolaan environment variable Vite, serta loading & error handling pada setiap operasi CRUD.

---

## Tech Stack

| Bagian | Teknologi |
|--------|-----------|
| Frontend | React 19 + Vite 8 |
| HTTP Client | Axios (dengan request & response interceptor) |
| Icons | lucide-react (SVG) |
| Backend | NestJS 11 + TypeORM + MySQL |
| Keamanan | CORS, ValidationPipe |

---

## Fitur

- **List Todo** — menampilkan semua todo (`GET /api/v1/todos`).
- **Add Todo** — form tambah todo dengan validasi client (`POST /api/v1/todos`).
- **Toggle Complete** — checkbox menandai todo selesai (`PUT /api/v1/todos/:id`).
- **Delete Todo** — tombol hapus dengan konfirmasi (`DELETE /api/v1/todos/:id`).
- **Filter** — Semua / Aktif / Selesai (dengan counter).
- **Loading & Error** — indikator loading dan penanganan error untuk setiap operasi
  (GET, POST, PUT, DELETE) + conditional rendering (loading / error / success state).

---

## Struktur Folder

```
frontend-products/
├── .env                      # VITE_API_URL=http://localhost:3000
├── src/
│   ├── api/
│   │   └── axiosInstance.js  # Axios instance + interceptor (request & response logging)
│   ├── config.js             # API_URL diambil dari import.meta.env.VITE_API_URL
│   ├── pages/
│   │   └── TodoList.jsx      # Komponen utama aplikasi Todo
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

---

## Prasyarat

- Node.js (v18+)
- MySQL server (untuk backend NestJS dari Modul 9)
- Backend NestJS (`nestjs-mysql-crud`) sudah ter-setup & bisa running di `http://localhost:3000`

---

## Cara Menjalankan

Buka **dua terminal** berbeda.

### 1. Backend (NestJS — dari Modul 9)

```bash
cd nestjs-mysql-crud
npm install
npm run start:dev
# Berjalan di http://localhost:3000
```

> Pastikan CORS sudah dikonfigurasi di `src/main.ts`:
> ```ts
> app.enableCors({
>   origin: ['http://localhost:5173', 'http://localhost:5174'],
>   credentials: true,
>   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
>   allowedHeaders: ['Content-Type', 'Authorization'],
> });
> ```

### 2. Frontend (React — repo ini)

```bash
cd frontend-products
npm install
npm run dev
# Berjalan di http://localhost:5173
```

Buka browser: **http://localhost:5173**

---

## Environment Variable

Buat file `.env` di root project frontend:

```env
VITE_API_URL=http://localhost:3000
```

Diakses melalui `src/config.js`:

```js
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

> **Penting:** restart dev server (`npm run dev`) setelah membuat/mengubah `.env`.

---

## API Endpoint

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/v1/todos` | Mengambil semua todo |
| POST | `/api/v1/todos` | Menambah todo baru |
| PUT | `/api/v1/todos/:id` | Mengupdate todo (field `completed`) |
| DELETE | `/api/v1/todos/:id` | Menghapus todo |

Contoh body `POST /api/v1/todos`:

```json
{
  "title": "Belajar CORS",
  "description": "Memahami preflight OPTIONS",
  "priority": "high",
  "dueDate": "2026-07-20"
}
```

> Field `title` dan `priority` (`low` | `medium` | `high`) wajib diisi (divalidasi oleh DTO backend).

---

## Alur Data (Axios Interceptor)

Semua request melewati `src/api/axiosInstance.js`:

- **Request interceptor** — mencatat (log) method & URL tiap request.
- **Response interceptor** — mencatat status response, atau error (server / no-response / setup).

Log dapat dilihat di browser DevTools → tab **Console**.

---


## Lisensi

Proyek ini dibuat untuk keperluan tugas praktikum kuliah. Bebas digunakan untuk pembelajaran.
