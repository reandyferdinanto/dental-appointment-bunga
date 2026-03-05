/**
 * Telegram Standalone Bot — drg. Natasya Bunga Maureen
 * ──────────────────────────────────────────────────────
 * Run with:  node scripts/telegram-standalone.mjs
 *
 * Self-contained: does NOT require Next.js to be running.
 * Uses long-polling. Handles all bot logic internally.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Load .env.local ──────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath   = resolve(__dirname, "../.env.local");

try {
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = process.env[key] ?? val;
  }
} catch {
  console.warn("⚠️  Could not load .env.local — using process.env only");
}

// ── Config ────────────────────────────────────────────────────────────────────
const TOKEN      = process.env.TELEGRAM_BOT_TOKEN;
const GSHEET_URL = process.env.GSHEET_API_URL ?? "";
const GSHEET_SEC = process.env.GSHEET_SECRET  ?? "";
const BASE       = `https://api.telegram.org/bot${TOKEN}`;

if (!TOKEN) {
  console.error("❌  TELEGRAM_BOT_TOKEN is not set in .env.local!");
  process.exit(1);
}

// ── Telegram API ──────────────────────────────────────────────────────────────
async function tg(method, body = {}) {
  const res  = await fetch(`${BASE}/${method}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  return res.json();
}

async function sendMessage(chatId, text, opts = {}) {
  return tg("sendMessage", { chat_id: chatId, text, ...opts });
}

async function answerCallbackQuery(id, text) {
  return tg("answerCallbackQuery", { callback_query_id: id, text });
}

// ── GSheet helper ─────────────────────────────────────────────────────────────
async function gsheetCall(action, params = {}) {
  const payload = JSON.stringify({ token: GSHEET_SEC, action, ...params });
  const url     = `${GSHEET_URL}?payload=${encodeURIComponent(payload)}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    return res.json();
  } catch (e) {
    console.error("[gsheet]", e.message);
    return null;
  }
}

// ── Date helpers ──────────────────────────────────────────────────────────────
const DAYS_ID   = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const MONTHS_ID = ["Januari","Februari","Maret","April","Mei","Juni",
                   "Juli","Agustus","September","Oktober","November","Desember"];

function fmtDate(d) {
  return `${DAYS_ID[d.getDay()]}, ${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

function parseISO(raw) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return isNaN(d.getTime()) ? null : d;
}

function todayISO() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
}

function plusDays(iso, n) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  const d = new Date(+m[1], +m[2]-1, +m[3]);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

// ── In-memory sessions ────────────────────────────────────────────────────────
const TTL = 30 * 60 * 1000;
const sessions = new Map();

function getSession(chatId) {
  const s = sessions.get(chatId);
  if (s && Date.now() - s.updatedAt < TTL) return s;
  const fresh = { step: "IDLE", draft: {}, updatedAt: Date.now() };
  sessions.set(chatId, fresh);
  return fresh;
}

function setSession(chatId, update) {
  const s    = getSession(chatId);
  const next = { ...s, ...update, updatedAt: Date.now() };
  sessions.set(chatId, next);
  return next;
}

function resetSession(chatId) {
  sessions.delete(chatId);
}

function pruneExpired() {
  const now = Date.now();
  for (const [id, s] of sessions.entries()) {
    if (now - s.updatedAt > TTL) sessions.delete(id);
  }
}

// ── Education content ─────────────────────────────────────────────────────────
const EDU = {
  scaling: `🦷 <b>Scaling (Pembersihan Karang Gigi)</b>

Karang gigi adalah kotoran yang sudah mengeras dan <i>tidak bisa hilang hanya dengan sikat gigi biasa</i>.

<b>Prosesnya:</b>
• Dokter menggunakan alat ultrasonik yang bergetar untuk melepas karang gigi
• Terasa sedikit seperti "getaran" di gigi, <b>tidak sakit</b> ✅
• Durasi: sekitar <b>30–60 menit</b>

<b>Kenapa penting?</b>
Karang gigi bisa menyebabkan gusi meradang, gigi goyang, sampai harus dicabut. Scaling = investasi untuk gigi sehat jangka panjang! 😊

<b>Setelah scaling:</b>
• Hindari makanan/minuman berwarna gelap 24 jam pertama
• Gigi mungkin terasa lebih sensitif 1–2 hari — ini <b>normal</b>
• Sikat gigi 2x sehari secara rutin`,

  cabut: `🦷 <b>Pencabutan Gigi</b>

Tenang ya, prosedur ini <i>jauh lebih nyaman</i> dari yang dibayangkan! 😊

<b>Langkah-langkahnya:</b>
1. Dokter memberikan <b>anestesi lokal</b> (suntik kecil di gusi) — hanya terasa seperti dicubit sebentar
2. Tunggu 5 menit sampai area mati rasa sepenuhnya
3. Proses pencabutan sendiri biasanya hanya <b>1–5 menit</b> dan <b>tidak terasa sakit</b>
4. Menggigit kapas selama 30 menit setelah selesai

<b>Setelah cabut:</b>
• Jangan berkumur kuat 24 jam pertama
• Hindari makanan panas & keras
• Nyeri ringan 1–2 hari setelah anestesi habis adalah <b>normal</b>`,

  tambal: `🦷 <b>Penambalan Gigi (Tumpatan Komposit)</b>

Gigi berlubang? Jangan tunda! Semakin kecil lubangnya, semakin mudah ditambal 😊

<b>Prosesnya:</b>
1. Area gigi dibersihkan & diberi anestesi lokal (jika diperlukan)
2. Bagian berlubang dibersihkan dengan bur halus
3. Ditambal dengan bahan komposit <b>satu warna dengan gigi</b> — tidak ketahuan! ✨
4. Bahan disinari dengan lampu khusus agar mengeras sempurna

<b>Durasi:</b> 30–60 menit tergantung ukuran lubang

<b>Perawatan setelah tambal:</b>
• Hindari menggigit keras 24 jam pertama
• Kalau terasa mengganjal, kembali ke dokter untuk disesuaikan`,

  saluran: `🦷 <b>Perawatan Saluran Akar (PSA)</b>

PSA dilakukan ketika bakteri sudah masuk ke dalam akar gigi. Tujuannya adalah <i>menyelamatkan gigi agar tidak perlu dicabut</i>.

<b>Prosesnya (biasanya 2–3 kunjungan):</b>
1. Anestesi lokal → dokter membuka mahkota gigi
2. Jaringan terinfeksi dibersihkan dari saluran akar
3. Saluran disterilkan dan diisi bahan khusus
4. Gigi ditutup dengan tambalan atau mahkota (crown)

<b>Apakah sakit?</b> Dengan anestesi yang baik, prosedur ini <b>tidak sakit</b>. Rasa tidak nyaman ringan setelahnya bisa diatasi dengan obat nyeri biasa.`,

  putih: `🦷 <b>Pemutihan Gigi (Bleaching)</b>

Ingin gigi lebih cerah? Bleaching aman kalau dilakukan oleh dokter gigi 😁

<b>Prosesnya:</b>
• Dokter memastikan gigi & gusi dalam kondisi sehat dulu
• Gel pemutih khusus diaplikasikan ke permukaan gigi
• Diaktifkan dengan lampu khusus selama 15–30 menit
• Bisa diulang sampai 3 sesi dalam satu kunjungan

<b>Hasil:</b> Gigi bisa 2–8 shades lebih cerah!

<b>Perlu diketahui:</b>
• Tambal gigi & mahkota tidak ikut berubah warna
• Hindari makanan/minuman berwarna 24–48 jam
• Gigi mungkin lebih sensitif sementara — ini normal`,

  veneer: `🦷 <b>Veneer Gigi</b>

Veneer adalah lapisan tipis yang ditempelkan di depan gigi untuk memperbaiki warna, bentuk, atau ukuran gigi.

<b>Cocok untuk:</b>
• Gigi berwarna kuning yang tidak respons terhadap bleaching
• Gigi retak atau tergores
• Gigi yang sedikit tidak rata

<b>Prosesnya:</b>
1. Konsultasi & perencanaan estetika
2. Permukaan gigi dihaluskan sedikit (minimal)
3. Veneer dibuat di lab (1–2 minggu)
4. Veneer ditempelkan dengan semen khusus

<b>Hasil:</b> Senyum yang lebih cerah & rapi secara permanen ✨`,

  anak: `🦷 <b>Perawatan Gigi Anak</b>

Kami memahami anak-anak bisa merasa cemas. Kami akan membuat pengalaman ini <b>menyenangkan</b>! 🌈

<b>Layanan untuk anak:</b>
• Pemeriksaan rutin & pembersihan
• Penambalan gigi susu
• Fissure sealant (pencegahan lubang)
• Fluoride aplikasi (memperkuat email gigi)
• Pencabutan gigi susu yang sudah waktunya

<b>Rekomendasi:</b> Anak sebaiknya mulai ke dokter gigi sejak gigi pertama tumbuh (± usia 1 tahun) atau paling lambat usia 3 tahun.`,
};

// ── Menus ─────────────────────────────────────────────────────────────────────
const MAIN_MENU = {
  inline_keyboard: [
    [
      { text: "📅 Jadwal Praktik",   callback_data: "jadwal"   },
      { text: "📋 Buat Janji Temu",  callback_data: "booking"  },
    ],
    [
      { text: "🦷 Info Tindakan Gigi", callback_data: "edu_menu" },
      { text: "📞 Kontak & Lokasi",    callback_data: "kontak"   },
    ],
    [
      { text: "❓ Tentang drg. Bunga", callback_data: "tentang" },
    ],
  ],
};

const EDU_MENU = {
  inline_keyboard: [
    [
      { text: "🪥 Scaling / Karang Gigi",  callback_data: "edu_scaling" },
      { text: "🦷 Cabut Gigi",             callback_data: "edu_cabut"   },
    ],
    [
      { text: "🔧 Tambal Gigi",            callback_data: "edu_tambal"  },
      { text: "🩺 Perawatan Saluran Akar", callback_data: "edu_saluran" },
    ],
    [
      { text: "✨ Pemutihan Gigi",         callback_data: "edu_putih"   },
      { text: "💎 Veneer",                 callback_data: "edu_veneer"  },
    ],
    [
      { text: "👶 Gigi Anak",              callback_data: "edu_anak"    },
    ],
    [
      { text: "⬅️ Kembali ke Menu Utama", callback_data: "menu" },
    ],
  ],
};

// ── Format week schedule ──────────────────────────────────────────────────────
function formatWeekSchedule(week) {
  const available = (week ?? []).filter(d => d.slots && d.slots.length > 0);
  if (available.length === 0) {
    return "😔 Belum ada jadwal tersedia minggu ini.\nSilakan coba minggu depan atau hubungi langsung melalui WhatsApp.";
  }
  const lines = ["📅 <b>Jadwal Praktik Tersedia:</b>\n"];
  for (const day of available) {
    const d = parseISO(day.date);
    const label = d ? fmtDate(d) : day.date;
    lines.push(`📌 <b>${label}</b>`);
    lines.push(`   ⏰ ${day.slots.join("  •  ")}`);
    lines.push("");
  }
  return lines.join("\n").trim();
}

// ── Show date picker ──────────────────────────────────────────────────────────
async function showDatePicker(chatId) {
  await sendMessage(chatId, "🔍 Mengambil jadwal tersedia...");
  try {
    const today = todayISO();
    const [week, nextWeek] = await Promise.all([
      gsheetCall("sch_get_week", { koasId: "bunga", weekStart: today }),
      gsheetCall("sch_get_week", { koasId: "bunga", weekStart: plusDays(today, 7) }),
    ]);
    const allDays   = [...(Array.isArray(week) ? week : []), ...(Array.isArray(nextWeek) ? nextWeek : [])];
    const available = allDays.filter(d => d.slots && d.slots.length > 0);

    if (available.length === 0) {
      return sendMessage(
        chatId,
        "😔 Maaf, belum ada jadwal tersedia dalam 2 minggu ke depan.\n\nSilakan hubungi kami langsung via WhatsApp untuk jadwal terbaru.",
        { reply_markup: { inline_keyboard: [[{ text: "⬅️ Menu Utama", callback_data: "menu" }]] } }
      );
    }

    const dateButtons = available.map(day => {
      const d     = parseISO(day.date);
      const label = d ? `${DAYS_ID[d.getDay()]} ${d.getDate()} ${MONTHS_ID[d.getMonth()]}` : day.date;
      return [{ text: `📅 ${label} (${day.slots.length} slot)`, callback_data: `book_date_${day.date}` }];
    });
    dateButtons.push([{ text: "❌ Batalkan", callback_data: "cancel_booking" }]);

    return sendMessage(
      chatId,
      "📅 <b>Pilih Tanggal</b>\n\nBerikut tanggal yang tersedia:",
      { parse_mode: "HTML", reply_markup: { inline_keyboard: dateButtons } }
    );
  } catch (e) {
    console.error("[showDatePicker]", e.message);
    return sendMessage(chatId, "Gagal mengambil jadwal. Coba lagi?", {
      reply_markup: { inline_keyboard: [[{ text: "🔄 Coba Lagi", callback_data: "booking_pick_date" }]] },
    });
  }
}

// ── handleStart ───────────────────────────────────────────────────────────────
async function handleStart(chatId, firstName) {
  resetSession(chatId);
  const name = firstName ? ` ${firstName}` : "";
  return sendMessage(
    chatId,
    `Halo${name}! 😊 Selamat datang di layanan Bot Klinik Gigi drg. Natasya Bunga Maureen 🦷\n\nSaya siap membantu kamu dengan:\n• Info layanan & tindakan gigi\n• Cek jadwal praktik\n• Buat janji temu\n\nPilih menu di bawah ya!`,
    { reply_markup: MAIN_MENU, parse_mode: "HTML" }
  );
}

// ── handleCallback ────────────────────────────────────────────────────────────
async function handleCallback(chatId, callbackQueryId, data, firstName) {
  if (callbackQueryId) await answerCallbackQuery(callbackQueryId);
  pruneExpired();

  if (data === "menu") return handleStart(chatId, firstName);

  // ── Jadwal ─────────────────────────────────────────────────────────────────
  if (data === "jadwal") {
    await sendMessage(chatId, "🔍 Mengecek jadwal praktik...");
    try {
      const today = todayISO();
      const raw   = await gsheetCall("sch_get_week", { koasId: "bunga", weekStart: today });
      const msg   = formatWeekSchedule(Array.isArray(raw) ? raw : []);
      return sendMessage(chatId, msg, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "📋 Buat Janji Temu", callback_data: "booking" }],
            [{ text: "⬅️ Menu Utama",       callback_data: "menu"    }],
          ],
        },
      });
    } catch {
      return sendMessage(chatId, "Maaf, jadwal sedang tidak dapat diakses. Silakan hubungi kami via WhatsApp 🙏");
    }
  }

  // ── Edu menu ───────────────────────────────────────────────────────────────
  if (data === "edu_menu") {
    return sendMessage(
      chatId,
      "🦷 <b>Informasi Tindakan Gigi</b>\n\nPilih tindakan yang ingin kamu ketahui lebih lanjut:",
      { reply_markup: EDU_MENU, parse_mode: "HTML" }
    );
  }

  if (data.startsWith("edu_")) {
    const key     = data.replace("edu_", "");
    const content = EDU[key];
    if (content) {
      return sendMessage(chatId, content, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "📋 Buat Janji Temu",   callback_data: "booking"  }],
            [{ text: "⬅️ Tindakan Lainnya",  callback_data: "edu_menu" }],
            [{ text: "🏠 Menu Utama",         callback_data: "menu"     }],
          ],
        },
      });
    }
    return;
  }

  // ── Kontak ─────────────────────────────────────────────────────────────────
  if (data === "kontak") {
    return sendMessage(
      chatId,
      `📞 <b>Kontak & Lokasi Klinik</b>

👩‍⚕️ <b>drg. Natasya Bunga Maureen</b>
🏥 Klinik Gigi RSGM / Klinik Stase

📅 Jadwal & reservasi bisa dilakukan langsung melalui bot ini!`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "⬅️ Menu Utama", callback_data: "menu" }],
          ],
        },
      }
    );
  }

  // ── Tentang ────────────────────────────────────────────────────────────────
  if (data === "tentang") {
    return sendMessage(
      chatId,
      `👩‍⚕️ <b>drg. Natasya Bunga Maureen</b>

Koas Kedokteran Gigi yang sedang menempuh stase klinik.

<b>Komitmen kami:</b>
✅ Pelayanan yang ramah & profesional
✅ Penjelasan yang jelas sebelum setiap tindakan
✅ Pasien merasa nyaman & tidak panik
✅ Tindakan yang hati-hati & teliti

<i>"Gigi sehat bukan sekadar penampilan — itu tentang kualitas hidup yang lebih baik."</i> 😊`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "📋 Buat Janji Temu",   callback_data: "booking"  }],
            [{ text: "🦷 Info Tindakan Gigi", callback_data: "edu_menu" }],
            [{ text: "⬅️ Menu Utama",         callback_data: "menu"     }],
          ],
        },
      }
    );
  }

  // ── Booking start ──────────────────────────────────────────────────────────
  if (data === "booking") {
    resetSession(chatId);
    setSession(chatId, { step: "BOOK_NAME", draft: {} });
    return sendMessage(
      chatId,
      `📋 <b>Buat Janji Temu</b>

Saya akan bantu kamu membuat reservasi! Cukup jawab beberapa pertanyaan berikut 😊

Pertama, ketik <b>nama lengkap</b> kamu:`,
      {
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: [[{ text: "❌ Batalkan", callback_data: "cancel_booking" }]] },
      }
    );
  }

  // ── Cancel booking ─────────────────────────────────────────────────────────
  if (data === "cancel_booking") {
    resetSession(chatId);
    return sendMessage(chatId, "Reservasi dibatalkan. Tidak apa-apa, kamu bisa mulai lagi kapan saja! 😊", {
      reply_markup: MAIN_MENU,
      parse_mode: "HTML",
    });
  }

  // ── Book: date chosen ──────────────────────────────────────────────────────
  if (data.startsWith("book_date_")) {
    const date = data.replace("book_date_", "");
    const sess = getSession(chatId);
    await sendMessage(chatId, "⏳ Mengecek slot tersedia...");
    try {
      const raw   = await gsheetCall("sch_get", { koasId: "bunga", date });
      const slots = raw?.slots ?? [];

      if (slots.length === 0) {
        return sendMessage(chatId, "😔 Maaf, tidak ada slot tersedia pada tanggal ini. Pilih tanggal lain:", {
          reply_markup: { inline_keyboard: [[{ text: "⬅️ Pilih Tanggal Lain", callback_data: "booking_pick_date" }]] },
        });
      }

      setSession(chatId, { step: "BOOK_TIME", draft: { ...sess.draft, date, slots } });

      const d         = parseISO(date);
      const dateLabel = d ? fmtDate(d) : date;

      const slotButtons = [];
      for (let i = 0; i < slots.length; i += 2) {
        const row = [{ text: `⏰ ${slots[i]}`, callback_data: `book_time_${slots[i]}` }];
        if (slots[i + 1]) row.push({ text: `⏰ ${slots[i + 1]}`, callback_data: `book_time_${slots[i + 1]}` });
        slotButtons.push(row);
      }
      slotButtons.push([{ text: "❌ Batalkan", callback_data: "cancel_booking" }]);

      return sendMessage(
        chatId,
        `📅 Tanggal dipilih: <b>${dateLabel}</b>\n\nPilih <b>jam</b> yang kamu inginkan:`,
        { parse_mode: "HTML", reply_markup: { inline_keyboard: slotButtons } }
      );
    } catch (e) {
      console.error("[book_date]", e.message);
      return sendMessage(chatId, "Terjadi kesalahan saat mengambil jadwal. Coba lagi?", {
        reply_markup: { inline_keyboard: [[{ text: "🔄 Coba Lagi", callback_data: `book_date_${date}` }]] },
      });
    }
  }

  // ── Book: time chosen ──────────────────────────────────────────────────────
  if (data.startsWith("book_time_")) {
    const time = data.replace("book_time_", "");
    const sess = getSession(chatId);
    setSession(chatId, { step: "BOOK_CONFIRM", draft: { ...sess.draft, time } });

    const d         = parseISO(sess.draft.date ?? "");
    const dateLabel = d ? fmtDate(d) : (sess.draft.date ?? "-");

    return sendMessage(
      chatId,
      `📋 <b>Konfirmasi Janji Temu</b>

👤 <b>Nama:</b> ${sess.draft.name}
📱 <b>No. HP:</b> ${sess.draft.phone}
📅 <b>Tanggal:</b> ${dateLabel}
⏰ <b>Jam:</b> ${time}
💬 <b>Keluhan:</b> ${sess.draft.complaint}

Apakah data di atas sudah benar?`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✅ Ya, Konfirmasi!", callback_data: "booking_confirm_yes" },
              { text: "❌ Batalkan",        callback_data: "cancel_booking"      },
            ],
          ],
        },
      }
    );
  }

  // ── Book: confirm ──────────────────────────────────────────────────────────
  if (data === "booking_confirm_yes") {
    const sess = getSession(chatId);
    const { name, phone, complaint, date, time } = sess.draft;

    if (!name || !phone || !complaint || !date || !time) {
      return sendMessage(chatId, "Data tidak lengkap. Silakan mulai ulang proses reservasi.", {
        reply_markup: { inline_keyboard: [[{ text: "🔄 Mulai Ulang", callback_data: "booking" }]] },
      });
    }

    await sendMessage(chatId, "⏳ Memproses reservasi kamu...");

    try {
      const result = await gsheetCall("apt_create", {
        patientName:  name,
        patientPhone: phone,
        patientEmail: "",
        koasId:       "bunga",
        date,
        time,
        complaint,
      });

      resetSession(chatId);

      if (result?.error) {
        return sendMessage(
          chatId,
          `😔 Maaf, <b>${result.error}</b>\n\nSlot ini mungkin sudah diambil. Silakan pilih waktu lain ya!`,
          {
            parse_mode: "HTML",
            reply_markup: { inline_keyboard: [[{ text: "🔄 Pilih Waktu Lain", callback_data: "booking" }]] },
          }
        );
      }

      const d         = parseISO(date);
      const dateLabel = d ? fmtDate(d) : date;

      return sendMessage(
        chatId,
        `🎉 <b>Reservasi Berhasil!</b>

✅ Janji temu kamu telah dibuat!

📋 <b>Detail Reservasi:</b>
👤 Nama: <b>${name}</b>
📅 Tanggal: <b>${dateLabel}</b>
⏰ Jam: <b>${time}</b>
💬 Keluhan: ${complaint}

<b>Yang perlu diperhatikan:</b>
• Hadir <b>10–15 menit</b> sebelum waktu janji
• Bawa kartu identitas
• Jika ingin membatalkan, segera hubungi kami

Sampai jumpa ya! Jangan khawatir, kami akan memastikan kamu merasa nyaman 😊🦷`,
        {
          parse_mode: "HTML",
          reply_markup: { inline_keyboard: [[{ text: "🏠 Kembali ke Menu", callback_data: "menu" }]] },
        }
      );
    } catch (e) {
      console.error("[booking_confirm]", e.message);
      return sendMessage(chatId, "Terjadi kesalahan jaringan. Coba lagi ya?", {
        reply_markup: { inline_keyboard: [[{ text: "🔄 Coba Lagi", callback_data: "booking_confirm_yes" }]] },
      });
    }
  }

  // ── Re-pick date ───────────────────────────────────────────────────────────
  if (data === "booking_pick_date") {
    return showDatePicker(chatId);
  }
}

// ── handleMessage ─────────────────────────────────────────────────────────────
async function handleMessage(chatId, text, firstName) {
  pruneExpired();
  const t  = (text ?? "").trim();
  const tl = t.toLowerCase();
  const s  = getSession(chatId);

  // Commands
  if (t === "/start" || t === "/menu") return handleStart(chatId, firstName);
  if (t === "/jadwal")                 return handleCallback(chatId, "", "jadwal", firstName);
  if (t === "/booking" || t === "/reservasi") return handleCallback(chatId, "", "booking", firstName);
  if (t === "/info")                   return handleCallback(chatId, "", "edu_menu", firstName);
  if (t === "/batal" || t === "/cancel") {
    resetSession(chatId);
    return sendMessage(chatId, "Dibatalkan. Ada yang bisa saya bantu lagi?", {
      reply_markup: MAIN_MENU, parse_mode: "HTML",
    });
  }

  // Booking flow
  if (s.step === "BOOK_NAME") {
    if (t.length < 2) return sendMessage(chatId, "Nama terlalu pendek. Ketik nama lengkap kamu ya 😊");
    setSession(chatId, { step: "BOOK_PHONE", draft: { ...s.draft, name: t } });
    return sendMessage(
      chatId,
      `Hai <b>${t}</b>! 👋\n\nSekarang masukkan <b>nomor HP / WhatsApp</b> kamu (contoh: 081234567890):`,
      {
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: [[{ text: "❌ Batalkan", callback_data: "cancel_booking" }]] },
      }
    );
  }

  if (s.step === "BOOK_PHONE") {
    const phone = t.replace(/\s|-/g, "");
    if (!/^(\+62|62|08)\d{8,12}$/.test(phone)) {
      return sendMessage(chatId, "Nomor HP tidak valid. Format yang benar contoh: <b>081234567890</b> 😊", {
        parse_mode: "HTML",
      });
    }
    setSession(chatId, { step: "BOOK_COMPLAINT", draft: { ...s.draft, phone } });
    return sendMessage(
      chatId,
      "Oke! 📝 Sekarang ceritakan <b>keluhan atau tujuan</b> kamu ke klinik gigi.\n\n<i>Contoh: Gigi berlubang, mau scaling, sakit gigi geraham, dll.</i>",
      {
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: [[{ text: "❌ Batalkan", callback_data: "cancel_booking" }]] },
      }
    );
  }

  if (s.step === "BOOK_COMPLAINT") {
    if (t.length < 3) return sendMessage(chatId, "Ceritakan sedikit lebih detail ya supaya dokter bisa mempersiapkan diri 😊");
    setSession(chatId, { step: "BOOK_DATE", draft: { ...s.draft, complaint: t } });
    return showDatePicker(chatId);
  }

  // IDLE: keyword detection
  if (s.step === "IDLE") {
    if (tl.includes("scaling") || tl.includes("karang"))              return handleCallback(chatId, "", "edu_scaling", firstName);
    if (tl.includes("cabut") || tl.includes("mencabut"))              return handleCallback(chatId, "", "edu_cabut", firstName);
    if (tl.includes("tambal") || tl.includes("berlubang") || tl.includes("lubang")) return handleCallback(chatId, "", "edu_tambal", firstName);
    if (tl.includes("saluran akar") || tl.includes("psa") || tl.includes("syaraf")) return handleCallback(chatId, "", "edu_saluran", firstName);
    if (tl.includes("putih") || tl.includes("bleach"))                return handleCallback(chatId, "", "edu_putih", firstName);
    if (tl.includes("veneer"))                                         return handleCallback(chatId, "", "edu_veneer", firstName);
    if (tl.includes("anak"))                                           return handleCallback(chatId, "", "edu_anak", firstName);
    if (tl.includes("jadwal") || tl.includes("praktek") || tl.includes("buka") || tl.includes("jam")) return handleCallback(chatId, "", "jadwal", firstName);
    if (tl.includes("reservasi") || tl.includes("booking") || tl.includes("daftar") || tl.includes("janji")) return handleCallback(chatId, "", "booking", firstName);
    if (tl.includes("kontak") || tl.includes("alamat") || tl.includes("lokasi"))  return handleCallback(chatId, "", "kontak", firstName);
    if (tl.includes("harga") || tl.includes("biaya") || tl.includes("tarif") || tl.includes("berapa")) {
      return sendMessage(
        chatId,
        `💰 <b>Informasi Biaya</b>

Biaya tindakan bervariasi tergantung kondisi gigi.

✅ Datang untuk konsultasi — dokter akan mengevaluasi dan menjelaskan biaya sebelum tindakan. Tidak ada kejutan! 😊

Mau buat janji konsultasi?`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "📋 Buat Janji Temu", callback_data: "booking" }],
              [{ text: "⬅️ Menu Utama",      callback_data: "menu"    }],
            ],
          },
        }
      );
    }
    if (tl.includes("sakit") || tl.includes("nyeri") || tl.includes("ngilu")) {
      return sendMessage(
        chatId,
        `😟 <b>Gigi Sakit/Ngilu?</b>

Jangan tunda ya! Sakit gigi bisa semakin parah kalau dibiarkan.

<b>Pertolongan sementara:</b>
• Obat pereda nyeri (Paracetamol/Ibuprofen) bisa membantu
• Hindari makanan/minuman terlalu panas atau dingin

<b>Segera buat janji temu</b> agar dokter bisa menangani dengan tepat 🦷`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "📋 Buat Janji Sekarang!", callback_data: "booking" }],
              [{ text: "⬅️ Menu Utama",           callback_data: "menu"    }],
            ],
          },
        }
      );
    }

    // Fallback
    return sendMessage(
      chatId,
      `Halo! 😊 Saya belum mengerti maksud pesanmu.\n\nBerikut yang bisa saya bantu:`,
      { reply_markup: MAIN_MENU, parse_mode: "HTML" }
    );
  }

  // Mid-booking text interrupt
  return sendMessage(
    chatId,
    "Hmm, sepertinya kamu sedang dalam proses reservasi. Mau melanjutkan atau batalkan?",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "▶️ Lanjutkan", callback_data: "menu"          }],
          [{ text: "❌ Batalkan",  callback_data: "cancel_booking" }],
        ],
      },
    }
  );
}

// ── Process a single update ───────────────────────────────────────────────────
async function processUpdate(update) {
  try {
    if (update.message) {
      const msg       = update.message;
      const chatId    = msg.chat.id;
      const text      = msg.text ?? "";
      const firstName = msg.from?.first_name ?? "";
      await handleMessage(chatId, text, firstName);
    }

    if (update.callback_query) {
      const cq        = update.callback_query;
      const chatId    = cq.message?.chat?.id;
      const queryId   = cq.id;
      const data      = cq.data ?? "";
      const firstName = cq.from?.first_name ?? "";
      await handleCallback(chatId, queryId, data, firstName);
    }
  } catch (e) {
    console.error("❌ Error processing update:", e.message);
  }
}

// ── Polling loop ──────────────────────────────────────────────────────────────
let offset = 0;

async function poll() {
  try {
    const res  = await fetch(
      `${BASE}/getUpdates?offset=${offset}&timeout=30&allowed_updates=message,callback_query`,
      { signal: AbortSignal.timeout(40000) }
    );
    const data = await res.json();

    if (!data.ok) {
      console.error("❌ getUpdates error:", data.description);
      await sleep(5000);
      return;
    }

    for (const update of data.result) {
      offset = update.update_id + 1;
      const who  = update.message?.from?.first_name ?? update.callback_query?.from?.first_name ?? "?";
      const text = update.message?.text ?? `[btn: ${update.callback_query?.data}]` ?? "";
      console.log(`📨  #${update.update_id} ${who}: ${text}`);
      await processUpdate(update);
    }
  } catch (e) {
    if (e.name !== "AbortError") console.error("❌ Poll error:", e.message);
    await sleep(3000);
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Remove webhook so polling works ──────────────────────────────────────────
async function init() {
  // Delete any existing webhook
  const del = await fetch(`${BASE}/deleteWebhook`, { method: "POST" }).then(r => r.json());
  if (del.ok) console.log("✅  Webhook removed — polling mode active");

  // Get bot info
  const me = await fetch(`${BASE}/getMe`).then(r => r.json());
  if (me.ok) console.log(`🤖  Bot: @${me.result.username} (${me.result.first_name})`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log("🦷  drg. Natasya Bunga Maureen — Telegram Bot (Standalone)");
  console.log("─────────────────────────────────────────────────────────");
  console.log(`🔑  Token: ${TOKEN.slice(0, 10)}...`);
  console.log(`📊  GSheet: ${GSHEET_URL ? "configured" : "NOT SET ⚠️"}`);
  console.log("");

  await init();
  console.log("\n✅  Bot is running! Send a message to your bot on Telegram.\n");
  console.log("Press Ctrl+C to stop.\n");

  while (true) {
    await poll();
  }
})();

