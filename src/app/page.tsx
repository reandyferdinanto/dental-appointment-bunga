import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import LiveDateTimePanel from "@/components/home/LiveDateTimePanel";
import {
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Stethoscope,
  SmilePlus,
  HeartPulse,
  Shield,
  CheckCircle2,
  Star,
  Megaphone,
  PlayCircle,
} from "lucide-react";
import { getDb, COLLECTIONS } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const defaultServices = [
  { icon: SmilePlus, title: "Penambalan Gigi", desc: "Restorasi gigi berlubang dengan bahan komposit berkualitas tinggi.", color: "#FDACAC" },
  { icon: Stethoscope, title: "Pencabutan Gigi", desc: "Prosedur pencabutan gigi yang aman dan minim rasa sakit.", color: "#FEC3C3" },
  { icon: Sparkles, title: "Pembersihan Karang Gigi", desc: "Scaling profesional untuk membersihkan plak dan karang gigi.", color: "#4e6785" },
  { icon: HeartPulse, title: "Perawatan Saluran Akar", desc: "Endodontik untuk menyelamatkan gigi dari infeksi pulpa.", color: "#E79191" },
  { icon: Shield, title: "Konsultasi & Edukasi", desc: "Konsultasi kesehatan gigi dan mulut serta edukasi perawatan.", color: "#F7BABA" },
  { icon: GraduationCap, title: "Perawatan Ortodonti", desc: "Evaluasi dan perawatan dasar untuk merapikan susunan gigi.", color: "#4e6785" },
];

const iconMap: Record<string, React.ElementType> = {
  "Penambalan Gigi": SmilePlus,
  "Pencabutan Gigi": Stethoscope,
  "Pembersihan Karang Gigi": Sparkles,
  "Perawatan Saluran Akar": HeartPulse,
  "Konsultasi & Edukasi": Shield,
  "Perawatan Ortodonti": GraduationCap,
  "Konsultasi Ortodonti": GraduationCap,
  "Pemeriksaan Gigi": CheckCircle2,
  "Pencetakan Gigi": Star,
};
const iconColors = ["#FDACAC", "#FEC3C3", "#4e6785", "#E79191", "#F7BABA", "#4e6785", "#FDACAC", "#FEC3C3"];

const steps = [
  { step: "01", title: "Pilih Tanggal", desc: "Lihat jadwal tersedia dan pilih tanggal yang sesuai.", icon: Calendar, color: "#E79191" },
  { step: "02", title: "Isi Data Diri", desc: "Lengkapi nama, nomor HP, dan keluhan gigi Anda.", icon: CheckCircle2, color: "#FDACAC" },
  { step: "03", title: "Konfirmasi", desc: "Terima konfirmasi booking dan datang sesuai jadwal.", icon: Star, color: "#4e6785" },
];

async function getSettings() {
  try {
    const db = await getDb();
    const raw = await db.collection(COLLECTIONS.settings).findOne({ _id: "main" as unknown as import("mongodb").ObjectId });
    if (!raw) return null;
    const { _id, ...rest } = raw;
    void _id;
    const data = rest as Record<string, unknown>;
    if (data.services && typeof data.services === "string") {
      try {
        data.services = JSON.parse(data.services as string);
      } catch {
        data.services = [];
      }
    }
    return data;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const settings = await getSettings();

  const servicesList: string[] = Array.isArray(settings?.services)
    ? (settings.services as string[])
    : [];

  const services = servicesList.length > 0
    ? servicesList.map((title, i) => ({
        icon: iconMap[title] ?? Stethoscope,
        title,
        desc: defaultServices.find((service) => service.title === title)?.desc ?? `Layanan ${title} profesional.`,
        color: iconColors[i % iconColors.length],
      }))
    : defaultServices;

  const announcement = (settings?.announcement as string | undefined) || "";
  const rawDoctorName = (settings?.doctorName as string | undefined) || "Natasya Bunga Maureen";
  const doctorName = rawDoctorName.replace(/^drg\.?\s*/i, "").trim() || "Natasya Bunga Maureen";

  return (
    <div className="min-h-screen overflow-x-hidden bg-mesh">
      <Navbar />

      {announcement && (
        <div
          className="sticky top-0 z-40 flex w-full items-center justify-center gap-2 px-4 py-2 text-center text-xs font-semibold"
          style={{
            background: "#e6e7ee",
            color: "#4e6785",
            borderBottom: "1px solid rgba(255,255,255,0.55)",
          }}
        >
          <Megaphone className="h-3.5 w-3.5 shrink-0" />
          {announcement}
        </div>
      )}

      <section className="relative flex min-h-[calc(100svh-4.5rem)] items-center overflow-hidden">
        <div className="blob-pink pointer-events-none absolute -left-20 -top-20 h-72 w-72 sm:h-96 sm:w-96" />
        <div className="blob-peach pointer-events-none absolute right-0 top-1/3 h-64 w-64 sm:h-80 sm:w-80" />
        <div className="blob-navy pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 sm:h-72 sm:w-72" />

        <div className="section-shell relative grid w-full items-center gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)] lg:gap-8 lg:px-8 lg:py-8">
          <div className="z-10 max-w-[32rem]">
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/50 px-4 py-2 text-[11px] font-semibold tracking-[0.08em] text-[#5D688A] shadow-[8px_8px_18px_rgba(163,177,198,0.12),-8px_-8px_18px_rgba(255,255,255,0.8)] sm:mb-5"
              style={{ color: "#5D688A", border: "1px solid rgba(253,172,172,0.5)" }}
            >
              <span className="h-2 w-2 rounded-full bg-[#FDACAC] animate-pulse-soft" />
              Menerima Pasien Baru
            </div>

            <h1 className="mb-3 max-w-[9ch] text-[2.95rem] font-extrabold leading-[0.94] tracking-[-0.05em] text-[#3a3f52] text-balance sm:text-[4.15rem] lg:text-[4.6rem]">
              Senyum Sehat <span className="gradient-text">Dimulai</span>
              <br />dari Sini
            </h1>

            <p className="mb-4 max-w-[30rem] text-[15px] leading-[1.75] text-[#5D688A]/78 sm:text-[0.98rem]">
              Halo! Saya <span className="font-bold text-[#5D688A]">drg. {doctorName}</span>, dokter gigi koas yang siap membantu menjaga kesehatan gigi dan mulut Anda dengan pelayanan profesional dan penuh empati.
            </p>

            <div className="flex items-center gap-3 text-[13px] font-medium text-[#5D688A]/72">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#FDACAC]" />
                Dokter gigi koas aktif
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-[#5D688A]/25 sm:block" />
              <span className="hidden sm:inline">Pelayanan penuh empati</span>
            </div>

            <div className="mt-5 max-w-[29rem]">
              <LiveDateTimePanel />
              <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
                <Link
                  href="/booking"
                  className="btn-neu-primary inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-95 tap-feedback"
                >
                  <Calendar className="h-4 w-4" />
                  Buat Janji Sekarang
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/jadwal"
                  className="btn-neu-secondary inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 tap-feedback"
                  style={{ color: "#4e6785" }}
                >
                  <Clock className="h-4 w-4" />
                  Lihat Jadwal
                </Link>
              </div>
            </div>
          </div>

                              <div className="mt-2 flex items-center justify-center lg:mt-0 lg:justify-end">
            <div className="relative w-full max-w-[16.5rem] sm:max-w-[20rem] lg:max-w-[24rem]">
              <div className="absolute inset-x-10 top-8 h-28 rounded-full bg-[#f6c8d1]/25 blur-3xl" />
              <div className="absolute right-4 top-10 select-none text-xl text-[#F7BABA] animate-pulse-soft sm:text-2xl">*</div>
              <div
                className="absolute left-2 top-1/2 -translate-y-1/2 select-none text-base text-[#FEC3C3] animate-pulse-soft sm:text-lg"
                style={{ animationDelay: "1s" }}
              >
                *
              </div>

              <div className="relative flex flex-col items-center gap-5">
                <div className="relative flex aspect-square w-full items-center justify-center">
                  <svg
                    viewBox="0 0 40 40"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-full w-full"
                    style={{
                      filter:
                        "drop-shadow(18px 18px 30px rgba(163,177,198,0.34)) drop-shadow(-12px -12px 24px rgba(255,255,255,0.88))",
                    }}
                  >
                    <defs>
                      <filter id="hero-tooth-raised" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="1.4" dy="1.5" stdDeviation="1.1" floodColor="#b7c0cb" floodOpacity="0.24" />
                        <feDropShadow dx="-1.1" dy="-1.1" stdDeviation="1" floodColor="#ffffff" floodOpacity="0.68" />
                      </filter>
                      <filter id="hero-tooth-emboss" x="-30%" y="-30%" width="160%" height="160%">
                        <feOffset dx="0.26" dy="0.36" />
                        <feGaussianBlur stdDeviation="0.42" result="shadow-blur" />
                        <feComposite operator="out" in="SourceGraphic" in2="shadow-blur" result="shadow-inverse" />
                        <feFlood floodColor="#b6bfca" floodOpacity="0.16" result="shadow-color" />
                        <feComposite operator="in" in="shadow-color" in2="shadow-inverse" result="shadow" />
                        <feOffset dx="-0.28" dy="-0.28" in="SourceAlpha" result="highlight-offset" />
                        <feGaussianBlur stdDeviation="0.38" in="highlight-offset" result="highlight-blur" />
                        <feComposite operator="out" in="SourceGraphic" in2="highlight-blur" result="highlight-inverse" />
                        <feFlood floodColor="#ffffff" floodOpacity="0.34" result="highlight-color" />
                        <feComposite operator="in" in="highlight-color" in2="highlight-inverse" result="highlight" />
                        <feMerge>
                          <feMergeNode in="shadow" />
                          <feMergeNode in="highlight" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      <radialGradient id="hero-tooth-core" cx="30%" cy="22%" r="80%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
                        <stop offset="55%" stopColor="#eef1f7" stopOpacity="0.94" />
                        <stop offset="100%" stopColor="#dfe5ee" stopOpacity="1" />
                      </radialGradient>
                      <linearGradient id="hero-tooth-rim" x1="0%" x2="100%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
                        <stop offset="100%" stopColor="rgba(230,232,239,0.82)" />
                      </linearGradient>
                      <linearGradient id="hero-tooth-blush" x1="0%" x2="100%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                        <stop offset="100%" stopColor="#f7d7dc" stopOpacity="0.24" />
                      </linearGradient>
                    </defs>

                    <path filter="url(#hero-tooth-raised)" fill="url(#hero-tooth-core)" d="M25.76,37.5c-1.966,0-2.26-2.192-2.26-3.5l0.004-0.818c0.021-3.23,0.053-8.113-1.77-9.947 C21.25,22.747,20.666,22.5,20,22.5s-1.25,0.247-1.734,0.734c-1.822,1.834-1.79,6.717-1.77,9.947L16.5,34 c0,1.308-0.294,3.5-2.261,3.5c-2.255,0-2.99-3.53-3.841-7.618c-0.275-1.323-0.561-2.691-0.916-4.012 c-0.552-2.004-1.488-3.874-2.394-5.683C5.758,17.528,4.5,15.016,4.5,12.286C4.5,5.701,7.843,2.5,14.72,2.5 c1.33,0,3.656,0.37,4.866,0.902l0.09,0.039c0,0,0.101,0.003,0.102,0.003c0.231,0,0.398-0.043,0.431-0.052 c0.04-0.012,3.036-0.893,4.698-0.893c3.438,0,6.238,0.996,8.101,2.879c1.663,1.682,2.524,4.068,2.492,6.901 c0,2.734-1.257,5.247-2.588,7.907c-0.905,1.809-1.842,3.679-2.394,5.68c-0.36,1.322-0.648,2.701-0.927,4.036 C28.774,33.81,28.004,37.5,25.76,37.5z" />
                    <path filter="url(#hero-tooth-emboss)" fill="url(#hero-tooth-core)" d="M25.76,37.5c-1.966,0-2.26-2.192-2.26-3.5l0.004-0.818c0.021-3.23,0.053-8.113-1.77-9.947 C21.25,22.747,20.666,22.5,20,22.5s-1.25,0.247-1.734,0.734c-1.822,1.834-1.79,6.717-1.77,9.947L16.5,34 c0,1.308-0.294,3.5-2.261,3.5c-2.255,0-2.99-3.53-3.841-7.618c-0.275-1.323-0.561-2.691-0.916-4.012 c-0.552-2.004-1.488-3.874-2.394-5.683C5.758,17.528,4.5,15.016,4.5,12.286C4.5,5.701,7.843,2.5,14.72,2.5 c1.33,0,3.656,0.37,4.866,0.902l0.09,0.039c0,0,0.101,0.003,0.102,0.003c0.231,0,0.398-0.043,0.431-0.052 c0.04-0.012,3.036-0.893,4.698-0.893c3.438,0,6.238,0.996,8.101,2.879c1.663,1.682,2.524,4.068,2.492,6.901 c0,2.734-1.257,5.247-2.588,7.907c-0.905,1.809-1.842,3.679-2.394,5.68c-0.36,1.322-0.648,2.701-0.927,4.036 C28.774,33.81,28.004,37.5,25.76,37.5z" />
                    <path fill="none" stroke="url(#hero-tooth-rim)" strokeWidth="0.54" d="M25.76,37.5c-1.966,0-2.26-2.192-2.26-3.5l0.004-0.818c0.021-3.23,0.053-8.113-1.77-9.947 C21.25,22.747,20.666,22.5,20,22.5s-1.25,0.247-1.734,0.734c-1.822,1.834-1.79,6.717-1.77,9.947L16.5,34 c0,1.308-0.294,3.5-2.261,3.5c-2.255,0-2.99-3.53-3.841-7.618c-0.275-1.323-0.561-2.691-0.916-4.012 c-0.552-2.004-1.488-3.874-2.394-5.683C5.758,17.528,4.5,15.016,4.5,12.286C4.5,5.701,7.843,2.5,14.72,2.5 c1.33,0,3.656,0.37,4.866,0.902l0.09,0.039c0,0,0.101,0.003,0.102,0.003c0.231,0,0.398-0.043,0.431-0.052 c0.04-0.012,3.036-0.893,4.698-0.893c3.438,0,6.238,0.996,8.101,2.879c1.663,1.682,2.524,4.068,2.492,6.901 c0,2.734-1.257,5.247-2.588,7.907c-0.905,1.809-1.842,3.679-2.394,5.68c-0.36,1.322-0.648,2.701-0.927,4.036 C28.774,33.81,28.004,37.5,25.76,37.5z" />
                    <path fill="url(#hero-tooth-blush)" d="M25.76,37.5c-1.966,0-2.26-2.192-2.26-3.5l0.004-0.818c0.021-3.23,0.053-8.113-1.77-9.947 C21.25,22.747,20.666,22.5,20,22.5s-1.25,0.247-1.734,0.734c-1.822,1.834-1.79,6.717-1.77,9.947L16.5,34 c0,1.308-0.294,3.5-2.261,3.5c-2.255,0-2.99-3.53-3.841-7.618c-0.275-1.323-0.561-2.691-0.916-4.012 c-0.552-2.004-1.488-3.874-2.394-5.683C5.758,17.528,4.5,15.016,4.5,12.286C4.5,5.701,7.843,2.5,14.72,2.5 c1.33,0,3.656,0.37,4.866,0.902l0.09,0.039c0,0,0.101,0.003,0.102,0.003c0.231,0,0.398-0.043,0.431-0.052 c0.04-0.012,3.036-0.893,4.698-0.893c3.438,0,6.238,0.996,8.101,2.879c1.663,1.682,2.524,4.068,2.492,6.901 c0,2.734-1.257,5.247-2.588,7.907c-0.905,1.809-1.842,3.679-2.394,5.68c-0.36,1.322-0.648,2.701-0.927,4.036 C28.774,33.81,28.004,37.5,25.76,37.5z" />
                  </svg>

                  <div className="absolute inset-x-[30%] top-[22%] flex justify-center">
                    <div className="flex h-[4.8rem] w-[4.8rem] items-center justify-center rounded-[1.65rem] border border-white/72 bg-white/66 shadow-[12px_12px_26px_rgba(163,177,198,0.18),-10px_-10px_20px_rgba(255,255,255,0.8)] backdrop-blur-xl sm:h-[5.25rem] sm:w-[5.25rem]">
                      <Image
                        src="/tooth.svg"
                        alt="Tooth logo"
                        width={76}
                        height={76}
                        className="h-12 w-12 drop-shadow-[0_10px_18px_rgba(243,182,194,0.16)] sm:h-14 sm:w-14"
                      />
                    </div>
                  </div>
                </div>

                <div className="glass w-full rounded-[2rem] border border-white/60 bg-white/42 px-5 py-5 text-center shadow-[14px_14px_28px_rgba(163,177,198,0.14),-12px_-12px_24px_rgba(255,255,255,0.8)] backdrop-blur-xl sm:px-6">
                  <h3 className="mx-auto max-w-[12ch] text-[1.25rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#364055] sm:text-[1.5rem]">
                    drg. {doctorName}
                  </h3>
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#E79191] sm:text-[11px]">
                    Dokter Gigi Koas
                  </p>
                  <p className="mx-auto mt-2 max-w-[13rem] text-[10px] leading-relaxed text-[#5D688A]/58 sm:text-[11px]">
                    Universitas - Stase Aktif 2026
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    {["Gigi Umum", "Scaling", "Endodontik"].map((pill) => (
                      <div
                        key={pill}
                        className="rounded-full border border-white/60 bg-white/58 px-3 py-1.5 text-[9px] font-semibold text-[#5D688A] shadow-[6px_6px_14px_rgba(163,177,198,0.12),-6px_-6px_14px_rgba(255,255,255,0.74)] sm:text-[10px]"
                      >
                        {pill}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#FDACAC]/36 bg-white/62 px-4 py-2 text-[10px] font-semibold text-[#5D688A] shadow-[8px_8px_18px_rgba(163,177,198,0.12),-8px_-8px_18px_rgba(255,255,255,0.74)]">
                    <span className="h-2 w-2 rounded-full bg-[#FDACAC] animate-pulse-soft" />
                    Menerima pasien baru
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="section-shell px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <div className="chip-neu mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold" style={{ color: "#5D688A", border: "1px solid rgba(253,172,172,0.4)" }}>
              <Stethoscope className="h-3.5 w-3.5" /> Layanan Kami
            </div>
            <h2 className="mb-3 text-2xl font-bold text-[#3a3f52] sm:text-3xl">Layanan Perawatan Gigi</h2>
            <p className="mx-auto max-w-xl text-sm text-[#5D688A]/65 sm:text-base">
              Berbagai layanan perawatan gigi dan mulut yang tersedia untuk kebutuhan Anda.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="glass neu-card-hover group rounded-[28px] p-5 transition-all duration-300 active:scale-[0.99] tap-feedback sm:p-6"
                style={{ border: "1px solid rgba(255,255,255,0.52)" }}
              >
                <div
                  className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 sm:mb-4 sm:h-12 sm:w-12"
                  style={{ background: `${service.color}22`, border: `1px solid ${service.color}33` }}
                >
                  <service.icon className="h-5 w-5" style={{ color: service.color }} />
                </div>
                <h3 className="mb-1.5 text-sm font-bold text-[#3a3f52] sm:text-base">{service.title}</h3>
                <p className="text-xs leading-relaxed text-[#5D688A]/65 sm:text-sm">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="section-shell px-4 sm:px-6 lg:px-8">
          <div className="glass relative overflow-hidden rounded-[30px] p-6 sm:p-10" style={{ border: "1px solid rgba(255,255,255,0.52)" }}>
            <div className="blob-pink pointer-events-none absolute -right-10 -top-10 h-48 w-48" />
            <div className="blob-peach pointer-events-none absolute -bottom-10 left-0 h-40 w-40" />

            <div className="relative z-10 mb-8 text-center sm:mb-10">
              <h2 className="mb-3 text-2xl font-bold text-[#3a3f52] sm:text-3xl">Cara Membuat Janji</h2>
              <p className="text-sm text-[#5D688A]/65 sm:text-base">Mudah dan cepat, hanya 3 langkah.</p>
            </div>

            <div className="relative z-10 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
              {steps.map((item, idx) => (
                <div key={item.step} className="relative text-center">
                  {idx < 2 && (
                    <div
                      className="absolute left-[calc(50%+2rem)] top-8 hidden h-0.5 w-[calc(100%-4rem)] sm:block"
                      style={{ background: `linear-gradient(90deg,${item.color}60,transparent)` }}
                    />
                  )}
                  {idx < 2 && (
                    <div className="my-3 flex justify-center sm:hidden">
                      <div className="h-8 w-0.5" style={{ background: `linear-gradient(180deg,${item.color}60,transparent)` }} />
                    </div>
                  )}
                  <div
                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform hover:scale-110 sm:h-16 sm:w-16"
                    style={{
                      background: "#e6e7ee",
                      border: "1px solid rgba(255,255,255,0.52)",
                      boxShadow: "4px 4px 8px rgba(163,177,198,0.2), -4px -4px 8px rgba(255,255,255,0.5)",
                    }}
                  >
                    <item.icon className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: item.color }} />
                  </div>
                  <div className="mb-2 text-xs font-bold" style={{ color: item.color }}>
                    LANGKAH {item.step}
                  </div>
                  <h3 className="mb-2 text-sm font-bold text-[#3a3f52] sm:text-base">{item.title}</h3>
                  <p className="text-xs text-[#5D688A]/65 sm:text-sm">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="relative z-10 mt-8 text-center sm:hidden">
              <Link href="/booking" className="btn-neu-primary inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white tap-feedback">
                <Calendar className="h-4 w-4" />
                Mulai Booking
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="section-shell px-4 sm:px-6 lg:px-8">
          <div className="glass relative overflow-hidden rounded-[30px]" style={{ border: "1px solid rgba(255,255,255,0.52)" }}>
            <div className="blob-pink pointer-events-none absolute -right-10 -top-10 h-56 w-56" />
            <div className="blob-peach pointer-events-none absolute -bottom-10 -left-10 h-40 w-40" />

            <div className="relative z-10 grid items-center gap-6 p-6 sm:p-10 lg:grid-cols-2">
              <div>
                <div className="chip-neu mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold" style={{ color: "#5D688A", border: "1px solid rgba(253,172,172,0.4)" }}>
                  <PlayCircle className="h-3.5 w-3.5" />
                  Simulasi Interaktif
                </div>

                <h2 className="mb-3 text-2xl font-bold text-[#3a3f52] sm:text-3xl">
                  Pahami Prosedur <span className="gradient-text">Sebelum Perawatan</span>
                </h2>
                <p className="mb-6 text-sm leading-relaxed text-[#5D688A]/70 sm:text-base">
                  Lihat simulasi interaktif langkah-langkah <strong>penambalan gigi</strong> agar Anda memahami prosesnya dan merasa lebih tenang sebelum perawatan.
                </p>

                <div className="mb-6 flex flex-wrap gap-2">
                  {["6 Langkah Visual", "Auto-play Mode", "Mobile Friendly"].map((tag) => (
                    <span key={tag} className="chip-neu inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold" style={{ color: "#5D688A" }}>
                      {tag}
                    </span>
                  ))}
                </div>

                <Link href="/simulasi" className="btn-neu-secondary inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold transition-all hover:scale-105 active:scale-95 tap-feedback" style={{ color: "#4e6785" }}>
                  <PlayCircle className="h-5 w-5" />
                  Lihat Simulasi
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="flex justify-center">
                <div className="relative h-64 w-64 sm:h-72 sm:w-72">
                  <div className="glass absolute inset-0 flex items-center justify-center overflow-hidden rounded-3xl" style={{ border: "1px solid rgba(255,255,255,0.52)" }}>
                    <Image
                      src="/images/simulasi/tooth-preview.png"
                      alt="Simulasi Perawatan Gigi"
                      width={280}
                      height={280}
                      className="object-contain p-2"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="btn-neu-primary flex h-16 w-16 items-center justify-center rounded-full">
                        <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-white" xmlns="http://www.w3.org/2000/svg">
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="btn-neu-primary absolute -right-2 -top-2 rounded-full px-3 py-1.5 text-[10px] font-bold text-white">
                    Step-by-Step
                  </div>
                  <div className="chip-neu absolute -bottom-2 -left-2 rounded-full px-3 py-1.5 text-[10px] font-bold" style={{ color: "#5D688A" }}>
                    Interaktif
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="section-shell max-w-4xl px-4">
          <div className="glass relative overflow-hidden rounded-[30px] px-6 py-10 text-center sm:p-12" style={{ border: "1px solid rgba(255,255,255,0.52)" }}>
            <div className="blob-pink pointer-events-none absolute -left-10 -top-10 h-56 w-56" style={{ opacity: 0.2 }} />
            <div className="blob-peach pointer-events-none absolute -bottom-10 -right-10 h-48 w-48" style={{ opacity: 0.2 }} />
            <div className="absolute right-8 top-4 h-20 w-20 rounded-full" style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.28)" }} />
            <div className="absolute bottom-4 left-8 h-12 w-12 rounded-full" style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.24)" }} />

            <div className="relative z-10">
              <div className="mb-4 text-4xl font-black text-[#5D688A] sm:text-5xl">+</div>
              <h2 className="mb-4 text-2xl font-extrabold text-[#2c3d52] text-balance sm:text-3xl">
                Siap Merawat Senyum Anda?
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-sm text-[#4e6785]/75 sm:text-base">
                Jangan tunda perawatan gigi. Buat janji sekarang dan dapatkan pelayanan terbaik dari drg. {doctorName}.
              </p>
              <Link href="/booking" className="btn-neu-primary inline-flex min-h-12 items-center gap-2 rounded-2xl px-7 py-4 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 tap-feedback">
                <Calendar className="h-5 w-5" />
                Buat Janji Sekarang
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}






