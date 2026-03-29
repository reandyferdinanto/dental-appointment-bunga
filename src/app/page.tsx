import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import {
  Calendar, Clock, ArrowRight, Sparkles, GraduationCap,
  Stethoscope, SmilePlus, HeartPulse, Shield, CheckCircle2, Star, Megaphone, PlayCircle,
} from "lucide-react";
import { getDb, COLLECTIONS } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

// Static fallback data
const defaultServices = [
  { icon: SmilePlus, title: "Penambalan Gigi", desc: "Restorasi gigi berlubang dengan bahan komposit berkualitas tinggi.", color: "#FDACAC" },
  { icon: Stethoscope, title: "Pencabutan Gigi", desc: "Prosedur pencabutan gigi yang aman dan minim rasa sakit.", color: "#FEC3C3" },
  { icon: Sparkles, title: "Pembersihan Karang Gigi", desc: "Scaling profesional untuk membersihkan plak dan karang gigi.", color: "#4e6785" },
  { icon: HeartPulse, title: "Perawatan Saluran Akar", desc: "Endodontik untuk menyelamatkan gigi dari infeksi pulpa.", color: "#E79191" },
  { icon: Shield, title: "Konsultasi & Edukasi", desc: "Konsultasi kesehatan gigi dan mulut serta edukasi perawatan.", color: "#F7BABA" },
  { icon: GraduationCap, title: "Perawatan Ortodonti", desc: "Evaluasi dan perawatan dasar untuk merapikan susunan gigi.", color: "#4e6785" },
];

const iconMap: Record<string, React.ElementType> = {
  "Penambalan Gigi": SmilePlus, "Pencabutan Gigi": Stethoscope,
  "Pembersihan Karang Gigi": Sparkles, "Perawatan Saluran Akar": HeartPulse,
  "Konsultasi & Edukasi": Shield, "Perawatan Ortodonti": GraduationCap,
  "Konsultasi Ortodonti": GraduationCap, "Pemeriksaan Gigi": CheckCircle2,
  "Pencetakan Gigi": Star,
};
const iconColors = ["#FDACAC", "#FEC3C3", "#4e6785", "#E79191", "#F7BABA", "#4e6785", "#FDACAC", "#FEC3C3"];

const steps = [
  { step: "01", title: "Pilih Tanggal", desc: "Lihat jadwal tersedia dan pilih tanggal yang sesuai.", icon: Calendar, color: "#E79191" },
  { step: "02", title: "Isi Data Diri", desc: "Lengkapi nama, nomor HP, dan keluhan gigi Anda.", icon: CheckCircle2, color: "#FDACAC" },
  { step: "03", title: "Konfirmasi", desc: "Terima konfirmasi booking dan datang sesuai jadwal.", icon: Star, color: "#4e6785" },
];

// Fetch settings (server-side) from MongoDB
async function getSettings() {
  try {
    const db = await getDb();
    const raw = await db.collection(COLLECTIONS.settings).findOne({ _id: "main" as unknown as import("mongodb").ObjectId });
    if (!raw) return null;
    const { _id, ...rest } = raw;
    void _id;
    const data = rest as Record<string, unknown>;
    if (data.services && typeof data.services === "string") {
      try { data.services = JSON.parse(data.services as string); } catch { data.services = []; }
    }
    return data;
  } catch { return null; }
}


// Page
export default async function HomePage() {
  const settings = await getSettings();

  const servicesList: string[] = Array.isArray(settings?.services)
    ? (settings!.services as string[]) : [];

  const services = servicesList.length > 0
    ? servicesList.map((title, i) => ({
      icon: iconMap[title] ?? Stethoscope,
      title,
      desc: defaultServices.find(s => s.title === title)?.desc ?? `Layanan ${title} profesional.`,
      color: iconColors[i % iconColors.length],
    }))
    : defaultServices;

  const announcement = (settings?.announcement as string | undefined) || "";
  // Strip any leading "drg." / "drg" prefix the admin may have typed in settings
  // so the hero card (which hardcodes "drg. ") never shows it twice.
  const rawDoctorName = (settings?.doctorName as string | undefined) || "Natasya Bunga Maureen";
  const doctorName = rawDoctorName.replace(/^drg\.?\s*/i, "").trim() || "Natasya Bunga Maureen";

  return (
    <div className="min-h-screen bg-mesh overflow-x-hidden">
      <Navbar />

      {/* Announcement banner */}
      {announcement && (
        <div className="sticky top-0 z-40 w-full py-2 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2"
          style={{ background: "#e6e7ee", color: "#4e6785", borderBottom: "1px solid rgba(255,255,255,0.55)" }}>
          <Megaphone className="w-3.5 h-3.5 shrink-0" />
          {announcement}
        </div>
      )}

      {/* HERO */}
      <section className="relative min-h-[88vh] sm:min-h-[92vh] flex items-center overflow-hidden">
        <div className="blob-pink absolute w-72 h-72 sm:w-96 sm:h-96 -top-20 -left-20 pointer-events-none" />
        <div className="blob-peach absolute w-64 h-64 sm:w-80 sm:h-80 top-1/3 right-0 pointer-events-none" />
        <div className="blob-navy absolute w-56 h-56 sm:w-72 sm:h-72 bottom-0 left-1/3 pointer-events-none" />

        <div className="section-shell relative grid w-full items-center gap-8 px-4 py-12 sm:gap-10 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-12 lg:px-8">
          {/* Left */}
          <div className="z-10">
            <div className="chip-neu mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold sm:mb-6 sm:px-4 sm:py-2"
              style={{ color: "#5D688A", border: "1px solid rgba(253,172,172,0.5)" }}>
              <span className="w-2 h-2 rounded-full bg-[#FDACAC] animate-pulse-soft" />
              Menerima Pasien Baru
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-[#3a3f52] mb-4 sm:mb-6 text-balance">
              Senyum Sehat{" "}
              <span className="gradient-text">Dimulai</span>
              <br />dari Sini
            </h1>

            <p className="text-base sm:text-lg text-[#5D688A]/75 leading-relaxed max-w-lg mb-6 sm:mb-8">
              Halo! Saya{" "}
              <span className="font-bold text-[#5D688A]">drg. {doctorName}</span>
              , dokter gigi koas yang siap membantu menjaga kesehatan gigi dan mulut Anda dengan
              pelayanan profesional dan penuh empati.
            </p>

            <div className="mb-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/booking"
                className="btn-neu-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 tap-feedback">
                <Calendar className="w-4 h-4" />
                Buat Janji Sekarang
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/jadwal"
                className="btn-neu-secondary inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-bold transition-all hover:scale-105 active:scale-95 tap-feedback" style={{ color: "#4e6785" }}>
                <Clock className="w-4 h-4" />
                Lihat Jadwal
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="chip-neu inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ color: "#5D688A" }}>
                Dokter Gigi Koas Aktif
              </div>
              <div className="chip-neu inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ color: "#5D688A" }}>
                Pelayanan Penuh Empati
              </div>
            </div>
          </div>

          {/* Right: Hero tooth panel */}
          <div className="mt-4 flex items-center justify-center lg:mt-0">
            <div className="relative w-full max-w-[27rem] sm:max-w-[31rem] lg:-ml-24 lg:max-w-[38rem]">
              <div className="absolute right-4 top-5 text-xl text-[#F7BABA] animate-pulse-soft select-none sm:text-2xl">*</div>
              <div
                className="absolute left-1 bottom-24 text-base text-[#FEC3C3] animate-pulse-soft select-none sm:text-lg"
                style={{ animationDelay: "1s" }}
              >
                *
              </div>

              <div className="relative aspect-square">
                <svg
                  viewBox="0 0 40 40"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-full w-full"
                  style={{
                    filter:
                      "drop-shadow(10px 10px 20px rgba(163,177,198,0.42)) drop-shadow(-9px -9px 18px rgba(255,255,255,0.76))",
                  }}
                >
                  <defs>
                    <filter id="hero-tooth-raised" x="-25%" y="-25%" width="150%" height="150%">
                      <feDropShadow dx="1.05" dy="1.05" stdDeviation="0.92" floodColor="#b8c1cb" floodOpacity="0.2" />
                      <feDropShadow dx="-0.95" dy="-0.95" stdDeviation="0.85" floodColor="#ffffff" floodOpacity="0.48" />
                    </filter>
                    <filter id="hero-tooth-inset" x="-25%" y="-25%" width="150%" height="150%">
                      <feOffset dx="0.22" dy="0.22" />
                      <feGaussianBlur stdDeviation="0.34" result="offset-blur" />
                      <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
                      <feFlood floodColor="#bec7d0" floodOpacity="0.04" result="color" />
                      <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                      <feOffset dx="-0.16" dy="-0.16" in="SourceAlpha" result="highlight-offset" />
                      <feGaussianBlur stdDeviation="0.28" in="highlight-offset" result="highlight-blur" />
                      <feComposite operator="out" in="SourceGraphic" in2="highlight-blur" result="highlight-inverse" />
                      <feFlood floodColor="#ffffff" floodOpacity="0.12" result="highlight-color" />
                      <feComposite operator="in" in="highlight-color" in2="highlight-inverse" result="highlight" />
                      <feMerge>
                        <feMergeNode in="shadow" />
                        <feMergeNode in="highlight" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <radialGradient id="hero-tooth-sheen" cx="28%" cy="22%" r="75%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.24" />
                      <stop offset="45%" stopColor="#ffffff" stopOpacity="0.05" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="hero-tooth-bottom-tint" x1="0%" x2="100%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                      <stop offset="100%" stopColor="#f6d6d6" stopOpacity="0.16" />
                    </linearGradient>
                  </defs>

                  <path
                    filter="url(#hero-tooth-raised)"
                    fill="#e6e7ee"
                    d="M25.76,37.5c-1.966,0-2.26-2.192-2.26-3.5l0.004-0.818c0.021-3.23,0.053-8.113-1.77-9.947 C21.25,22.747,20.666,22.5,20,22.5s-1.25,0.247-1.734,0.734c-1.822,1.834-1.79,6.717-1.77,9.947L16.5,34 c0,1.308-0.294,3.5-2.261,3.5c-2.255,0-2.99-3.53-3.841-7.618c-0.275-1.323-0.561-2.691-0.916-4.012 c-0.552-2.004-1.488-3.874-2.394-5.683C5.758,17.528,4.5,15.016,4.5,12.286C4.5,5.701,7.843,2.5,14.72,2.5 c1.33,0,3.656,0.37,4.866,0.902l0.09,0.039c0,0,0.101,0.003,0.102,0.003c0.231,0,0.398-0.043,0.431-0.052 c0.04-0.012,3.036-0.893,4.698-0.893c3.438,0,6.238,0.996,8.101,2.879c1.663,1.682,2.524,4.068,2.492,6.901 c0,2.734-1.257,5.247-2.588,7.907c-0.905,1.809-1.842,3.679-2.394,5.68c-0.36,1.322-0.648,2.701-0.927,4.036 C28.774,33.81,28.004,37.5,25.76,37.5z"
                  />
                  <path
                    filter="url(#hero-tooth-inset)"
                    fill="#e6e7ee"
                    d="M25.76,37.5c-1.966,0-2.26-2.192-2.26-3.5l0.004-0.818c0.021-3.23,0.053-8.113-1.77-9.947 C21.25,22.747,20.666,22.5,20,22.5s-1.25,0.247-1.734,0.734c-1.822,1.834-1.79,6.717-1.77,9.947L16.5,34 c0,1.308-0.294,3.5-2.261,3.5c-2.255,0-2.99-3.53-3.841-7.618c-0.275-1.323-0.561-2.691-0.916-4.012 c-0.552-2.004-1.488-3.874-2.394-5.683C5.758,17.528,4.5,15.016,4.5,12.286C4.5,5.701,7.843,2.5,14.72,2.5 c1.33,0,3.656,0.37,4.866,0.902l0.09,0.039c0,0,0.101,0.003,0.102,0.003c0.231,0,0.398-0.043,0.431-0.052 c0.04-0.012,3.036-0.893,4.698-0.893c3.438,0,6.238,0.996,8.101,2.879c1.663,1.682,2.524,4.068,2.492,6.901 c0,2.734-1.257,5.247-2.588,7.907c-0.905,1.809-1.842,3.679-2.394,5.68c-0.36,1.322-0.648,2.701-0.927,4.036 C28.774,33.81,28.004,37.5,25.76,37.5z"
                  />
                  <path
                    fill="none"
                    stroke="rgba(255,255,255,0.84)"
                    strokeWidth="0.42"
                    d="M25.76,37.5c-1.966,0-2.26-2.192-2.26-3.5l0.004-0.818c0.021-3.23,0.053-8.113-1.77-9.947 C21.25,22.747,20.666,22.5,20,22.5s-1.25,0.247-1.734,0.734c-1.822,1.834-1.79,6.717-1.77,9.947L16.5,34 c0,1.308-0.294,3.5-2.261,3.5c-2.255,0-2.99-3.53-3.841-7.618c-0.275-1.323-0.561-2.691-0.916-4.012 c-0.552-2.004-1.488-3.874-2.394-5.683C5.758,17.528,4.5,15.016,4.5,12.286C4.5,5.701,7.843,2.5,14.72,2.5 c1.33,0,3.656,0.37,4.866,0.902l0.09,0.039c0,0,0.101,0.003,0.102,0.003c0.231,0,0.398-0.043,0.431-0.052 c0.04-0.012,3.036-0.893,4.698-0.893c3.438,0,6.238,0.996,8.101,2.879c1.663,1.682,2.524,4.068,2.492,6.901 c0,2.734-1.257,5.247-2.588,7.907c-0.905,1.809-1.842,3.679-2.394,5.68c-0.36,1.322-0.648,2.701-0.927,4.036 C28.774,33.81,28.004,37.5,25.76,37.5z"
                  />
                  <path
                    fill="url(#hero-tooth-sheen)"
                    d="M25.76,37.5c-1.966,0-2.26-2.192-2.26-3.5l0.004-0.818c0.021-3.23,0.053-8.113-1.77-9.947 C21.25,22.747,20.666,22.5,20,22.5s-1.25,0.247-1.734,0.734c-1.822,1.834-1.79,6.717-1.77,9.947L16.5,34 c0,1.308-0.294,3.5-2.261,3.5c-2.255,0-2.99-3.53-3.841-7.618c-0.275-1.323-0.561-2.691-0.916-4.012 c-0.552-2.004-1.488-3.874-2.394-5.683C5.758,17.528,4.5,15.016,4.5,12.286C4.5,5.701,7.843,2.5,14.72,2.5 c1.33,0,3.656,0.37,4.866,0.902l0.09,0.039c0,0,0.101,0.003,0.102,0.003c0.231,0,0.398-0.043,0.431-0.052 c0.04-0.012,3.036-0.893,4.698-0.893c3.438,0,6.238,0.996,8.101,2.879c1.663,1.682,2.524,4.068,2.492,6.901 c0,2.734-1.257,5.247-2.588,7.907c-0.905,1.809-1.842,3.679-2.394,5.68c-0.36,1.322-0.648,2.701-0.927,4.036 C28.774,33.81,28.004,37.5,25.76,37.5z"
                  />
                  <path
                    fill="url(#hero-tooth-bottom-tint)"
                    d="M25.76,37.5c-1.966,0-2.26-2.192-2.26-3.5l0.004-0.818c0.021-3.23,0.053-8.113-1.77-9.947 C21.25,22.747,20.666,22.5,20,22.5s-1.25,0.247-1.734,0.734c-1.822,1.834-1.79,6.717-1.77,9.947L16.5,34 c0,1.308-0.294,3.5-2.261,3.5c-2.255,0-2.99-3.53-3.841-7.618c-0.275-1.323-0.561-2.691-0.916-4.012 c-0.552-2.004-1.488-3.874-2.394-5.683C5.758,17.528,4.5,15.016,4.5,12.286C4.5,5.701,7.843,2.5,14.72,2.5 c1.33,0,3.656,0.37,4.866,0.902l0.09,0.039c0,0,0.101,0.003,0.102,0.003c0.231,0,0.398-0.043,0.431-0.052 c0.04-0.012,3.036-0.893,4.698-0.893c3.438,0,6.238,0.996,8.101,2.879c1.663,1.682,2.524,4.068,2.492,6.901 c0,2.734-1.257,5.247-2.588,7.907c-0.905,1.809-1.842,3.679-2.394,5.68c-0.36,1.322-0.648,2.701-0.927,4.036 C28.774,33.81,28.004,37.5,25.76,37.5z"
                  />
                </svg>

                <div className="absolute inset-[7%] flex flex-col items-center justify-start pt-[13%] text-center">
                  <Image
                    src="/tooth.svg"
                    alt="Tooth logo"
                    width={160}
                    height={160}
                    className="mb-4 h-32 w-32 drop-shadow-[0_12px_18px_rgba(243,182,194,0.16)] sm:h-36 sm:w-36 lg:h-40 lg:w-40"
                  />
                  <h3 className="mb-1 text-lg font-extrabold tracking-[-0.02em] text-[#3a3f52] sm:text-xl">
                    drg. {doctorName}
                  </h3>
                  <p className="mb-2 text-sm font-semibold tracking-[0.02em] text-[#E79191]">
                    Dokter Gigi Koas
                  </p>
                  <p className="mb-4 max-w-[15rem] text-xs leading-relaxed text-[#5D688A]/55">
                    Universitas • Stase Aktif 2026
                  </p>
                  <div className="mb-4 flex max-w-[16rem] flex-wrap items-center justify-center gap-2">
                    {[
                      { icon: "•", label: "Gigi Umum" },
                      { icon: "•", label: "Scaling" },
                      { icon: "•", label: "Endodontik" },
                    ].map((pill) => (
                      <div
                        key={pill.label}
                        className="chip-neu inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold sm:px-3 sm:py-1.5 sm:text-[11px]"
                        style={{ color: "#5D688A" }}
                      >
                        <span>{pill.icon}</span>
                        {pill.label}
                      </div>
                    ))}
                  </div>
                  <div
                    className="chip-neu inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-[#5D688A]"
                    style={{ border: "1px solid rgba(253,172,172,0.32)" }}
                  >
                    <span className="h-2 w-2 rounded-full bg-[#FDACAC] animate-pulse-soft" />
                    Menerima Pasien Baru
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-14 sm:py-20">
        <div className="section-shell px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="chip-neu mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
              style={{ color: "#5D688A", border: "1px solid rgba(253,172,172,0.4)" }}>
              <Stethoscope className="w-3.5 h-3.5" /> Layanan Kami
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#3a3f52] mb-3">Layanan Perawatan Gigi</h2>
            <p className="text-[#5D688A]/65 max-w-xl mx-auto text-sm sm:text-base">
              Berbagai layanan perawatan gigi dan mulut yang tersedia untuk kebutuhan Anda.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {services.map(svc => (
              <div key={svc.title}
                className="glass neu-card-hover rounded-[28px] p-5 sm:p-6 group active:scale-[0.99] transition-all duration-300 tap-feedback" style={{ border: "1px solid rgba(255,255,255,0.52)" }}>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `${svc.color}22`, border: `1px solid ${svc.color}33` }}>
                  <svc.icon className="w-5 h-5" style={{ color: svc.color }} />
                </div>
                <h3 className="font-bold text-[#3a3f52] mb-1.5 text-sm sm:text-base">{svc.title}</h3>
                <p className="text-xs sm:text-sm text-[#5D688A]/65 leading-relaxed">{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-14 sm:py-20">
        <div className="section-shell px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-[30px] p-6 sm:p-10 relative overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.52)" }}>
            <div className="blob-pink absolute w-48 h-48 -top-10 -right-10 pointer-events-none" />
            <div className="blob-peach absolute w-40 h-40 -bottom-10 left-0 pointer-events-none" />

            <div className="text-center mb-8 sm:mb-10 relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#3a3f52] mb-3">Cara Membuat Janji</h2>
              <p className="text-[#5D688A]/65 text-sm sm:text-base">Mudah dan cepat, hanya 3 langkah.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 relative z-10">
              {steps.map((item, idx) => (
                <div key={item.step} className="text-center relative">
                  {idx < 2 && (
                    <div className="hidden sm:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5"
                      style={{ background: `linear-gradient(90deg,${item.color}60,transparent)` }} />
                  )}
                  {idx < 2 && (
                    <div className="sm:hidden flex justify-center my-3">
                      <div className="w-0.5 h-8" style={{ background: `linear-gradient(180deg,${item.color}60,transparent)` }} />
                    </div>
                  )}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform hover:scale-110"
                    style={{ background: "#e6e7ee", border: "1px solid rgba(255,255,255,0.52)", boxShadow: "4px 4px 8px rgba(163,177,198,0.2), -4px -4px 8px rgba(255,255,255,0.5)" }}>
                    <item.icon className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: item.color }} />
                  </div>
                  <div className="text-xs font-bold mb-2" style={{ color: item.color }}>LANGKAH {item.step}</div>
                  <h3 className="font-bold text-[#3a3f52] mb-2 text-sm sm:text-base">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-[#5D688A]/65">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden relative z-10">
              <Link href="/booking"
                className="btn-neu-primary inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-white tap-feedback">
                <Calendar className="w-4 h-4" />
                Mulai Booking
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SIMULASI INTERAKTIF */}
      <section className="py-14 sm:py-20">
        <div className="section-shell px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-[30px] overflow-hidden relative" style={{ border: "1px solid rgba(255,255,255,0.52)" }}>
            <div className="blob-pink absolute w-56 h-56 -top-10 -right-10 pointer-events-none" />
            <div className="blob-peach absolute w-40 h-40 -bottom-10 -left-10 pointer-events-none" />

            <div className="relative z-10 grid lg:grid-cols-2 gap-6 items-center p-6 sm:p-10">
              {/* Left: Info */}
              <div>
                <div className="chip-neu mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{ color: "#5D688A", border: "1px solid rgba(253,172,172,0.4)" }}>
                  <PlayCircle className="w-3.5 h-3.5" />
                  Simulasi Interaktif
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-[#3a3f52] mb-3">
                  Pahami Prosedur{" "}
                  <span className="gradient-text">Sebelum Perawatan</span>
                </h2>
                <p className="text-sm sm:text-base text-[#5D688A]/70 leading-relaxed mb-6">
                  Lihat simulasi interaktif langkah-langkah <strong>penambalan gigi</strong> agar Anda
                  memahami prosesnya dan merasa lebih tenang sebelum perawatan.
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {[
                    "6 Langkah Visual",
                    "Auto-play Mode",
                    "Mobile Friendly",
                  ].map(tag => (
                    <span key={tag}
                      className="chip-neu inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold"
                      style={{ color: "#5D688A" }}>
                      {tag}
                    </span>
                  ))}
                </div>

                <Link href="/simulasi"
                  className="btn-neu-secondary inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95 tap-feedback" style={{ color: "#4e6785" }}>
                  <PlayCircle className="w-5 h-5" />
                  Lihat Simulasi
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Right: Preview illustration */}
              <div className="flex justify-center">
                <div className="relative w-64 h-64 sm:w-72 sm:h-72">
                  {/* Realistic tooth image */}
                  <div className="absolute inset-0 rounded-3xl overflow-hidden flex items-center justify-center glass"
                    style={{ border: "1px solid rgba(255,255,255,0.52)" }}>
                    <Image
                      src="/images/simulasi/tooth-preview.png"
                      alt="Simulasi Perawatan Gigi"
                      width={280}
                      height={280}
                      className="object-contain p-2"
                    />
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center btn-neu-primary">
                        <svg viewBox="0 0 24 24" className="w-7 h-7 ml-1 fill-white" xmlns="http://www.w3.org/2000/svg">
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  {/* Floating badges */}
                  <div className="btn-neu-primary absolute -top-2 -right-2 px-3 py-1.5 rounded-full text-[10px] font-bold text-white">
                    Step-by-Step
                  </div>
                  <div className="chip-neu absolute -bottom-2 -left-2 px-3 py-1.5 rounded-full text-[10px] font-bold"
                    style={{ color: "#5D688A" }}>
                    Interaktif
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-20">
        <div className="section-shell max-w-4xl px-4">
          <div className="glass rounded-[30px] overflow-hidden text-center px-6 py-10 sm:p-12 relative" style={{ border: "1px solid rgba(255,255,255,0.52)" }}>
            <div className="blob-pink absolute w-56 h-56 -top-10 -left-10 pointer-events-none" style={{ opacity: 0.2 }} />
            <div className="blob-peach absolute w-48 h-48 -bottom-10 -right-10 pointer-events-none" style={{ opacity: 0.2 }} />
            <div className="absolute top-4 right-8 w-20 h-20 rounded-full"
              style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.28)" }} />
            <div className="absolute bottom-4 left-8 w-12 h-12 rounded-full"
              style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.24)" }} />

            <div className="relative z-10">
              <div className="mb-4 text-4xl font-black text-[#5D688A] sm:text-5xl">+</div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2c3d52] mb-4 text-balance">
                Siap Merawat Senyum Anda?
              </h2>
              <p className="text-[#4e6785]/75 mb-8 max-w-xl mx-auto text-sm sm:text-base">
                Jangan tunda perawatan gigi. Buat janji sekarang dan dapatkan pelayanan terbaik
                dari drg. {doctorName}.
              </p>
              <Link href="/booking"
                className="btn-neu-primary inline-flex min-h-12 items-center gap-2 px-7 py-4 rounded-2xl font-bold text-sm text-white transition-all hover:scale-105 active:scale-95 tap-feedback">
                <Calendar className="w-5 h-5" />
                Buat Janji Sekarang
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}



