# 🤖 Telegram Bot — Webhook Setup di Vercel

Panduan lengkap untuk menjalankan bot Telegram di Vercel menggunakan **Webhook** (bukan polling).

---

## 📋 Perbedaan Polling vs Webhook

| | Polling (`telegram-standalone.mjs`) | Webhook (Vercel) |
|---|---|---|
| Cara kerja | Bot terus minta update ke Telegram | Telegram kirim update ke URL kamu |
| Butuh server nyala 24/7 | ✅ Ya | ❌ Tidak (serverless) |
| Cocok untuk | Lokal / VPS | **Vercel / cloud** |
| Biaya | Butuh server aktif | Gratis di Vercel |

---

## 🚀 Langkah-Langkah Deploy ke Vercel

### 1. Set Environment Variables di Vercel

Masuk ke **Vercel Dashboard → Project → Settings → Environment Variables**, lalu tambahkan:

| Key | Value |
|-----|-------|
| `TELEGRAM_BOT_TOKEN` | `8651607368:AAH1rXu2v8CHzdCSg_Ez9kbbdmeyzhHIyUc` |
| `TELEGRAM_SETUP_SECRET` | `bunga-tele-setup-2026` |
| `GSHEET_API_URL` | *(URL Google Apps Script kamu)* |
| `GSHEET_SECRET` | `bunga-secret-2024` |
| `NEXTAUTH_SECRET` | `drg-bunga-nextauth-secret-prod-2026-natasya` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `ADMIN_EMAIL` | `bunga@dentist.com` |
| `ADMIN_PASSWORD` | `admin123` |

> ⚠️ Ganti `NEXTAUTH_URL` dengan URL Vercel kamu yang sebenarnya!

---

### 2. Deploy ke Vercel

```bash
# Install Vercel CLI (jika belum)
npm install -g vercel

# Login
vercel login

# Deploy (pertama kali)
vercel

# Deploy production
vercel --prod
```

Atau bisa juga **connect GitHub repo** di Vercel Dashboard untuk auto-deploy.

Setelah deploy, kamu akan mendapatkan URL seperti:
```
https://dentist-bunga.vercel.app
```

---

### 3. Set Webhook ke Telegram

Setelah deploy berhasil, buka URL berikut di browser:

```
https://dentist-bunga.vercel.app/api/telegram/setup?action=set&secret=bunga-tele-setup-2026
```

> 🔄 Ganti `dentist-bunga.vercel.app` dengan domain Vercel kamu yang sebenarnya.

**Response yang diharapkan:**
```json
{
  "action": "set",
  "webhookUrl": "https://dentist-bunga.vercel.app/api/telegram/webhook",
  "result": {
    "ok": true,
    "result": true,
    "description": "Webhook was set"
  }
}
```

---

### 4. Verifikasi Webhook Aktif

Cek status webhook dengan membuka:

```
https://dentist-bunga.vercel.app/api/telegram/setup?secret=bunga-tele-setup-2026
```

**Response yang diharapkan:**
```json
{
  "action": "info",
  "info": {
    "ok": true,
    "result": {
      "url": "https://dentist-bunga.vercel.app/api/telegram/webhook",
      "has_custom_certificate": false,
      "pending_update_count": 0,
      "last_error_date": 0,
      "last_error_message": "",
      "max_connections": 40
    }
  }
}
```

Kalau `url` sudah terisi dan `pending_update_count` = 0, bot siap digunakan! ✅

---

## 🔧 Alternatif: Set Webhook via CURL

Jika tidak mau pakai browser, bisa gunakan curl di terminal:

```bash
# Set webhook
curl "https://api.telegram.org/bot8651607368:AAH1rXu2v8CHzdCSg_Ez9kbbdmeyzhHIyUc/setWebhook?url=https://dentist-bunga.vercel.app/api/telegram/webhook"

# Cek status webhook
curl "https://api.telegram.org/bot8651607368:AAH1rXu2v8CHzdCSg_Ez9kbbdmeyzhHIyUc/getWebhookInfo"

# Hapus webhook (untuk kembali ke polling)
curl "https://api.telegram.org/bot8651607368:AAH1rXu2v8CHzdCSg_Ez9kbbdmeyzhHIyUc/deleteWebhook"
```

---

## 🗂️ Struktur File Bot di Project

```
src/
└── app/
    └── api/
        └── telegram/
            ├── webhook/
            │   └── route.ts    ← Menerima update dari Telegram (POST)
            └── setup/
                └── route.ts    ← Endpoint untuk set/delete webhook (GET)

src/lib/telegram/
├── bot.ts                      ← Logic utama bot (handleMessage, handleCallback)
└── api.ts                      ← Helper Telegram API (sendMessage, dll)
```

---

## ⚠️ Penting: Jangan Jalankan Polling & Webhook Bersamaan!

Jika kamu sudah set webhook di Vercel, **jangan jalankan** `npm run telegram:bot` secara bersamaan karena akan konflik.

| Mode | Perintah | Kapan digunakan |
|------|----------|-----------------|
| Polling (lokal) | `npm run telegram:bot` | Development / testing lokal |
| Webhook (production) | Deploy ke Vercel + set webhook | Production |

Untuk beralih dari webhook ke polling:
```
https://dentist-bunga.vercel.app/api/telegram/setup?action=delete&secret=bunga-tele-setup-2026
```

---

## 🐛 Troubleshooting

### Bot tidak merespons setelah set webhook

1. **Cek webhook info** — pastikan URL sudah benar dan tidak ada `last_error_message`
2. **Cek Vercel logs** — pergi ke Vercel Dashboard → Project → Functions → lihat log error
3. **Pastikan env variable sudah di-set** di Vercel, terutama `TELEGRAM_BOT_TOKEN`
4. **Pastikan tidak ada webhook lama** — coba delete dulu baru set ulang

### Error `401 Unauthorized` saat akses `/api/telegram/setup`

Pastikan query param `secret` sesuai dengan `TELEGRAM_SETUP_SECRET` di env:
```
?secret=bunga-tele-setup-2026
```

### Webhook URL salah / tidak bisa diakses

Vercel membutuhkan HTTPS. Pastikan URL kamu menggunakan `https://`, bukan `http://`.

### `pending_update_count` terus bertambah

Artinya bot menerima pesan tapi tidak bisa memproses. Cek Vercel Function Logs untuk error detail.

---

## 📞 Flow Singkat

```
User kirim pesan di Telegram
        ↓
Telegram POST ke https://your-app.vercel.app/api/telegram/webhook
        ↓
Next.js route handler (webhook/route.ts)
        ↓
handleMessage() / handleCallback() di lib/telegram/bot.ts
        ↓
Bot kirim balas ke user via Telegram API
```

---

*Bot: drg. Natasya Bunga Maureen 🦷*

