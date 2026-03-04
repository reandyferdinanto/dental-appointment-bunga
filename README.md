# 🦷 Dental Koas — drg. Natasya Bunga Maureen

Aplikasi web interaktif untuk dokter gigi koas **Natasya Bunga Maureen**. Platform ini memudahkan pasien untuk booking janji temu dan membantu drg. Bunga mengelola jadwal, appointment, serta mencatat logbook tindakan medis.

---

## ✨ Fitur Utama

### Area Publik (Pasien)
- 🏠 **Landing Page** — profil, layanan, dan cara booking
- 📅 **Jadwal Praktik** — lihat slot waktu tersedia per minggu
- 📝 **Booking Online** — form 3-langkah: tanggal → waktu → data diri

### Dashboard (drg. Bunga) — Login Required
- 📊 **Overview** — statistik pasien hari ini, janji temu mendatang
- 🗂️ **Manajemen Janji Temu** — konfirmasi, selesaikan, atau batalkan booking
- 🗓️ **Kelola Jadwal** — kalender mingguan interaktif, tambah/hapus slot
- 📒 **E-Logbook** — catat tindakan medis dengan tingkat kompetensi

---

## 🛠 Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Database | Upstash Redis |
| Auth | NextAuth.js v5 |
| Icons | Lucide React |
| Validasi | Zod |

---

## 🚀 Cara Menjalankan

### 1. Install dependencies
```bash
npm install
```

### 2. Setup `.env.local`
```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
NEXTAUTH_SECRET=your-random-secret
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=bunga@dentist.com
ADMIN_PASSWORD=admin123
```
> **Tanpa Redis:** App otomatis pakai in-memory store untuk development.

### 3. Jalankan dev server
```bash
npm run dev
```

### 4. Seed demo data (opsional)
```bash
curl -X POST http://localhost:3000/api/seed
```

---

## 🔐 Login Dashboard
- **Email:** `bunga@dentist.com`
- **Password:** `admin123`

---

## 🗺 Halaman
| URL | Deskripsi |
|---|---|
| `/` | Landing page |
| `/jadwal` | Jadwal praktik publik |
| `/booking` | Form booking pasien |
| `/login` | Login dashboard |
| `/dashboard` | Overview (auth) |
| `/dashboard/appointments` | Kelola janji temu |
| `/dashboard/schedules` | Kelola jadwal |
| `/dashboard/logbook` | E-Logbook |

---

## 🚢 Deploy ke Vercel
1. Push ke GitHub → import di vercel.com
2. Set env vars di Vercel Dashboard
3. Buat Redis gratis di [upstash.com](https://upstash.com)
