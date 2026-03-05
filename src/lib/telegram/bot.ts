/**
 * Core bot logic for drg. Natasya Bunga Maureen — Telegram Bot
 *
 * Features:
 *  • Info & edukasi tindakan gigi (scaling, cabut, tambal, dll.)
 *  • Cek jadwal praktik hari ini & minggu ini
 *  • Reservasi janji temu (form step-by-step)
 *  • Bahasa ramah & menenangkan pasien
 *  • Semua info klinik (nama, WA, alamat, layanan) diambil langsung
 *    dari Google Sheets — sinkron otomatis dengan website ✅
 */

import { sendMessage, answerCallbackQuery } from "./api";
import {
  getSession, setSession, resetSession, pruneExpired,
} from "./sessions";

// ── Gsheet helper (reuse existing client) ─────────────────────────────────────
const API_URL = process.env.GSHEET_API_URL ?? "";
const SECRET  = process.env.GSHEET_SECRET  ?? "";

// ── Clinic settings (fetched from Google Sheets, cached 5 min) ───────────────
interface ClinicSettings {
  clinicName:          string;
  doctorName:          string;
  phone:               string;
  whatsapp:            string;
  address:             string;
  services:            string[];
  instagramUrl:        string;
  lineId:              string;
  announcement:        string;
  workHourStart:       string;
  workHourEnd:         string;
}

const SETTINGS_DEFAULT: ClinicSettings = {
  clinicName:    "Klinik Gigi drg. Natasya Bunga Maureen",
  doctorName:    "Natasya Bunga Maureen",
  phone:         "",
  whatsapp:      "",
  address:       "Klinik Gigi RSGM / Klinik Stase",
  services:      ["Pemeriksaan Gigi","Pencabutan Gigi","Penambalan Gigi","Pembersihan Karang Gigi","Perawatan Saluran Akar"],
  instagramUrl:  "",
  lineId:        "",
  announcement:  "",
  workHourStart: "08:00",
  workHourEnd:   "16:00",
};

let _settingsCache: ClinicSettings | null = null;
let _settingsCachedAt = 0;
const SETTINGS_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function getSettings(): Promise<ClinicSettings> {
  // Return from cache if still fresh
  if (_settingsCache && Date.now() - _settingsCachedAt < SETTINGS_TTL_MS) {
    return _settingsCache;
  }
  try {
    const raw = await gsheetCall("settings_get") as Record<string, unknown>;
    if (!raw || raw.error) return SETTINGS_DEFAULT;

    // Parse services if stored as JSON string
    let services = SETTINGS_DEFAULT.services;
    if (Array.isArray(raw.services)) services = raw.services as string[];
    else if (typeof raw.services === "string") {
      try { services = JSON.parse(raw.services); } catch { /* keep default */ }
    }

    // Strip any leading "drg." the admin may have typed
    const doctorName = String(raw.doctorName ?? SETTINGS_DEFAULT.doctorName)
      .replace(/^drg\.?\s*/i, "").trim() || SETTINGS_DEFAULT.doctorName;

    _settingsCache = {
      clinicName:    String(raw.clinicName    ?? SETTINGS_DEFAULT.clinicName),
      doctorName,
      phone:         String(raw.phone         ?? ""),
      whatsapp:      String(raw.whatsapp      ?? ""),
      address:       String(raw.address       ?? SETTINGS_DEFAULT.address),
      services,
      instagramUrl:  String(raw.instagramUrl  ?? ""),
      lineId:        String(raw.lineId        ?? ""),
      announcement:  String(raw.announcement  ?? ""),
      workHourStart: String(raw.workHourStart ?? SETTINGS_DEFAULT.workHourStart),
      workHourEnd:   String(raw.workHourEnd   ?? SETTINGS_DEFAULT.workHourEnd),
    };
    _settingsCachedAt = Date.now();
    return _settingsCache;
  } catch {
    return _settingsCache ?? SETTINGS_DEFAULT;
  }
}

async function gsheetCall(action: string, params: Record<string, unknown> = {}): Promise<unknown> {
  if (!API_URL) {
    console.error("[bot] GSHEET_API_URL is not set — cannot call:", action);
    throw new Error("GSHEET_API_URL tidak dikonfigurasi");
  }
  const payload = JSON.stringify({ token: SECRET, action, ...params });
  const url     = `${API_URL}?payload=${encodeURIComponent(payload)}`;
  // 25-second timeout so we don't hang a Vercel function indefinitely
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(url, { cache: "no-store", signal: controller.signal });
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

// ── Date helpers ──────────────────────────────────────────────────────────────
const DAYS_ID   = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const MONTHS_ID = ["Januari","Februari","Maret","April","Mei","Juni",
                   "Juli","Agustus","September","Oktober","November","Desember"];

function fmtDateLocal(d: Date) {
  return `${DAYS_ID[d.getDay()]}, ${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

function parseDateISO(raw: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return isNaN(d.getTime()) ? null : d;
}

function todayISO(): string {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
}

function plusDays(iso: string, n: number): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)!;
  const d = new Date(+m[1], +m[2]-1, +m[3]);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

// ── Education content ─────────────────────────────────────────────────────────
const EDU: Record<string, string> = {
  scaling: `🦷 <b>Scaling (Pembersihan Karang Gigi)</b>

Karang gigi adalah kotoran yang sudah mengeras dan <i>tidak bisa hilang hanya dengan sikat gigi biasa</i>.

<b>Prosesnya:</b>
• Dokter menggunakan alat ultrasonik yang bergetar untuk melepas karang gigi
• Terasa sedikit seperti "getaran" di gigi, <b>tidak sakit</b> ✅
• Durasi: sekitar <b>30–60 menit</b>

<b>Kenapa penting?</b>
Karang gigi bisa menyebabkan gusi meradang (periodontitis), gigi goyang, sampai gigi harus dicabut. Scaling = investasi untuk gigi sehat jangka panjang! 😊

<b>Setelah scaling:</b>
• Hindari makanan/minuman berwarna gelap 24 jam pertama
• Gigi mungkin terasa lebih sensitif 1–2 hari — ini <b>normal</b>
• Sikat gigi 2x sehari secara rutin`,

  cabut: `🦷 <b>Pencabutan Gigi</b>

Tenang ya, prosedur ini <i>jauh lebih nyaman</i> dari yang dibayangkan! 😊

<b>Langkah-langkahnya:</b>
1. Dokter memberikan <b>anestesi lokal</b> (suntik kecil di gusi) — Anda hanya akan terasa seperti dicubit sebentar
2. Tunggu 5 menit sampai area mati rasa sepenuhnya
3. Proses pencabutan sendiri biasanya hanya <b>1–5 menit</b> dan <b>tidak terasa sakit</b>
4. Menggigit kapas selama 30 menit setelah selesai

<b>Yang perlu dilakukan setelah cabut:</b>
• Jangan berkumur-kumur kuat 24 jam pertama
• Hindari makanan panas & keras
• Obat nyeri (jika perlu) akan diberikan dokter
• Nyeri ringan 1–2 hari setelah anestesi habis adalah <b>normal</b>`,

  tambal: `🦷 <b>Penambalan Gigi (Tumpatan Komposit)</b>

Gigi berlubang? Jangan tunda! Semakin kecil lubangnya, semakin mudah ditambal 😊

<b>Prosesnya:</b>
1. Area gigi dibersihkan & diberi anestesi lokal (jika diperlukan)
2. Bagian berlubang dibersihkan dengan bur halus
3. Gigi ditambal dengan bahan komposit <b>satu warna dengan gigi</b> — jadi tidak ketahuan! ✨
4. Bahan disinari dengan lampu khusus agar mengeras sempurna

<b>Durasi:</b> 30–60 menit tergantung ukuran lubang

<b>Perawatan setelah tambal:</b>
• Hindari menggigit keras-keras dulu 24 jam pertama
• Kalau terasa ada yang mengganjal, kembali ke dokter untuk disesuaikan`,

  saluran: `🦷 <b>Perawatan Saluran Akar (PSA)</b>

PSA dilakukan ketika bakteri sudah masuk ke dalam akar gigi. Tujuannya adalah <i>menyelamatkan gigi agar tidak perlu dicabut</i>.

<b>Prosesnya (biasanya 2–3 kunjungan):</b>
1. Anestesi lokal → dokter membuka mahkota gigi
2. Jaringan terinfeksi di dalam saluran akar dibersihkan
3. Saluran akar dibentuk & disterilkan
4. Kunjungan berikutnya: saluran diisi dengan bahan khusus
5. Gigi ditutup dengan tambalan atau mahkota gigi (crown)

<b>Apakah sakit?</b> Dengan anestesi yang baik, prosedur ini <b>tidak sakit</b>. Rasa tidak nyaman ringan setelah prosedur bisa diatasi dengan obat nyeri biasa.`,

  putih: `🦷 <b>Pemutihan Gigi (Bleaching)</b>

Ingin gigi lebih cerah? Bleaching adalah solusi yang aman kalau dilakukan oleh dokter gigi 😁

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

  pembersihan: `🦷 <b>Scaling (Pembersihan Karang Gigi)</b>

Sama dengan scaling ya! Ini prosedur yang paling sering dilakukan dan sangat bermanfaat untuk kesehatan mulut secara keseluruhan 😊

→ Lihat detail di menu <b>"Scaling / Karang Gigi"</b>`,

  veneer: `🦷 <b>Veneer Gigi</b>

Veneer adalah lapisan tipis (seperti "kuku") yang ditempelkan di depan gigi untuk memperbaiki warna, bentuk, atau ukuran gigi.

<b>Cocok untuk:</b>
• Gigi berwarna kuning/kusam yang tidak respons terhadap bleaching
• Gigi retak atau tergores
• Gigi yang sedikit tidak rata

<b>Prosesnya:</b>
1. Konsultasi & perencanaan estetika
2. Permukaan gigi dihaluskan sedikit (minimal)
3. Veneer dibuat di lab (1–2 minggu)
4. Veneer ditempelkan dengan semen khusus

<b>Hasil:</b> Senyum yang lebih cerah & rapi secara permanen ✨`,

  anak: `🦷 <b>Perawatan Gigi Anak</b>

Kami memahami bahwa anak-anak bisa merasa cemas saat ke dokter gigi. Kami akan membuat pengalaman ini <b>menyenangkan</b>! 🌈

<b>Layanan untuk anak:</b>
• Pemeriksaan rutin & pembersihan
• Penambalan gigi susu
• Perawatan fissure sealant (pencegahan lubang)
• Fluoride aplikasi (memperkuat email gigi)
• Pencabutan gigi susu yang sudah waktunya

<b>Rekomendasi:</b> Anak sebaiknya mulai ke dokter gigi sejak gigi pertama tumbuh (± usia 1 tahun) atau paling lambat usia 3 tahun.`,
};

// ── Main menu keyboard ────────────────────────────────────────────────────────
const MAIN_MENU = {
  inline_keyboard: [
    [
      { text: "📅 Jadwal Praktik", callback_data: "jadwal" },
      { text: "📋 Buat Janji Temu", callback_data: "booking" },
    ],
    [
      { text: "🦷 Info Tindakan Gigi", callback_data: "edu_menu" },
      { text: "📞 Kontak & Lokasi", callback_data: "kontak" },
    ],
    [
      { text: "❓ Tentang drg. Bunga", callback_data: "tentang" },
    ],
  ],
};

const EDU_MENU = {
  inline_keyboard: [
    [
      { text: "🪥 Scaling / Karang Gigi", callback_data: "edu_scaling" },
      { text: "🦷 Cabut Gigi",            callback_data: "edu_cabut"   },
    ],
    [
      { text: "🔧 Tambal Gigi",            callback_data: "edu_tambal"  },
      { text: "🩺 Perawatan Saluran Akar", callback_data: "edu_saluran" },
    ],
    [
      { text: "✨ Pemutihan Gigi",          callback_data: "edu_putih"   },
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

// ── Format schedule display ───────────────────────────────────────────────────
interface ScheduleEntry { date: string; slots: string[]; }

function formatWeekSchedule(week: ScheduleEntry[]): string {
  const available = week.filter(d => d.slots && d.slots.length > 0);
  if (available.length === 0) {
    return "😔 Belum ada jadwal tersedia minggu ini.\nSilakan coba minggu depan atau hubungi langsung melalui WhatsApp.";
  }

  const lines: string[] = ["📅 <b>Jadwal Praktik Tersedia:</b>\n"];
  for (const day of available) {
    const d = parseDateISO(day.date);
    const label = d ? fmtDateLocal(d) : day.date;
    lines.push(`📌 <b>${label}</b>`);
    lines.push(`   ⏰ ${day.slots.join("  •  ")}`);
    lines.push("");
  }
  return lines.join("\n").trim();
}

// ── Handle /start and /menu ───────────────────────────────────────────────────
async function handleStart(chatId: number, firstName: string) {
  resetSession(chatId);
  const s    = await getSettings();
  const name = firstName ? ` ${firstName}` : "";
  await sendMessage(
    chatId,
    `Halo${name}! 😊 Selamat datang di layanan Bot <b>${s.clinicName}</b> 🦷\n\nSaya siap membantu kamu dengan:\n• Info layanan & tindakan gigi\n• Cek jadwal praktik\n• Buat janji temu\n\nPilih menu di bawah ya!`,
    { reply_markup: MAIN_MENU, parse_mode: "HTML" }
  );
}

// ── Handle callback queries (button taps) ─────────────────────────────────────
export async function handleCallback(
  chatId:          number,
  callbackQueryId: string,
  data:            string,
  firstName:       string,
) {
  await answerCallbackQuery(callbackQueryId);
  pruneExpired();

  // ── Main menu ──────────────────────────────────────────────────────────────
  if (data === "menu") {
    return handleStart(chatId, firstName);
  }

  // ── Jadwal ─────────────────────────────────────────────────────────────────
  if (data === "jadwal") {
    await sendMessage(chatId, "🔍 Mengecek jadwal praktik...", { parse_mode: "HTML" });
    try {
      const today = todayISO();
      const raw   = await gsheetCall("sch_get_week", { koasId: "bunga", weekStart: today }) as ScheduleEntry[];
      const msg   = formatWeekSchedule(Array.isArray(raw) ? raw : []);
      await sendMessage(chatId, msg, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "📋 Buat Janji Temu", callback_data: "booking" }],
            [{ text: "⬅️ Menu Utama",       callback_data: "menu"    }],
          ],
        },
      });
    } catch {
      await sendMessage(chatId, "Maaf, jadwal sedang tidak dapat diakses. Silakan hubungi kami via WhatsApp 🙏");
    }
    return;
  }

  // ── Education menu ─────────────────────────────────────────────────────────
  if (data === "edu_menu") {
    await sendMessage(
      chatId,
      "🦷 <b>Informasi Tindakan Gigi</b>\n\nPilih tindakan yang ingin kamu ketahui lebih lanjut:",
      { reply_markup: EDU_MENU, parse_mode: "HTML" }
    );
    return;
  }

  if (data.startsWith("edu_")) {
    const key = data.replace("edu_", "");
    const content = EDU[key];
    if (content) {
      await sendMessage(chatId, content, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "📋 Buat Janji Temu", callback_data: "booking" }],
            [{ text: "⬅️ Tindakan Lainnya", callback_data: "edu_menu" }],
            [{ text: "🏠 Menu Utama",       callback_data: "menu"     }],
          ],
        },
      });
    }
    return;
  }

  // ── Kontak ─────────────────────────────────────────────────────────────────
  if (data === "kontak") {
    const s = await getSettings();
    const waNumber = s.whatsapp.replace(/\D/g, "").replace(/^0/, "62");
    const waUrl    = waNumber ? `https://wa.me/${waNumber}` : null;
    const webUrl   = process.env.NEXTAUTH_URL ?? "https://drg-bunga-appointment.vercel.app";

    const lines: string[] = [
      `📞 <b>Kontak & Lokasi Klinik</b>\n`,
      `👩‍⚕️ <b>drg. ${s.doctorName}</b>`,
      `🏥 ${s.address}`,
    ];
    if (s.phone)    lines.push(`📱 <b>Telepon:</b> ${s.phone}`);
    if (s.whatsapp) lines.push(`💬 <b>WhatsApp:</b> ${s.whatsapp}`);
    if (s.workHourStart && s.workHourEnd)
      lines.push(`🕐 <b>Jam Praktik:</b> ${s.workHourStart} – ${s.workHourEnd}`);
    if (s.instagramUrl) lines.push(`📸 <b>Instagram:</b> ${s.instagramUrl}`);
    if (s.lineId)       lines.push(`💚 <b>LINE:</b> ${s.lineId}`);
    lines.push(`\n📅 Reservasi & jadwal bisa langsung melalui bot ini!`);

    const keyboard: { text: string; url?: string; callback_data?: string }[][] = [];
    if (waUrl) keyboard.push([{ text: "💬 Chat WhatsApp", url: waUrl }]);
    keyboard.push([{ text: "🌐 Buka Website", url: webUrl }]);
    keyboard.push([{ text: "⬅️ Menu Utama", callback_data: "menu" }]);

    await sendMessage(chatId, lines.join("\n"), {
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: keyboard },
    });
    return;
  }

  // ── Tentang ────────────────────────────────────────────────────────────────
  if (data === "tentang") {
    const s = await getSettings();
    await sendMessage(
      chatId,
      `👩‍⚕️ <b>drg. ${s.doctorName}</b>

Koas Kedokteran Gigi yang sedang menempuh stase klinik.

<b>Layanan yang tersedia:</b>
${s.services.map(sv => `• ${sv}`).join("\n")}

<b>Komitmen kami:</b>
✅ Pelayanan yang ramah & profesional
✅ Penjelasan yang jelas sebelum setiap tindakan
✅ Pasien merasa nyaman & tidak panik
✅ Tindakan yang hati-hati & teliti

<i>"Gigi sehat bukan sekadar penampilan — itu tentang kualitas hidup yang lebih baik."</i> 😊

Jangan ragu untuk bertanya apapun tentang kesehatan gigimu!`,
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
    return;
  }

  // ── Booking start ──────────────────────────────────────────────────────────
  if (data === "booking") {
    resetSession(chatId);
    setSession(chatId, { step: "BOOK_NAME", draft: {} });
    await sendMessage(
      chatId,
      `📋 <b>Buat Janji Temu</b>

Saya akan bantu kamu membuat reservasi! Cukup jawab beberapa pertanyaan berikut 😊

Pertama, ketik <b>nama lengkap</b> kamu:`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Batalkan", callback_data: "cancel_booking" }]],
        },
      }
    );
    return;
  }

  // ── Cancel booking ─────────────────────────────────────────────────────────
  if (data === "cancel_booking") {
    resetSession(chatId);
    await sendMessage(chatId, "Reservasi dibatalkan. Tidak apa-apa, kamu bisa mulai lagi kapan saja! 😊", {
      reply_markup: MAIN_MENU,
      parse_mode: "HTML",
    });
    return;
  }

  // ── Booking: date selection ────────────────────────────────────────────────
  if (data.startsWith("book_date_")) {
    const date = data.replace("book_date_", "");
    const sess = getSession(chatId);

    // Fetch available slots for this date
    await sendMessage(chatId, "⏳ Mengecek slot tersedia...");
    try {
      const raw = await gsheetCall("sch_get", { koasId: "bunga", date }) as { date: string; slots: string[] };
      const slots = raw?.slots ?? [];

      if (slots.length === 0) {
        await sendMessage(chatId, "😔 Maaf, tidak ada slot tersedia pada tanggal ini. Silakan pilih tanggal lain:", {
          parse_mode: "HTML",
          reply_markup: { inline_keyboard: [[{ text: "⬅️ Pilih Tanggal Lain", callback_data: "booking_pick_date" }]] },
        });
        return;
      }

      setSession(chatId, { step: "BOOK_TIME", draft: { ...sess.draft, date, slots } });

      const d = parseDateISO(date);
      const dateLabel = d ? fmtDateLocal(d) : date;

      // Build slot grid (2 columns)
      const slotButtons: { text: string; callback_data: string }[][] = [];
      for (let i = 0; i < slots.length; i += 2) {
        const row: { text: string; callback_data: string }[] = [
          { text: `⏰ ${slots[i]}`, callback_data: `book_time_${slots[i]}` },
        ];
        if (slots[i + 1]) row.push({ text: `⏰ ${slots[i + 1]}`, callback_data: `book_time_${slots[i + 1]}` });
        slotButtons.push(row);
      }
      slotButtons.push([{ text: "❌ Batalkan", callback_data: "cancel_booking" }]);

      await sendMessage(
        chatId,
        `📅 Tanggal dipilih: <b>${dateLabel}</b>\n\nPilih <b>jam</b> yang kamu inginkan:`,
        { parse_mode: "HTML", reply_markup: { inline_keyboard: slotButtons } }
      );
    } catch {
      await sendMessage(chatId, "Maaf, terjadi kesalahan saat mengambil data jadwal. Coba lagi?", {
        reply_markup: { inline_keyboard: [[{ text: "🔄 Coba Lagi", callback_data: `book_date_${date}` }]] },
      });
    }
    return;
  }

  // ── Booking: time selection ────────────────────────────────────────────────
  if (data.startsWith("book_time_")) {
    const time = data.replace("book_time_", "");
    const sess = getSession(chatId);
    setSession(chatId, { step: "BOOK_CONFIRM", draft: { ...sess.draft, time } });

    const d = parseDateISO(sess.draft.date ?? "");
    const dateLabel = d ? fmtDateLocal(d) : (sess.draft.date ?? "-");

    await sendMessage(
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
              { text: "✅ Ya, Konfirmasi!",    callback_data: "booking_confirm_yes" },
              { text: "❌ Batalkan",            callback_data: "cancel_booking"      },
            ],
          ],
        },
      }
    );
    return;
  }

  // ── Booking: confirm submission ────────────────────────────────────────────
  if (data === "booking_confirm_yes") {
    const sess = getSession(chatId);
    const { name, phone, complaint, date, time } = sess.draft;

    if (!name || !phone || !complaint || !date || !time) {
      await sendMessage(chatId, "Data tidak lengkap. Silakan mulai ulang proses reservasi.", {
        reply_markup: { inline_keyboard: [[{ text: "🔄 Mulai Ulang", callback_data: "booking" }]] },
      });
      return;
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
      }) as Record<string, string>;

      resetSession(chatId);

      if (result.error) {
        await sendMessage(
          chatId,
          `😔 Maaf, <b>${result.error}</b>\n\nSlot ini mungkin sudah diambil orang lain. Silakan pilih waktu lain ya!`,
          {
            parse_mode: "HTML",
            reply_markup: { inline_keyboard: [[{ text: "🔄 Pilih Waktu Lain", callback_data: "booking" }]] },
          }
        );
        return;
      }

      const d = parseDateISO(date);
      const dateLabel = d ? fmtDateLocal(d) : date;

      await sendMessage(
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
• Jika ada perubahan atau ingin membatalkan, segera hubungi kami

Sampai jumpa ya! Jangan khawatir, kami akan memastikan kamu merasa nyaman 😊🦷`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "🏠 Kembali ke Menu", callback_data: "menu" }],
            ],
          },
        }
      );
    } catch {
      await sendMessage(chatId, "Terjadi kesalahan jaringan. Coba lagi ya?", {
        reply_markup: { inline_keyboard: [[{ text: "🔄 Coba Lagi", callback_data: "booking_confirm_yes" }]] },
      });
    }
    return;
  }

  // ── Booking: pick date (re-show jadwal) ────────────────────────────────────
  if (data === "booking_pick_date") {
    await showDatePicker(chatId);
    return;
  }
}

// ── Show available date picker ────────────────────────────────────────────────
async function showDatePicker(chatId: number) {
  await sendMessage(chatId, "🔍 Mengambil jadwal tersedia...");
  try {
    const today = todayISO();
    const raw   = await gsheetCall("sch_get_week", { koasId: "bunga", weekStart: today }) as ScheduleEntry[];
    const week  = Array.isArray(raw) ? raw : [];

    // Also check next 7 days beyond the initial week
    const nextWeek = await gsheetCall("sch_get_week", { koasId: "bunga", weekStart: plusDays(today, 7) }) as ScheduleEntry[];
    const allDays  = [...week, ...(Array.isArray(nextWeek) ? nextWeek : [])];
    const available = allDays.filter(d => d.slots && d.slots.length > 0);

    if (available.length === 0) {
      await sendMessage(
        chatId,
        "😔 Maaf, belum ada jadwal tersedia dalam 2 minggu ke depan.\n\nSilakan hubungi kami langsung via WhatsApp untuk informasi jadwal terbaru.",
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "⬅️ Menu Utama", callback_data: "menu" }],
            ],
          },
        }
      );
      return;
    }

    const dateButtons: { text: string; callback_data: string }[][] = available.map(day => {
      const d     = parseDateISO(day.date);
      const label = d ? `${DAYS_ID[d.getDay()]} ${d.getDate()} ${MONTHS_ID[d.getMonth()]}` : day.date;
      return [{ text: `📅 ${label} (${day.slots.length} slot)`, callback_data: `book_date_${day.date}` }];
    });
    dateButtons.push([{ text: "❌ Batalkan", callback_data: "cancel_booking" }]);

    await sendMessage(
      chatId,
      "📅 <b>Pilih Tanggal</b>\n\nBerikut tanggal yang tersedia:",
      { parse_mode: "HTML", reply_markup: { inline_keyboard: dateButtons } }
    );
  } catch {
    await sendMessage(chatId, "Gagal mengambil jadwal. Coba lagi?", {
      reply_markup: { inline_keyboard: [[{ text: "🔄 Coba Lagi", callback_data: "booking_pick_date" }]] },
    });
  }
}

// ── Handle text messages (conversation flow) ──────────────────────────────────
export async function handleMessage(chatId: number, text: string, firstName: string) {
  pruneExpired();
  const t    = text.trim();
  const tl   = t.toLowerCase();
  const sess = getSession(chatId);

  // ── Commands ───────────────────────────────────────────────────────────────
  if (t === "/start" || t === "/menu" || t === "/help") return handleStart(chatId, firstName);
  if (t === "/jadwal") {
    // shortcut
    return handleCallback(chatId, "", "jadwal", firstName);
  }
  if (t === "/booking" || t === "/reservasi") {
    return handleCallback(chatId, "", "booking", firstName);
  }
  if (t === "/info") {
    return handleCallback(chatId, "", "edu_menu", firstName);
  }
  if (t === "/batal" || t === "/cancel") {
    resetSession(chatId);
    return sendMessage(chatId, "Dibatalkan. Ada yang bisa saya bantu lagi?", {
      reply_markup: MAIN_MENU,
      parse_mode: "HTML",
    });
  }

  // ── Booking flow ───────────────────────────────────────────────────────────
  if (sess.step === "BOOK_NAME") {
    if (t.length < 2) {
      return sendMessage(chatId, "Nama terlalu pendek. Ketik nama lengkap kamu ya 😊");
    }
    setSession(chatId, { step: "BOOK_PHONE", draft: { ...sess.draft, name: t } });
    return sendMessage(
      chatId,
      `Hai <b>${t}</b>! 👋\n\nSekarang masukkan <b>nomor HP / WhatsApp</b> kamu (contoh: 081234567890):`,
      {
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: [[{ text: "❌ Batalkan", callback_data: "cancel_booking" }]] },
      }
    );
  }

  if (sess.step === "BOOK_PHONE") {
    const phone = t.replace(/\s|-/g, "");
    if (!/^(\+62|62|08)\d{8,12}$/.test(phone)) {
      return sendMessage(
        chatId,
        "Nomor HP tidak valid. Pastikan formatnya benar ya (contoh: <b>081234567890</b>) 😊",
        { parse_mode: "HTML" }
      );
    }
    setSession(chatId, { step: "BOOK_COMPLAINT", draft: { ...sess.draft, phone } });
    return sendMessage(
      chatId,
      "Oke! 📝 Sekarang ceritakan <b>keluhan atau tujuan</b> kamu datang ke klinik gigi.\n\n<i>Contoh: Gigi berlubang, mau scaling, sakit gigi geraham, dll.</i>",
      {
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: [[{ text: "❌ Batalkan", callback_data: "cancel_booking" }]] },
      }
    );
  }

  if (sess.step === "BOOK_COMPLAINT") {
    if (t.length < 3) {
      return sendMessage(chatId, "Ceritakan sedikit lebih detail ya supaya dokter bisa mempersiapkan diri 😊");
    }
    setSession(chatId, { step: "BOOK_DATE", draft: { ...sess.draft, complaint: t } });
    return showDatePicker(chatId);
  }

  // ── Free text: detect intent ───────────────────────────────────────────────
  if (sess.step === "IDLE") {
    // Keyword detection for education
    if (tl.includes("scaling") || tl.includes("karang")) {
      return handleCallback(chatId, "", "edu_scaling", firstName);
    }
    if (tl.includes("cabut") || tl.includes("mencabut")) {
      return handleCallback(chatId, "", "edu_cabut", firstName);
    }
    if (tl.includes("tambal") || tl.includes("berlubang") || tl.includes("lubang")) {
      return handleCallback(chatId, "", "edu_tambal", firstName);
    }
    if (tl.includes("saluran akar") || tl.includes("psa") || tl.includes("syaraf")) {
      return handleCallback(chatId, "", "edu_saluran", firstName);
    }
    if (tl.includes("putih") || tl.includes("bleach")) {
      return handleCallback(chatId, "", "edu_putih", firstName);
    }
    if (tl.includes("veneer")) {
      return handleCallback(chatId, "", "edu_veneer", firstName);
    }
    if (tl.includes("anak") || tl.includes("anak-anak") || tl.includes("si kecil")) {
      return handleCallback(chatId, "", "edu_anak", firstName);
    }
    if (tl.includes("jadwal") || tl.includes("praktek") || tl.includes("buka") || tl.includes("jam berapa")) {
      return handleCallback(chatId, "", "jadwal", firstName);
    }
    if (tl.includes("reservasi") || tl.includes("booking") || tl.includes("daftar") || tl.includes("janji")) {
      return handleCallback(chatId, "", "booking", firstName);
    }
    if (tl.includes("kontak") || tl.includes("alamat") || tl.includes("dimana") || tl.includes("lokasi")) {
      return handleCallback(chatId, "", "kontak", firstName);
    }
    if (tl.includes("harga") || tl.includes("biaya") || tl.includes("tarif") || tl.includes("berapa")) {
      return sendMessage(
        chatId,
        `💰 <b>Informasi Biaya</b>\n\nBiaya tindakan bervariasi tergantung kondisi gigi dan jenis tindakan yang diperlukan.\n\nUntuk informasi biaya yang lebih akurat, sebaiknya:\n✅ Datang untuk konsultasi awal (biasanya gratis atau sangat terjangkau)\n✅ Dokter akan mengevaluasi kondisi gigi kamu langsung\n✅ Biaya akan dijelaskan sebelum tindakan dilakukan — tidak ada kejutan! 😊\n\nMau buat janji konsultasi?`,
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
        `😟 <b>Gigi Sakit/Ngilu?</b>\n\nJangan tunda ya! Sakit gigi bisa semakin parah kalau dibiarkan.\n\n<b>Pertolongan sementara:</b>\n• Obat pereda nyeri (Paracetamol/Ibuprofen) bisa membantu sementara\n• Hindari makanan/minuman terlalu panas atau dingin\n• Jangan menahan-nahan ke dokter gigi!\n\n<b>Segera buat janji temu</b> agar dokter bisa menangani dengan tepat 🦷`,
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

    // Generic fallback — warm welcome for potential patients
    const s    = await getSettings();
    const name = firstName ? ` <b>${firstName}</b>` : "";
    return sendMessage(
      chatId,
      `Halo${name}! 🌸 Selamat datang di klinik drg. <b>${s.doctorName}</b> 🦷\n\nSenang sekali kamu sudah menghubungi kami! 😊\n\nKami hadir untuk membantu menjaga kesehatan dan kecantikan senyummu dengan pelayanan yang <b>ramah, nyaman, dan profesional</b>.\n\nJangan ragu ya — tidak ada pertanyaan yang terlalu sepele soal kesehatan gigi! 💬\n\nBerikut yang bisa aku bantu untuk kamu:`,
      { reply_markup: MAIN_MENU, parse_mode: "HTML" }
    );
  }

  // Unexpected text during booking flow — remind user
  return sendMessage(
    chatId,
    "Hmm, sepertinya kamu sedang dalam proses reservasi. Mau melanjutkan atau batalkan?",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "▶️ Lanjutkan",  callback_data: "menu"          }],
          [{ text: "❌ Batalkan",   callback_data: "cancel_booking" }],
        ],
      },
    }
  );
}

