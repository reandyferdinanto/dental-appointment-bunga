import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
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
} from "lucide-react";

const services = [
  { icon: SmilePlus,   title: "Penambalan Gigi",           desc: "Restorasi gigi berlubang dengan bahan komposit berkualitas tinggi.", color: "#F7A5A5" },
  { icon: Stethoscope, title: "Pencabutan Gigi",           desc: "Prosedur pencabutan gigi yang aman dan minim rasa sakit.",          color: "#FFDBB6" },
  { icon: Sparkles,    title: "Pembersihan Karang Gigi",   desc: "Scaling profesional untuk membersihkan plak dan karang gigi.",      color: "#5D688A" },
  { icon: HeartPulse,  title: "Perawatan Saluran Akar",    desc: "Endodontik untuk menyelamatkan gigi dari infeksi pulpa.",           color: "#F7A5A5" },
  { icon: Shield,      title: "Konsultasi & Edukasi",      desc: "Konsultasi kesehatan gigi dan mulut serta edukasi perawatan.",      color: "#FFDBB6" },
  { icon: GraduationCap, title: "Perawatan Ortodonti",    desc: "Evaluasi dan perawatan dasar untuk merapikan susunan gigi.",        color: "#5D688A" },
];

const steps = [
  { step: "01", title: "Pilih Tanggal",  desc: "Lihat jadwal tersedia dan pilih tanggal yang sesuai.",              icon: Calendar,     color: "#F7A5A5" },
  { step: "02", title: "Isi Data Diri",  desc: "Lengkapi nama, nomor HP, dan keluhan gigi Anda.",                   icon: CheckCircle2, color: "#FFDBB6" },
  { step: "03", title: "Konfirmasi",     desc: "Terima konfirmasi booking dan datang sesuai jadwal.",               icon: Star,         color: "#5D688A" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-mesh overflow-x-hidden">
      <Navbar />

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] sm:min-h-[92vh] flex items-center overflow-hidden">
        {/* Blobs */}
        <div className="blob-pink absolute w-72 h-72 sm:w-96 sm:h-96 -top-20 -left-20 pointer-events-none" />
        <div className="blob-peach absolute w-64 h-64 sm:w-80 sm:h-80 top-1/3 right-0 pointer-events-none" />
        <div className="blob-navy absolute w-56 h-56 sm:w-72 sm:h-72 bottom-0 left-1/3 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
          {/* Left */}
          <div className="z-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold mb-5 sm:mb-6 glass"
              style={{ color: "#5D688A", border: "1px solid rgba(247,165,165,0.5)" }}
            >
              <span className="w-2 h-2 rounded-full bg-[#F7A5A5] animate-pulse-soft" />
              Menerima Pasien Baru ✨
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-[#3a3f52] mb-4 sm:mb-6 text-balance">
              Senyum Sehat{" "}
              <span className="gradient-text">Dimulai</span>
              <br />dari Sini 🦷
            </h1>

            <p className="text-base sm:text-lg text-[#5D688A]/75 leading-relaxed max-w-lg mb-6 sm:mb-8">
              Halo! Saya{" "}
              <span className="font-bold text-[#5D688A]">Natasya Bunga Maureen</span>
              , dokter gigi koas yang siap membantu menjaga kesehatan gigi dan mulut Anda dengan pelayanan profesional dan penuh empati 💖
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link
                href="/booking"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-xl active:scale-95 tap-feedback"
                style={{ background: "linear-gradient(135deg, #5D688A 0%, #7a88b0 100%)", boxShadow: "0 8px 25px rgba(93,104,138,0.4)" }}
              >
                <Calendar className="w-4 h-4" />
                Buat Janji Sekarang
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/jadwal"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95 tap-feedback glass"
                style={{ color: "#5D688A", border: "1px solid rgba(93,104,138,0.2)" }}
              >
                <Clock className="w-4 h-4" />
                Lihat Jadwal
              </Link>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-semibold"
                style={{ color: "#5D688A", border: "1px solid rgba(255,219,182,0.5)", background: "rgba(255,219,182,0.2)" }}>
                🎓 Dokter Gigi Koas Aktif
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-semibold"
                style={{ color: "#5D688A", border: "1px solid rgba(247,165,165,0.4)", background: "rgba(247,165,165,0.1)" }}>
                💖 Pelayanan Penuh Empati
              </div>
            </div>
          </div>

          {/* Right — illustration card (visible on all screens, centered on mobile) */}
          <div className="flex justify-center items-center mt-4 lg:mt-0">
            <div
              className="relative w-full max-w-xs sm:max-w-sm lg:max-w-md glass rounded-3xl px-6 py-8 sm:px-8 sm:py-10 text-center"
              style={{ border: "1px solid rgba(255,255,255,0.75)", boxShadow: "0 24px 70px rgba(93,104,138,0.18)" }}
            >
              {/* Layered background glow */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden">
                <div style={{ position:"absolute", top:"-30%", left:"-20%", width:"70%", height:"70%", background:"radial-gradient(circle, rgba(247,165,165,0.3) 0%, transparent 70%)", filter:"blur(20px)" }} />
                <div style={{ position:"absolute", bottom:"-20%", right:"-10%", width:"60%", height:"60%", background:"radial-gradient(circle, rgba(255,219,182,0.35) 0%, transparent 70%)", filter:"blur(20px)" }} />
              </div>

              {/* Sparkle accents */}
              <div className="absolute top-5 right-7 text-[#F7A5A5] text-xl animate-pulse-soft select-none">✦</div>
              <div className="absolute bottom-20 left-6 text-[#FFDBB6] text-base animate-pulse-soft select-none" style={{ animationDelay:"1s" }}>✦</div>

              {/* Tooth SVG illustration */}
              <div className="relative mx-auto mb-5 sm:mb-6" style={{ width: 160, height: 160 }}>
                <div className="absolute inset-0 rounded-full animate-pulse-soft"
                  style={{ background: "radial-gradient(circle, rgba(247,165,165,0.35) 0%, rgba(255,219,182,0.2) 50%, transparent 70%)" }} />
                <div className="absolute inset-3 rounded-full"
                  style={{ background: "linear-gradient(135deg, rgba(255,242,239,0.9) 0%, rgba(255,219,182,0.5) 100%)", border: "1.5px solid rgba(255,255,255,0.8)" }} />

                <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"
                  className="relative w-full h-full drop-shadow-lg" style={{ padding: "14px" }}>
                  <g>
                    <path style={{ fill:"#5D688A" }} d="M164.25,512c-49.81,0-69.856-77.647-84.493-134.341c-3.58-13.868-6.963-26.968-9.569-33.223 C40.794,273.92,23.246,200.972,23.246,149.297c0-38.541,13.133-75.119,36.981-102.995C85.773,16.444,120.995,0,159.409,0 c30.782,0,61.291,17.624,83.565,30.493l0.311,0.179c7.812,4.514,17.628,4.519,25.532-0.036l0.31-0.178 C291.45,17.602,322.012,0,352.591,0c38.414,0,73.636,16.444,99.179,46.303c0.009,0.011,0.019,0.02,0.028,0.031 c23.832,27.874,36.956,64.438,36.956,102.965c0,17.872-4.459,45.411-14.031,86.662c-1.964,8.462-10.42,13.725-18.877,11.766 c-8.462-1.964-13.729-10.415-11.765-18.876c8.893-38.327,13.217-64.348,13.217-79.553c0-31.035-10.445-60.342-29.409-82.522 c-0.006-0.008-0.014-0.016-0.02-0.024c-19.472-22.762-46.205-35.296-75.276-35.296c-22.169,0-48.519,15.175-67.758,26.255 l-0.315,0.181c-17.597,10.142-39.461,10.131-57.05-0.031c-0.041-0.024-0.187-0.107-0.228-0.131 c-19.197-11.089-45.483-26.274-67.832-26.274c-29.071,0-55.804,12.534-75.278,35.295c-18.976,22.182-29.428,51.498-29.428,82.546 c0,47.733,16.642,116.158,44.519,183.037c3.47,8.324,6.788,21.183,10.991,37.462c6.177,23.923,13.863,53.695,24.354,77.021 c6.35,14.116,13.02,24.116,19.477,29.396c0.972-3.995,2.042-8.506,3.097-12.956c7.043-29.719,17.687-74.63,32.199-113.235 c12.632-33.599,33.36-78.243,67.406-78.243c0.05,0,0.094,0,0.145,0c34.084,0.127,54.453,44.889,66.811,78.546 c14.171,38.598,24.418,83.414,31.201,113.072c0.994,4.346,2.001,8.75,2.921,12.668c8.419-6.872,15.458-20.417,19.522-29.521 c10.453-23.421,18.047-53.387,24.149-77.466c4.201-16.583,7.52-29.681,11.043-38.154c3.334-8.022,12.542-11.822,20.56-8.487 c8.023,3.334,11.822,12.539,8.487,20.56c-2.641,6.353-6.021,19.689-9.599,33.807c-14.443,56.995-34.222,135.052-84.515,135.052 c-13.007,0-16.208-12.38-18.121-19.777c-1.373-5.312-3.025-12.531-5.113-21.669c-6.604-28.881-16.586-72.524-30.065-109.242 c-20.651-56.248-35.746-57.926-37.397-57.933c-1.653,0.061-16.826,1.568-37.987,57.855c-13.811,36.734-24.178,80.476-31.035,109.42 c-2.177,9.187-3.898,16.444-5.324,21.785C180.458,499.667,177.166,512,164.25,512z"/>
                    <path style={{ fill:"#5D688A" }} d="M256,159.795c-49.963,0-94.468-20.875-110.746-51.945c-4.031-7.694-1.062-17.201,6.633-21.232 c7.691-4.03,17.201-1.062,21.232,6.633c10.823,20.658,44.906,35.087,82.881,35.087s72.057-14.428,82.881-35.087 c4.03-7.694,13.533-10.665,21.23-6.633c7.696,4.031,10.664,13.536,6.633,21.232C350.467,138.92,305.961,159.795,256,159.795z"/>
                  </g>
                  <path style={{ fill:"#F7A5A5" }} d="M83.585,335.665c0.374,0.908,0.741,1.815,1.118,2.721c12.738,30.565,29.936,157.887,79.545,157.887 c3.592,0,20.156-98.954,47.98-160.608H83.585z"/>
                  <path style={{ fill:"#5D688A" }} d="M164.25,512c-49.961,0-69.932-77.632-84.512-134.318c-3.57-13.88-6.944-26.992-9.55-33.247 l-1.145-2.785c-1.998-4.852-1.442-10.381,1.477-14.739s7.82-6.976,13.067-6.976h128.643c5.34,0,10.316,2.71,13.212,7.196 c2.896,4.486,3.32,10.135,1.123,15.003c-17.666,39.148-30.905,95.004-38.815,128.379c-2.177,9.187-3.898,16.444-5.324,21.785 C180.458,499.667,177.166,512,164.25,512z"/>
                  <path style={{ fill:"#FFDBB6" }} d="M300.865,335.665c27.295,61.611,43.041,160.465,46.605,160.465 c50.084,0,66.763-128.308,79.589-159.169l0.404-1.296H300.865z"/>
                  <path style={{ fill:"#5D688A" }} d="M347.47,511.858c-13.007,0-16.208-12.38-18.121-19.777c-1.373-5.312-3.025-12.531-5.115-21.669 c-7.631-33.366-20.403-89.215-37.75-128.376c-2.156-4.865-1.705-10.489,1.197-14.948c2.903-4.459,7.863-7.15,13.184-7.15h126.598 c5.002,0,9.704,2.378,12.668,6.406c2.965,4.028,3.836,9.225,2.35,14l-0.404,1.298c-0.145,0.461-0.308,0.914-0.492,1.361 c-2.641,6.353-6.021,19.689-9.599,33.807C417.544,433.801,397.765,511.858,347.47,511.858z"/>
                </svg>
              </div>

              {/* Name & title */}
              <h3 className="font-extrabold text-[#3a3f52] text-lg sm:text-xl mb-1">
                drg. Natasya Bunga Maureen
              </h3>
              <p className="text-sm font-medium mb-2" style={{ color: "#F7A5A5" }}>Dokter Gigi Koas</p>
              <p className="text-xs text-[#5D688A]/55 mb-4 leading-relaxed">Universitas · Stase Aktif 2026</p>

              {/* Info pills */}
              <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
                {[
                  { icon: "🦷", label: "Gigi Umum" },
                  { icon: "✨", label: "Scaling" },
                  { icon: "💊", label: "Endodontik" },
                ].map((pill) => (
                  <div key={pill.label}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold"
                    style={{ background: "rgba(255,219,182,0.3)", color: "#5D688A", border: "1px solid rgba(255,219,182,0.5)" }}>
                    <span>{pill.icon}</span>{pill.label}
                  </div>
                ))}
              </div>

              {/* Online indicator */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-semibold text-[#5D688A]"
                style={{ border: "1px solid rgba(110,198,160,0.45)", background: "rgba(110,198,160,0.1)" }}
              >
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Menerima Pasien Baru ✨
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─────────────────────────────────────── */}
      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold glass mb-4"
              style={{ color: "#5D688A", border: "1px solid rgba(247,165,165,0.4)" }}>
              <Stethoscope className="w-3.5 h-3.5" /> Layanan Kami
            </div>
            <h2 className="text-2xl sm:text-3xl sm:text-4xl font-bold text-[#3a3f52] mb-3">
              Layanan Perawatan Gigi
            </h2>
            <p className="text-[#5D688A]/65 max-w-xl mx-auto text-sm sm:text-base">
              Berbagai layanan perawatan gigi dan mulut yang tersedia untuk kebutuhan Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {services.map((svc) => (
              <div
                key={svc.title}
                className="glass rounded-2xl p-5 sm:p-6 group hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 hover:shadow-xl tap-feedback"
                style={{ border: "1px solid rgba(255,255,255,0.7)", boxShadow: "0 4px 20px rgba(93,104,138,0.08)" }}
              >
                <div
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `${svc.color}22`, border: `1px solid ${svc.color}33` }}
                >
                  <svc.icon className="w-5 h-5" style={{ color: svc.color }} />
                </div>
                <h3 className="font-bold text-[#3a3f52] mb-1.5 text-sm sm:text-base">{svc.title}</h3>
                <p className="text-xs sm:text-sm text-[#5D688A]/65 leading-relaxed">{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────── */}
      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-3xl p-6 sm:p-10 relative overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.75)", boxShadow: "0 12px 40px rgba(93,104,138,0.10)" }}>
            <div className="blob-pink absolute w-48 h-48 -top-10 -right-10 pointer-events-none" />
            <div className="blob-peach absolute w-40 h-40 -bottom-10 left-0 pointer-events-none" />

            <div className="text-center mb-8 sm:mb-10 relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#3a3f52] mb-3">Cara Membuat Janji</h2>
              <p className="text-[#5D688A]/65 text-sm sm:text-base">Mudah dan cepat — hanya 3 langkah! 🚀</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 relative z-10">
              {steps.map((item, idx) => (
                <div key={item.step} className="text-center relative">
                  {idx < 2 && (
                    <div className="hidden sm:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5"
                      style={{ background: `linear-gradient(90deg, ${item.color}60, transparent)` }} />
                  )}
                  {/* Step connector on mobile */}
                  {idx < 2 && (
                    <div className="sm:hidden flex justify-center my-3">
                      <div className="w-0.5 h-8" style={{ background: `linear-gradient(180deg, ${item.color}60, transparent)` }} />
                    </div>
                  )}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform hover:scale-110"
                    style={{ background: `linear-gradient(135deg, ${item.color}22, ${item.color}44)`, border: `2px solid ${item.color}55` }}>
                    <item.icon className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: item.color }} />
                  </div>
                  <div className="text-xs font-bold mb-2" style={{ color: item.color }}>LANGKAH {item.step}</div>
                  <h3 className="font-bold text-[#3a3f52] mb-2 text-sm sm:text-base">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-[#5D688A]/65">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Mobile CTA inside how-it-works */}
            <div className="mt-8 text-center sm:hidden relative z-10">
              <Link href="/booking"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-white tap-feedback"
                style={{ background: "linear-gradient(135deg, #5D688A, #7a88b0)", boxShadow: "0 6px 20px rgba(93,104,138,0.35)" }}>
                <Calendar className="w-4 h-4" />
                Mulai Booking
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────── */}
      <section className="py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden text-center px-6 py-10 sm:p-12"
            style={{ background: "linear-gradient(135deg, #5D688A 0%, #3a4566 100%)", boxShadow: "0 20px 60px rgba(93,104,138,0.35)" }}>
            <div className="blob-pink absolute w-56 h-56 -top-10 -left-10 pointer-events-none" style={{ opacity: 0.2 }} />
            <div className="blob-peach absolute w-48 h-48 -bottom-10 -right-10 pointer-events-none" style={{ opacity: 0.2 }} />
            <div className="absolute top-4 right-8 w-20 h-20 rounded-full" style={{ background: "rgba(255,219,182,0.15)", border: "1px solid rgba(255,255,255,0.2)" }} />
            <div className="absolute bottom-4 left-8 w-12 h-12 rounded-full" style={{ background: "rgba(247,165,165,0.15)", border: "1px solid rgba(255,255,255,0.2)" }} />

            <div className="relative z-10">
              <div className="text-4xl sm:text-5xl mb-4">🦷</div>
              <h2 className="text-2xl sm:text-3xl sm:text-4xl font-extrabold text-white mb-4 text-balance">
                Siap Merawat Senyum Anda?
              </h2>
              <p className="text-white/70 mb-8 max-w-xl mx-auto text-sm sm:text-base">
                Jangan tunda perawatan gigi. Buat janji sekarang dan dapatkan pelayanan terbaik dari drg. Natasya Bunga Maureen 💖
              </p>
              <Link href="/booking"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-105 hover:shadow-2xl active:scale-95 tap-feedback"
                style={{ background: "linear-gradient(135deg, #F7A5A5 0%, #FFDBB6 100%)", color: "#5D688A", boxShadow: "0 8px 25px rgba(247,165,165,0.5)" }}>
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
