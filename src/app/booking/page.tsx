"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import {
  Calendar,
  Clock,
  User,
  Phone,
  FileText,
  CheckCircle2,
  Loader2,
  Mail,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import TeethLoader from "@/components/ui/TeethLoader";
import {
  NeuAlert,
  NeuButton,
  NeuCard,
  NeuChip,
  NeuInput,
  NeuTextarea,
} from "@/components/ui/neumorphism";
import {
  appointmentSchema,
  type AppointmentInput,
  type FieldErrors,
  validateSchema,
} from "@/lib/validators";

const monthNames = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];
const dayNames    = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
const dayNamesFull = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];

function FormInput({ label, icon: Icon, required, error, children }: {
  label: string; icon?: React.ElementType; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#4e6785] mb-2">
        {Icon && <Icon className="w-3.5 h-3.5 inline mr-1.5 opacity-70" />}
        {label}{required && " *"}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-[#bb6868]">{error}</p>
      ) : null}
    </div>
  );
}

// â”€â”€ CALENDAR LEGEND PILL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function LegendPill({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="text-[10px] text-[#4e6785]/70">{label}</span>
    </div>
  );
}

export default function BookingPage() {
  const [step, setStep]                   = useState(1);
  const [selectedDate, setSelectedDate]   = useState("");
  const [selectedTime, setSelectedTime]   = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots]   = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [success, setSuccess]             = useState(false);
  const [error, setError]                 = useState("");
  const [fieldErrors, setFieldErrors]     = useState<FieldErrors<AppointmentInput>>({});
  const [bookingResult, setBookingResult] = useState<{id:string;date:string;time:string}|null>(null);

  // Map of dateStr â†’ slot count for the visible month
  const [monthSlots, setMonthSlots]       = useState<Record<string, number>>({});
  const [loadingMonth, setLoadingMonth]   = useState(false);

  const [form, setForm] = useState({
    patientName: "", patientPhone: "", patientEmail: "", complaint: "",
  });

  function updateForm<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const calYear  = calendarMonth.getFullYear();
  const calMonth = calendarMonth.getMonth();

  // â”€â”€ fetch ALL slots for the visible month at once â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fetchMonthSlots = useCallback(async (year: number, month: number) => {
    setLoadingMonth(true);
    try {
      // Build the first monday of the 6-week grid we need to cover entire month
      const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
      const gridStart = new Date(year, month, 1 - firstDay); // go back to Sunday
      // We need to cover ~6 weeks = 42 days starting from gridStart
      // Fetch 5 consecutive weeks to cover the whole month
      const weekStarts: string[] = [];
      for (let w = 0; w < 6; w++) {
        const d = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + w * 7);
        const ys = d.getFullYear();
        const ms = String(d.getMonth() + 1).padStart(2, "0");
        const ds = String(d.getDate()).padStart(2, "0");
        weekStarts.push(`${ys}-${ms}-${ds}`);
      }

      const results = await Promise.all(
        weekStarts.map(ws =>
          fetch(`/api/schedules?week=${ws}`)
            .then(r => r.ok ? r.json() : [])
            .then(d => Array.isArray(d) ? d : [])
        )
      );

      const map: Record<string, number> = {};
      results.flat().forEach((s: { date: string; slots: string[] }) => {
        if (s?.date && Array.isArray(s.slots)) {
          map[s.date] = s.slots.length;
        }
      });
      setMonthSlots(map);
    } catch (e) { console.error(e); }
    setLoadingMonth(false);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void fetchMonthSlots(calYear, calMonth);
    }, 0);
    return () => window.clearTimeout(id);
  }, [calYear, calMonth, fetchMonthSlots]);

  const loadSlots = useCallback(async (date: string) => {
    setLoadingSlots(true);
    setAvailableSlots([]);
    try {
      const res = await fetch(`/api/schedules?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableSlots(Array.isArray(data?.slots) ? data.slots.sort() : []);
      }
    } catch (err) { console.error(err); }
    setLoadingSlots(false);
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    const id = window.setTimeout(() => {
      void loadSlots(selectedDate);
    }, 0);
    return () => window.clearTimeout(id);
  }, [selectedDate, loadSlots]);

  async function handleSubmit() {
    const payload = { ...form, koasId: "bunga", date: selectedDate, time: selectedTime };
    const parsed = await validateSchema(appointmentSchema, payload);
    if (!parsed.success) {
      setFieldErrors(parsed.errors as FieldErrors<AppointmentInput>);
      setError(parsed.message);
      return;
    }

    setSubmitting(true);
    setError("");
    setFieldErrors({});
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (res.ok) {
        const data = await res.json();
        setBookingResult({ id: data.id, date: selectedDate, time: selectedTime });
        setSuccess(true);
      } else {
        const errData = await res.json();
        if (errData?.details && typeof errData.details === "object") {
          setFieldErrors(errData.details as FieldErrors<AppointmentInput>);
        }
        setError(errData.error || "Gagal membuat janji");
      }
    } catch { setError("Terjadi kesalahan. Silakan coba lagi."); }
    setSubmitting(false);
  }

  function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
  function getFirstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay(); }

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay    = getFirstDayOfMonth(calYear, calMonth);

  const todayDate = new Date(); todayDate.setHours(0,0,0,0);
  const todayStr  = `${todayDate.getFullYear()}-${String(todayDate.getMonth()+1).padStart(2,"0")}-${String(todayDate.getDate()).padStart(2,"0")}`;

  function toDateStr(y: number, m: number, d: number) {
    return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  }

  // â”€â”€ slot count â†’ visual tier â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function slotTier(count: number): "high" | "mid" | "low" | "none" {
    if (count >= 6) return "high";
    if (count >= 3) return "mid";
    if (count >= 1) return "low";
    return "none";
  }

  const tierColors = {
    high: "#FDACAC",
    mid:  "#FEC3C3",
    low:  "#E79191",
    none: "transparent",
  };

  // â”€â”€ Success screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (success && bookingResult) {
    const parts = bookingResult.date.split("-").map(Number);
    const d = new Date(parts[0], parts[1]-1, parts[2]);
    return (
      <div className="min-h-screen flex flex-col bg-mesh">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-8 px-4">
          <div className="w-full max-w-md mx-auto text-center animate-slide-up">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
              style={{
                background: "#e6e7ee",
                border: "1px solid rgba(255,255,255,0.52)",
                boxShadow: "4px 4px 8px rgba(165,188,176,0.2), -4px -4px 8px rgba(255,255,255,0.56)",
              }}>
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: "#FDACAC" }} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#3a3f52] mb-2">Booking Berhasil</h1>
            <p className="text-sm text-[#5D688A]/65 mb-6">Janji temu Anda telah terdaftar dan menunggu konfirmasi.</p>
            <NeuCard className="mb-6 rounded-[28px] p-5 text-left space-y-3">
              {[
                { label: "ID Booking", value: bookingResult.id.slice(0,8)+"..." },
                { label: "Tanggal",    value: `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}` },
                { label: "Waktu",      value: bookingResult.time },
                { label: "Pasien",     value: form.patientName },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-sm text-[#4e6785]/60">{item.label}</span>
                  <span className="text-sm font-semibold text-[#3a3f52]">{item.value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#4e6785]/60">Status</span>
                <NeuChip className="px-2.5 py-1 text-[10px]" style={{ color: "#4e6785" }}>
                  Menunggu Konfirmasi
                </NeuChip>
              </div>
            </NeuCard>
            <div className="flex flex-col gap-3">
              <Link href="/" className="btn-neu-primary min-h-12 px-6 py-3.5 rounded-2xl font-bold text-sm text-white text-center transition-all active:scale-95">
                Kembali ke Beranda
              </Link>
              <Link href="/jadwal" className="btn-neu-secondary min-h-12 px-6 py-3.5 rounded-2xl font-bold text-sm text-center transition-all active:scale-95"
                style={{ color: "#4e6785" }}>
                Lihat Jadwal
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Navbar />
      <main className="flex-1 py-6 sm:py-12">
        <div className="max-w-lg mx-auto px-4">

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3a3f52]">Buat Janji Temu</h1>
            <p className="mt-1.5 text-sm text-[#4e6785]/70">Pilih jadwal dan lengkapi data Anda</p>
          </div>

          {/* Steps indicator */}
          <div className="glass mb-6 rounded-[2rem] border border-white/55 bg-white/38 px-4 py-4 shadow-[14px_14px_28px_rgba(163,177,198,0.14),-12px_-12px_24px_rgba(255,255,255,0.78)] backdrop-blur-xl sm:mb-8"><div className="flex items-center justify-center gap-0">
            {[{n:1,label:"Tanggal"},{n:2,label:"Waktu"},{n:3,label:"Data Diri"}].map((s, i) => (
              <div key={s.n} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                    style={step >= s.n ? {
                      background: "#4e6785",
                      color: "white",
                      boxShadow: "4px 4px 8px rgba(137,150,166,0.28), -4px -4px 8px rgba(255,255,255,0.12)"
                    } : {
                      background: "#e6e7ee",
                      color: "rgba(78,103,133,0.55)",
                      border: "1px solid rgba(255,255,255,0.52)",
                      boxShadow: "4px 4px 8px rgba(163,177,198,0.24), -4px -4px 8px rgba(255,255,255,0.42)"
                    }}>
                    {step > s.n ? "✓" : s.n}
                  </div>
                  <span className="text-[10px] font-medium mt-1"
                    style={{ color: step >= s.n ? "#4e6785" : "rgba(78,103,133,0.4)" }}>{s.label}</span>
                </div>
                {i < 2 && <div className="w-12 sm:w-16 h-0.5 mb-4 rounded"
                  style={{ background: step > s.n ? "rgba(253,172,172,0.5)" : "rgba(93,104,138,0.12)" }} />}
              </div>
            ))}
          </div></div>

          {/* â”€â”€ STEP 1: Select Date â”€â”€ */}
          {step === 1 && (
            <NeuCard className="animate-slide-up rounded-[30px] p-4 sm:p-6">

              {/* Keyframes for mini loading animations */}
              <style>{`
                @keyframes calBounce { 0%,100%{transform:translateY(0) rotate(-1deg);} 50%{transform:translateY(-7px) rotate(1deg);} }
                @keyframes calFloat  { 0%,100%{transform:translateY(0);opacity:1;} 50%{transform:translateY(-5px);opacity:0.6;} }
                @keyframes calDot    { 0%,80%,100%{transform:scale(1);opacity:0.35;} 40%{transform:scale(1.6);opacity:1;} }
                @keyframes calShim   { 0%,100%{opacity:0.2;} 50%{opacity:0.85;} }
              `}</style>

              {/* Card header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" style={{ color: "#FDACAC" }} />
                  <h2 className="font-bold text-[#3a3f52]">Pilih Tanggal</h2>
                </div>
                {/* Mini teeth pill â€” shows when re-fetching (month nav) after first load */}
                {loadingMonth && Object.keys(monthSlots).length > 0 && (
                  <div className="chip-neu flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                    style={{ color:"#5D688A" }}>
                    <svg viewBox="0 0 18 10" xmlns="http://www.w3.org/2000/svg" className="w-4 h-2.5"
                      style={{ animation:"calShim 1s ease-in-out infinite" }}>
                      <rect x="0"  y="0" width="5"   height="6.5" rx="2" fill="#FDACAC"/>
                      <rect x="6"  y="0" width="6"   height="8"   rx="2" fill="#FEC3C3"/>
                      <rect x="13" y="0" width="5"   height="6.5" rx="2" fill="#FDACAC"/>
                      <rect x="0"  y="7" width="5"   height="3"   rx="1" fill="#FDACAC" opacity="0.45"/>
                      <rect x="6"  y="8.5" width="6" height="1.5" rx="1" fill="#FEC3C3" opacity="0.45"/>
                    </svg>
                    Memuat...
                  </div>
                )}
              </div>

              {/* Month navigation */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setCalendarMonth(new Date(calYear, calMonth-1, 1))}
                  className="p-2.5 rounded-xl hover:bg-white/60 text-[#5D688A] transition-all tap-feedback">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h3 className="font-bold text-[#3a3f52] text-sm sm:text-base">
                  {monthNames[calMonth]} {calYear}
                </h3>
                <button onClick={() => setCalendarMonth(new Date(calYear, calMonth+1, 1))}
                  className="p-2.5 rounded-xl hover:bg-white/60 text-[#5D688A] transition-all tap-feedback">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day labels */}
              <div className="grid grid-cols-7 mb-1">
                {dayNames.map((d, i) => (
                  <div key={d} className="text-center text-[10px] font-bold py-1.5"
                    style={{ color: i === 0 ? "rgba(253,172,172,0.7)" : "rgba(93,104,138,0.45)" }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* â”€â”€ FIRST LOAD: full mini teeth banner instead of calendar grid â”€â”€ */}
              {loadingMonth && Object.keys(monthSlots).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 gap-2.5 select-none mb-4">
                  {/* Bouncing teeth circle */}
                  <div className="relative w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                      background: "#e6e7ee",
                      border: "1px solid rgba(255,255,255,0.52)",
                      boxShadow: "4px 4px 8px rgba(163,177,198,0.22), -4px -4px 8px rgba(255,255,255,0.42)",
                      animation: "calBounce 1.6s ease-in-out infinite",
                    }}>
                    <svg viewBox="0 0 72 56" xmlns="http://www.w3.org/2000/svg" className="w-14 h-11">
                      {/* top gum */}
                      <rect x="3" y="5"  width="66" height="10" rx="5" fill="#FDACAC" opacity="0.82"/>
                      {/* top teeth */}
                      <rect x="5"  y="11" width="12" height="16" rx="3.5" fill="white" stroke="#FDACAC" strokeWidth="1.2"/>
                      <rect x="19" y="10" width="13" height="18" rx="3.5" fill="white" stroke="#FEC3C3" strokeWidth="1.2"/>
                      <rect x="34" y="9"  width="15" height="20" rx="4"   fill="white" stroke="#FDACAC" strokeWidth="1.2"/>
                      <rect x="51" y="10" width="13" height="18" rx="3.5" fill="white" stroke="#FEC3C3" strokeWidth="1.2"/>
                      {/* shine */}
                      <circle cx="39" cy="14" r="2" fill="white" opacity="0.9"/>
                      {/* bottom gum */}
                      <rect x="3" y="41" width="66" height="10" rx="5" fill="#FEC3C3" opacity="0.82"/>
                      {/* bottom teeth */}
                      <rect x="6"  y="30" width="11" height="14" rx="3.5" fill="white" stroke="#FEC3C3" strokeWidth="1.2"/>
                      <rect x="20" y="29" width="12" height="15" rx="3.5" fill="white" stroke="#FDACAC" strokeWidth="1.2"/>
                      <rect x="34" y="28" width="14" height="17" rx="4"   fill="white" stroke="#FEC3C3" strokeWidth="1.2"/>
                      <rect x="51" y="29" width="12" height="15" rx="3.5" fill="white" stroke="#FDACAC" strokeWidth="1.2"/>
                      {/* toothbrush handle */}
                      <rect x="46" y="46" width="22" height="7"  rx="3.5" fill="#5D688A" opacity="0.8"
                        style={{ animation:"calShim 1.6s ease-in-out infinite", transformOrigin:"46px 50px" }}/>
                      <rect x="26" y="44" width="22" height="9"  rx="3.5" fill="#7a88b0"
                        style={{ animation:"calShim 1.6s ease-in-out infinite" }}/>
                      {[28,32,36,40,44].map(x => (
                        <line key={x} x1={x} y1="44" x2={x} y2="39" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                      ))}
                    </svg>
                    <span className="absolute -top-1.5 -right-0.5 text-sm"
                      style={{ animation:"calFloat 2s ease-in-out infinite" }}>*</span>
                    <span className="absolute -bottom-1 -left-1 text-xs"
                      style={{ animation:"calFloat 2.3s ease-in-out infinite 0.5s" }}>*</span>
                  </div>
                  <p className="text-xs font-bold text-[#3a3f52]">Tunggu ya, kami cek jadwal dulu</p>
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: "#4e6785",
                          animation: "calDot 1.2s ease-in-out infinite",
                          animationDelay: `${i * 0.2}s`,
                        }}/>
                    ))}
                  </div>
                </div>
              ) : (
              /* â”€â”€ Calendar grid â”€â”€ */
              <div className="grid grid-cols-7 gap-1 mb-4">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day      = i + 1;
                  const dateStr  = toDateStr(calYear, calMonth, day);
                  const cellDate = new Date(calYear, calMonth, day);
                  const isPast   = cellDate < todayDate;
                  const isSunday = cellDate.getDay() === 0;
                  const isToday  = dateStr === todayStr;
                  const isSelected  = selectedDate === dateStr;
                  const isDisabled  = isPast || isSunday;
                  const count    = monthSlots[dateStr] ?? -1;
                  const hasSlots = !isDisabled && count > 0;
                  const noSlots  = !isDisabled && count === 0;
                  const tier     = hasSlots ? slotTier(count) : "none";

                  return (
                    <button key={day}
                      disabled={isDisabled || noSlots}
                      onClick={() => { setSelectedDate(dateStr); setSelectedTime(""); }}
                      className="relative flex flex-col items-center justify-center rounded-xl transition-all tap-feedback"
                      style={{
                        aspectRatio: "1/1",
                        ...(isSelected ? {
                          background: "#4e6785",
                          boxShadow: "4px 4px 8px rgba(137,150,166,0.28), -4px -4px 8px rgba(255,255,255,0.12)",
                        } : isToday && !isDisabled ? {
                          background: "#e6e7ee",
                          border: "1px solid rgba(253,172,172,0.35)",
                        } : isDisabled ? { opacity: 0.25 }
                          : noSlots  ? { opacity: 0.35 }
                          : { background:"#e6e7ee", border:"1px solid rgba(255,255,255,0.5)" }),
                        cursor: isDisabled || noSlots ? "not-allowed" : "pointer",
                      }}>

                      {/* Day number */}
                      <span className="text-xs sm:text-sm font-semibold leading-none"
                        style={{
                          color: isSelected ? "white"
                            : isToday ? "#FDACAC"
                            : isSunday ? "rgba(253,172,172,0.5)"
                            : "#3a3f52",
                        }}>
                        {day}
                      </span>

                      {/* â”€â”€ Indicator below day number â”€â”€ */}
                      {!isDisabled && (
                        loadingMonth && count === -1 ? (
                          /* Shimmer mini-teeth while this cell's data is loading */
                          <svg viewBox="0 0 16 9" xmlns="http://www.w3.org/2000/svg"
                            className="mt-0.5 w-4 h-2"
                            style={{
                              animation: "calShim 1.1s ease-in-out infinite",
                              animationDelay: `${(i % 7) * 0.07}s`,
                            }}>
                            {/* top gum strip */}
                            <rect x="0" y="0" width="16" height="2.5" rx="1.2" fill="#FDACAC" opacity="0.6"/>
                            {/* two mini top teeth */}
                            <rect x="0.5" y="2"   width="6.5" height="4" rx="1.5" fill="white" stroke="#FDACAC" strokeWidth="0.6"/>
                            <rect x="8.5" y="2"   width="7"   height="4" rx="1.5" fill="white" stroke="#FEC3C3" strokeWidth="0.6"/>
                            {/* bottom gum strip */}
                            <rect x="0" y="6.5" width="16" height="2.5" rx="1.2" fill="#FEC3C3" opacity="0.55"/>
                          </svg>
                        ) : count >= 0 ? (
                          /* Normal colored dot when loaded */
                          <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{
                              background: isSelected ? "rgba(255,255,255,0.8)"
                                : count === 0 ? "rgba(93,104,138,0.2)"
                                : tierColors[tier],
                            }}/>
                        ) : null
                      )}

                      {/* Today badge */}
                      {isToday && !isSelected && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                          style={{ background: "#FDACAC" }}/>
                      )}
                    </button>
                  );
                })}
              </div>
              )}

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1 mb-4">
                <LegendPill color="#FDACAC" label="Banyak slot (6+)" />
                <LegendPill color="#FEC3C3" label="Beberapa slot (3-5)" />
                <LegendPill color="#E79191" label="Sedikit slot (1-2)" />
                <LegendPill color="rgba(93,104,138,0.2)" label="Penuh / tidak ada" />
              </div>

              {/* Selected date info card */}
              {selectedDate && (() => {
                const parts = selectedDate.split("-").map(Number);
                const sd = new Date(parts[0], parts[1]-1, parts[2]);
                const count = monthSlots[selectedDate] ?? 0;
                return (
                  <NeuCard inset className="mb-4 flex items-center gap-3 rounded-2xl p-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "#4e6785" }}>
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#3a3f52]">
                        {dayNamesFull[sd.getDay()]}, {sd.getDate()} {monthNames[sd.getMonth()]} {sd.getFullYear()}
                      </p>
                      <p className="text-xs text-[#5D688A]/65 mt-0.5">
                        {count > 0 ? `${count} slot waktu tersedia` : "Tidak ada slot tersedia"}
                      </p>
                    </div>
                  </NeuCard>
                );
              })()}

              <NeuButton disabled={!selectedDate || (monthSlots[selectedDate] ?? 0) === 0}
                onClick={() => setStep(2)}
                variant="primary" size="lg" className="w-full hover:scale-[1.01] tap-feedback">
                Lanjut Pilih Waktu
              </NeuButton>
            </NeuCard>
          )}

          {/* â”€â”€ STEP 2: Select Time â”€â”€ */}
          {step === 2 && (
            <NeuCard className="animate-slide-up rounded-[30px] p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-5 h-5" style={{ color: "#FDACAC" }} />
                <h2 className="font-bold text-[#3a3f52]">Pilih Waktu</h2>
              </div>
              {(() => {
                const parts = selectedDate.split("-").map(Number);
                const sd = new Date(parts[0], parts[1]-1, parts[2]);
                return (
                  <p className="text-xs text-[#5D688A]/60 mb-5">
                    {dayNamesFull[sd.getDay()]}, {sd.getDate()} {monthNames[sd.getMonth()]} {sd.getFullYear()}
                  </p>
                );
              })()}

              {loadingSlots ? (
                <TeethLoader message="Tunggu yaa, kami cek slot yang tersedia" />
              ) : availableSlots.length > 0 ? (
                <>
                  <p className="text-xs font-semibold text-[#5D688A]/55 mb-3">
                    {availableSlots.length} slot tersedia, pilih salah satu
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
                    {availableSlots.map((slot) => (
                      <button key={slot} onClick={() => setSelectedTime(slot)}
                        className="py-3 rounded-2xl text-sm font-semibold transition-all hover:scale-[1.04] active:scale-95 tap-feedback"
                        style={selectedTime === slot ? {
                          background: "#4e6785",
                          color: "white",
                          boxShadow: "4px 4px 8px rgba(137,150,166,0.28), -4px -4px 8px rgba(255,255,255,0.12)"
                        } : {
                          background: "#e6e7ee",
                          border: "1px solid rgba(255,255,255,0.5)",
                          color: "#5D688A"
                        }}>
                        {slot}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-10">
                  <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: "#FDACAC" }} />
                  <p className="text-sm font-semibold text-[#3a3f52]">Belum ada slot tersedia</p>
                  <p className="text-xs text-[#5D688A]/55 mt-1">Silakan pilih tanggal lain.</p>
                </div>
              )}

              <div className="flex gap-3">
                <NeuButton onClick={() => setStep(1)}
                  variant="secondary" size="lg" className="flex-1 tap-feedback">
                  Kembali
                </NeuButton>
                <NeuButton disabled={!selectedTime} onClick={() => setStep(3)}
                  variant="primary" size="lg" className="flex-1 hover:scale-[1.01] tap-feedback">
                  Lanjut Isi Data
                </NeuButton>
              </div>
            </NeuCard>
          )}

          {/* â”€â”€ STEP 3: Patient Info â”€â”€ */}
          {step === 3 && (
            <NeuCard className="animate-slide-up rounded-[30px] p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5" style={{ color: "#FDACAC" }} />
                <h2 className="font-bold text-[#3a3f52]">Data Diri Pasien</h2>
              </div>

              <NeuCard inset className="mb-5 flex items-center gap-4 rounded-2xl p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5D688A]">
                  <Calendar className="w-3.5 h-3.5 text-[#FDACAC]" />
                  {(() => { const p=selectedDate.split("-").map(Number); const d=new Date(p[0],p[1]-1,p[2]); return `${d.getDate()} ${monthNames[d.getMonth()]}`; })()}
                </div>
                <div className="w-px h-4 bg-[#5D688A]/20" />
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5D688A]">
                  <Clock className="w-3.5 h-3.5 text-[#FDACAC]" />
                  {selectedTime}
                </div>
              </NeuCard>

              {error && (
                <NeuAlert tone="danger" className="mb-4 text-sm font-medium">{error}</NeuAlert>
              )}

              <div className="space-y-4">
                <FormInput label="Nama Lengkap" icon={User} required error={fieldErrors.patientName}>
                  <NeuInput type="text" value={form.patientName}
                    onChange={e => updateForm("patientName", e.target.value)}
                    placeholder="Masukkan nama lengkap" />
                </FormInput>
                <FormInput label="Nomor HP / WhatsApp" icon={Phone} required error={fieldErrors.patientPhone}>
                  <NeuInput type="tel" value={form.patientPhone}
                    onChange={e => updateForm("patientPhone", e.target.value)}
                    placeholder="08xxxxxxxxxx" />
                </FormInput>
                <FormInput label="Email (opsional)" icon={Mail} error={fieldErrors.patientEmail}>
                  <NeuInput type="email" value={form.patientEmail}
                    onChange={e => updateForm("patientEmail", e.target.value)}
                    placeholder="email@contoh.com" />
                </FormInput>
                <FormInput label="Keluhan" icon={FileText} required error={fieldErrors.complaint}>
                  <NeuTextarea rows={3} value={form.complaint}
                    onChange={e => updateForm("complaint", e.target.value)}
                    placeholder="Jelaskan keluhan gigi Anda..." />
                </FormInput>
              </div>

              <div className="flex gap-3 mt-6">
                <NeuButton onClick={() => setStep(2)}
                  variant="secondary" size="lg" className="flex-1 tap-feedback">
                  Kembali
                </NeuButton>
                <NeuButton
                  disabled={submitting || !form.patientName || !form.patientPhone || !form.complaint}
                  onClick={handleSubmit}
                  variant="primary" size="lg" className="flex-1 hover:scale-[1.01] tap-feedback">
                  {submitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                    : <><CheckCircle2 className="w-4 h-4" /> Konfirmasi</>}
                </NeuButton>
              </div>
            </NeuCard>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}





