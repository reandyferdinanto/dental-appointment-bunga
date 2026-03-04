# 🦷 Setup Google Sheets sebagai Database — drg. Natasya Bunga Maureen

Panduan lengkap menghubungkan Google Sheets + Apps Script sebagai database untuk aplikasi ini.

---

## 📋 Gambaran Arsitektur

```
Next.js App (Vercel)
      │
      │  POST { action, token, ...data }
      ▼
Google Apps Script Web App  ←→  Google Spreadsheet
      (REST API)                  (3 sheet tabs)
```

- **Read / Write** → Apps Script Web App (REST endpoint)
- **Data tersimpan** → Google Spreadsheet (gratis, unlimited)
- **Autentikasi** → Secret token di body request

---

## 🗂️ Struktur Google Spreadsheet

Spreadsheet akan memiliki **3 tab** yang dibuat otomatis saat seed:

### Tab 1 — `Appointments`

| Kolom | Header | Tipe | Contoh |
|-------|--------|------|--------|
| A | ID | String | `a1b2c3d4e5f6g7h8` |
| B | Nama Pasien | String | `Budi Santoso` |
| C | No. HP | String | `081234567890` |
| D | Email | String | `budi@gmail.com` *(opsional)* |
| E | Koas ID | String | `bunga` |
| F | Tanggal | String `YYYY-MM-DD` | `2026-03-10` |
| G | Jam | String `HH:mm` | `09:00` |
| H | Keluhan | String | `Gigi berlubang dan sakit` |
| I | Status | Enum | `pending` / `confirmed` / `completed` / `cancelled` |
| J | Catatan Dokter | String | `Perlu foto rontgen terlebih dahulu` |
| K | Dibuat Pada | ISO String | `2026-03-05T08:30:00.000Z` |

> 🎨 **Color coding otomatis:**
> - 🟡 `pending` → latar kuning muda
> - 🟢 `confirmed` → latar hijau muda
> - 🔵 `completed` → latar biru muda
> - 🔴 `cancelled` → latar merah muda

### Tab 2 — `Logbook`

| Kolom | Header | Tipe | Contoh |
|-------|--------|------|--------|
| A | ID | String | `x9y8z7w6v5u4t3s2` |
| B | Koas ID | String | `bunga` |
| C | Appointment ID | String | *(opsional, bisa kosong)* |
| D | Tanggal | String `YYYY-MM-DD` | `2026-03-04` |
| E | Inisial Pasien | String | `Ny. SR` |
| F | Jenis Tindakan | String | `Pencabutan Gigi` |
| G | No. Gigi | String | `36` *(opsional)* |
| H | Diagnosis | String | `Karies dentin profunda` |
| I | Treatment | String | `Ekstraksi sederhana gigi 36` |
| J | Pembimbing | String | `drg. Hendra Wijaya, Sp.KG` |
| K | Tingkat Kompetensi | Enum | `observed` / `assisted` / `performed` |
| L | Catatan | String | `Pasien kooperatif, perdarahan minimal` |
| M | Dibuat Pada | ISO String | `2026-03-04T14:00:00.000Z` |

> 🎨 **Color coding otomatis:**
> - 🟠 `observed` → latar oranye muda
> - 🔵 `assisted` → latar biru muda
> - 🟢 `performed` → latar hijau muda

### Tab 3 — `Schedules`

| Kolom | Header | Tipe | Contoh |
|-------|--------|------|--------|
| A | Koas ID | String | `bunga` |
| B | Tanggal | String `YYYY-MM-DD` | `2026-03-10` |
| C | Slot Tersedia (JSON) | JSON Array String | `["09:00","09:30","10:00","13:00"]` |
| D | Diperbarui Pada | ISO String | `2026-03-05T08:00:00.000Z` |

> ℹ️ Satu baris = satu hari. Slot waktu disimpan sebagai JSON array di kolom C.
> Saat pasien booking, slot otomatis **dihapus** dari array (mencegah double booking).

---

## 🚀 Langkah-langkah Setup

### STEP 1 — Buat Google Spreadsheet

1. Buka **[https://sheets.google.com](https://sheets.google.com)**
2. Klik **`+ Blank`** untuk buat spreadsheet baru
3. Beri nama spreadsheet: **`drg-bunga-database`**
4. Copy **Spreadsheet ID** dari URL browser:
   ```
   https://docs.google.com/spreadsheets/d/[ COPY INI ]/edit#gid=0
   ```
   Contoh ID: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms`

---

### STEP 2 — Buka Google Apps Script

1. Di spreadsheet yang baru dibuat, klik menu **`Extensions`** → **`Apps Script`**
2. Tab baru akan terbuka dengan editor Apps Script
3. **Hapus semua kode default** yang ada (fungsi `myFunction` kosong)

---

### STEP 3 — Paste Script

1. Buka file **`scripts/google-apps-script/Code.gs`** di project ini
2. **Copy semua isinya** (Ctrl+A → Ctrl+C)
3. **Paste** ke editor Apps Script (Ctrl+V)
4. **Edit 2 baris CONFIG** di bagian paling atas:

```javascript
var SPREADSHEET_ID = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"; // ← ID spreadsheet kamu
var SECRET_TOKEN   = "bunga-secret-2024"; // ← token bebas, catat, nanti dipakai di .env
```

5. Klik **Save** (ikon 💾 atau `Ctrl+S`)
6. Beri nama project: **`drg-bunga-db`**

---

### STEP 4 — Deploy sebagai Web App

1. Klik tombol **`Deploy`** → **`New deployment`**
2. Klik ikon **⚙️ (gear)** di samping "Select type" → pilih **`Web app`**
3. Isi konfigurasi deployment:
   | Field | Nilai |
   |-------|-------|
   | **Description** | `drg-bunga-db-v1` |
   | **Execute as** | `Me (email kamu)` |
   | **Who has access** | `Anyone` |
4. Klik **`Deploy`**
5. Klik **`Authorize access`** → pilih akun Google kamu → klik **`Allow`**
6. Copy **Web app URL** yang muncul:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```
   ⚠️ **Simpan URL ini!** Akan dipakai sebagai `GSHEET_API_URL`

---

### STEP 5 — Test Koneksi (Health Check)

Buka URL berikut di browser (ganti dengan URL kamu):
```
https://script.google.com/macros/s/AKfycb.../exec
```

Harus muncul response:
```json
{
  "status": "ok",
  "app": "drg-bunga-db",
  "version": "1.0"
}
```

Jika muncul response tersebut, Apps Script sudah berjalan ✅

---

### STEP 6 — Set Environment Variables

#### Untuk Development Lokal — edit `.env.local`:

```dotenv
GSHEET_API_URL="https://script.google.com/macros/s/AKfycb.../exec"
GSHEET_SECRET="bunga-secret-2024"
NEXTAUTH_SECRET="ganti-dengan-string-acak-minimal-32-karakter"
NEXTAUTH_URL="http://localhost:3001"
ADMIN_EMAIL="bunga@dentist.com"
ADMIN_PASSWORD="admin123"
```

> 💡 Generate `NEXTAUTH_SECRET`: buka **[https://generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)**

#### Untuk Production di Vercel — jalankan di PowerShell:

```powershell
cd C:\reandy\Dentist_Bunga

# Ganti nilai dengan milik kamu
"https://script.google.com/macros/s/AKfycb.../exec" | npx vercel env add GSHEET_API_URL production preview development

"bunga-secret-2024" | npx vercel env add GSHEET_SECRET production preview development

"isi-dengan-nextauth-secret-32-char" | npx vercel env add NEXTAUTH_SECRET production preview development

"https://dental-appointment-bunga.vercel.app" | npx vercel env add NEXTAUTH_URL production
"http://localhost:3001" | npx vercel env add NEXTAUTH_URL development preview

"bunga@dentist.com" | npx vercel env add ADMIN_EMAIL production preview development
"admin123" | npx vercel env add ADMIN_PASSWORD production preview development
```

---

### STEP 7 — Seed Data Awal

Setelah env vars diset dan deploy selesai, jalankan seed **satu kali** untuk:
- Membuat 3 tab sheet otomatis dengan header dan format warna
- Mengisi jadwal 14 hari ke depan
- Menambahkan 1 contoh appointment dan 1 contoh logbook

**Cara seed:**

Option A — via browser console (di halaman web yang sudah di-deploy):
```javascript
fetch('/api/seed', { method: 'POST' }).then(r => r.json()).then(console.log)
```

Option B — via terminal lokal:
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/seed" -Method POST
```

Hasil sukses:
```json
{
  "success": true,
  "message": "Data seed berhasil! Sheet Appointments, Logbook, dan Schedules telah dibuat."
}
```

---

### STEP 8 — Deploy ke Vercel

```powershell
cd C:\reandy\Dentist_Bunga
npx vercel --prod
```

---

## 🔄 Update Script (Jika Ada Perubahan)

Jika `Code.gs` diupdate di masa depan:

1. Buka Apps Script editor
2. Copy-paste kode baru
3. Klik **`Deploy`** → **`Manage deployments`**
4. Klik ✏️ edit pada deployment aktif
5. Ubah **Version** → **`New version`**
6. Klik **`Deploy`**

> ⚠️ URL Web App **tidak berubah** saat update version. Tidak perlu update env vars.

---

## 🐛 Troubleshooting

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| `Unauthorized` | `GSHEET_SECRET` tidak cocok | Pastikan `SECRET_TOKEN` di Code.gs sama dengan `GSHEET_SECRET` di `.env` |
| `Cannot read properties of null` | `SPREADSHEET_ID` kosong/salah | Cek dan isi `SPREADSHEET_ID` di Code.gs lalu deploy ulang |
| `Slot sudah tidak tersedia` | Slot sudah dipesan pasien lain | Normal — slot memang sudah habis |
| Response HTML bukan JSON | Apps Script error / belum di-authorize | Buka URL di browser, klik authorize ulang |
| Data tidak muncul di dashboard | `GSHEET_API_URL` belum diset di Vercel | Jalankan `npx vercel env add GSHEET_API_URL ...` |
| `Script timeout` | Terlalu banyak baris di sheet | Hapus baris lama yang sudah tidak diperlukan |

---

## 📊 API Actions Reference

Semua request menggunakan `POST` ke `GSHEET_API_URL` dengan body JSON.

| Action | Deskripsi | Parameter Tambahan |
|--------|-----------|-------------------|
| `apt_create` | Buat appointment baru | `patientName`, `patientPhone`, `date`, `time`, `complaint`, `koasId` |
| `apt_list` | List semua appointment | — |
| `apt_get` | Ambil 1 appointment | `id` |
| `apt_update_status` | Update status appointment | `id`, `status` |
| `apt_delete` | Hapus appointment | `id` |
| `log_create` | Buat entri logbook | `date`, `patientInitials`, `procedureType`, `diagnosis`, `treatment`, `supervisorName`, `competencyLevel` |
| `log_list` | List semua logbook | `koasId` *(opsional)* |
| `log_delete` | Hapus entri logbook | `id` |
| `sch_set` | Set jadwal satu hari | `koasId`, `date`, `slots` (array) |
| `sch_get` | Ambil jadwal satu hari | `koasId`, `date` |
| `sch_get_week` | Ambil jadwal satu minggu | `koasId`, `weekStart` (YYYY-MM-DD) |
| `sch_remove_slot` | Hapus satu slot waktu | `koasId`, `date`, `time` |
| `seed` | Isi data awal | — |

Semua request harus menyertakan `token` yang sama dengan `SECRET_TOKEN` di Code.gs:
```json
{
  "action": "apt_list",
  "token": "bunga-secret-2024"
}
```

