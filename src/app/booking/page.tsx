"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import {
  Calendar,
  Clock,
  User,
  Phone,
  FileText,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Mail,
} from "lucide-react";
import Link from "next/link";

interface Schedule {
  date: string;
  slots: string[];
}

const monthNames = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];
const dayNames = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];

// Input field component for consistency
function FormInput({ label, icon: Icon, required, children }: {
  label: string; icon?: React.ElementType; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#5D688A] mb-2">
        {Icon && <Icon className="w-3.5 h-3.5 inline mr-1.5 opacity-70" />}
        {label}{required && " *"}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  background: "rgba(255,255,255,0.75)",
  border: "1.5px solid rgba(93,104,138,0.18)",
  color: "#3a3f52",
};

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [bookingResult, setBookingResult] = useState<{id: string; date: string; time: string} | null>(null);

  const [form, setForm] = useState({
    patientName: "",
    patientPhone: "",
    patientEmail: "",
    complaint: "",
  });

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    if (selectedDate) loadSlots(selectedDate);
  }, [selectedDate]);

  async function loadSlots(date: string) {
    setLoadingSlots(true);
    setAvailableSlots([]);
    try {
      const res = await fetch(`/api/schedules?date=${date}`);
      if (res.ok) {
        const data: Schedule = await res.json();
        setAvailableSlots(data.slots.sort());
      }
    } catch (err) { console.error(err); }
    setLoadingSlots(false);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, koasId: "bunga", date: selectedDate, time: selectedTime }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookingResult({ id: data.id, date: selectedDate, time: selectedTime });
        setSuccess(true);
      } else {
        const errData = await res.json();
        setError(errData.error || "Gagal membuat janji");
      }
    } catch { setError("Terjadi kesalahan. Silakan coba lagi."); }
    setSubmitting(false);
  }

  function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
  function getFirstDayOfMonth(year: number, month: number) { return new Date(year, month, 1).getDay(); }

  const calYear = calendarMonth.getFullYear();
  const calMonth = calendarMonth.getMonth();
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Success screen
  if (success && bookingResult) {
    const d = new Date(bookingResult.date);
    return (
      <div className="min-h-screen flex flex-col bg-mesh">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-8 px-4">
          <div className="w-full max-w-md mx-auto text-center animate-slide-up">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(110,198,160,0.2), rgba(110,198,160,0.4))", border: "2px solid rgba(110,198,160,0.5)" }}>
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: "#3aaa7c" }} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#3a3f52] mb-2">Booking Berhasil! 🎉</h1>
            <p className="text-sm text-[#5D688A]/65 mb-6">Janji temu Anda telah terdaftar dan menunggu konfirmasi.</p>
            <div className="glass rounded-2xl p-5 mb-6 text-left space-y-3"
              style={{ border: "1px solid rgba(255,255,255,0.75)" }}>
              {[
                { label: "ID Booking", value: bookingResult.id.slice(0, 8) + "..." },
                { label: "Tanggal",    value: `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}` },
                { label: "Waktu",      value: bookingResult.time },
                { label: "Pasien",     value: form.patientName },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-sm text-[#5D688A]/60">{item.label}</span>
                  <span className="text-sm font-semibold text-[#3a3f52] break-word">{item.value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#5D688A]/60">Status</span>
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ background: "rgba(255,219,182,0.4)", color: "#b87333" }}>
                  Menunggu Konfirmasi
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/" className="px-6 py-3.5 rounded-2xl font-bold text-sm text-white text-center transition-all hover:scale-[1.02] active:scale-95 tap-feedback"
                style={{ background: "linear-gradient(135deg, #5D688A, #7a88b0)", boxShadow: "0 6px 20px rgba(93,104,138,0.35)" }}>
                Kembali ke Beranda
              </Link>
              <Link href="/jadwal" className="px-6 py-3.5 rounded-2xl font-bold text-sm text-center glass transition-all hover:scale-[1.02] active:scale-95 tap-feedback"
                style={{ border: "1px solid rgba(93,104,138,0.2)", color: "#5D688A" }}>
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3a3f52]">Buat Janji Temu 🦷</h1>
            <p className="mt-1.5 text-sm text-[#5D688A]/65">Pilih jadwal dan lengkapi data Anda</p>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-0 mb-6 sm:mb-8">
            {[
              { n: 1, label: "Tanggal" },
              { n: 2, label: "Waktu" },
              { n: 3, label: "Data Diri" },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                    style={step >= s.n ? {
                      background: "linear-gradient(135deg, #F7A5A5, #5D688A)",
                      color: "white",
                      boxShadow: "0 4px 12px rgba(247,165,165,0.4)"
                    } : {
                      background: "rgba(255,255,255,0.6)",
                      color: "rgba(93,104,138,0.5)",
                      border: "1px solid rgba(93,104,138,0.15)"
                    }}
                  >
                    {step > s.n ? "✓" : s.n}
                  </div>
                  <span className="text-[10px] font-medium mt-1" style={{ color: step >= s.n ? "#5D688A" : "rgba(93,104,138,0.4)" }}>{s.label}</span>
                </div>
                {i < 2 && <div className="w-12 sm:w-16 h-0.5 mb-4 rounded" style={{ background: step > s.n ? "rgba(247,165,165,0.5)" : "rgba(93,104,138,0.12)" }} />}
              </div>
            ))}
          </div>

          {/* Step 1: Select Date */}
          {step === 1 && (
            <div className="glass rounded-3xl p-4 sm:p-6 animate-slide-up"
              style={{ border: "1px solid rgba(255,255,255,0.75)", boxShadow: "0 8px 32px rgba(93,104,138,0.1)" }}>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5" style={{ color: "#F7A5A5" }} />
                <h2 className="font-bold text-[#3a3f52]">Pilih Tanggal</h2>
              </div>

              {/* Calendar Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setCalendarMonth(new Date(calYear, calMonth - 1, 1))}
                  className="p-2.5 rounded-xl hover:bg-white/60 text-[#5D688A] transition-all tap-feedback">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="font-semibold text-[#3a3f52] text-sm sm:text-base">
                  {monthNames[calMonth]} {calYear}
                </h3>
                <button onClick={() => setCalendarMonth(new Date(calYear, calMonth + 1, 1))}
                  className="p-2.5 rounded-xl hover:bg-white/60 text-[#5D688A] transition-all tap-feedback">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-5">
                {dayNames.map((d) => (
                  <div key={d} className="text-center text-[10px] sm:text-xs font-semibold text-[#5D688A]/50 py-2">
                    {d}
                  </div>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(calYear, calMonth, day);
                  const dateStr = `${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                  const isPast = date < today;
                  const isSunday = date.getDay() === 0;
                  const isSelected = selectedDate === dateStr;
                  const isDisabled = isPast || isSunday;
                  const todayD = new Date();
                  const isToday = dateStr === `${todayD.getFullYear()}-${String(todayD.getMonth()+1).padStart(2,"0")}-${String(todayD.getDate()).padStart(2,"0")}`;

                  return (
                    <button key={day} disabled={isDisabled} onClick={() => { setSelectedDate(dateStr); setSelectedTime(""); }}
                      className="aspect-square flex items-center justify-center rounded-xl text-xs sm:text-sm font-medium transition-all tap-feedback"
                      style={isSelected ? {
                        background: "linear-gradient(135deg, #F7A5A5, #5D688A)",
                        color: "white",
                        boxShadow: "0 4px 12px rgba(247,165,165,0.4)"
                      } : isToday && !isDisabled ? {
                        border: "1.5px solid rgba(247,165,165,0.6)",
                        color: "#F7A5A5",
                        fontWeight: 700,
                        background: "rgba(247,165,165,0.1)"
                      } : isDisabled ? {
                        color: "rgba(93,104,138,0.2)",
                        cursor: "not-allowed"
                      } : {
                        color: "#3a3f52"
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {selectedDate && (
                <div className="mb-4 px-3 py-2 rounded-xl text-xs font-semibold text-center"
                  style={{ background: "rgba(247,165,165,0.15)", color: "#5D688A", border: "1px solid rgba(247,165,165,0.25)" }}>
                  📅 {new Date(selectedDate).getDate()} {monthNames[new Date(selectedDate).getMonth()]} {new Date(selectedDate).getFullYear()} dipilih
                </div>
              )}

              <button disabled={!selectedDate} onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.01] active:scale-95 tap-feedback"
                style={{ background: "linear-gradient(135deg, #5D688A, #7a88b0)", boxShadow: "0 6px 20px rgba(93,104,138,0.3)" }}>
                Lanjut Pilih Waktu →
              </button>
            </div>
          )}

          {/* Step 2: Select Time */}
          {step === 2 && (
            <div className="glass rounded-3xl p-4 sm:p-6 animate-slide-up"
              style={{ border: "1px solid rgba(255,255,255,0.75)", boxShadow: "0 8px 32px rgba(93,104,138,0.1)" }}>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-5 h-5" style={{ color: "#F7A5A5" }} />
                <h2 className="font-bold text-[#3a3f52]">Pilih Waktu</h2>
              </div>
              <p className="text-xs text-[#5D688A]/60 mb-5">
                📅 {new Date(selectedDate).getDate()} {monthNames[new Date(selectedDate).getMonth()]} {new Date(selectedDate).getFullYear()}
              </p>

              {loadingSlots ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#F7A5A5" }} />
                  <p className="text-xs text-[#5D688A]/55">Memuat jadwal tersedia...</p>
                </div>
              ) : availableSlots.length > 0 ? (
                <>
                  <p className="text-xs font-semibold text-[#5D688A]/55 mb-3">{availableSlots.length} slot tersedia</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
                    {availableSlots.map((slot) => (
                      <button key={slot} onClick={() => setSelectedTime(slot)}
                        className="py-3 rounded-2xl text-sm font-semibold border-0 transition-all hover:scale-[1.04] active:scale-95 tap-feedback"
                        style={selectedTime === slot ? {
                          background: "linear-gradient(135deg, #F7A5A5, #5D688A)",
                          color: "white",
                          boxShadow: "0 4px 15px rgba(247,165,165,0.4)"
                        } : {
                          background: "rgba(255,255,255,0.7)",
                          border: "1px solid rgba(93,104,138,0.15)",
                          color: "#5D688A"
                        }}>
                        {slot}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-10">
                  <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: "#F7A5A5" }} />
                  <p className="text-sm font-semibold text-[#3a3f52]">Belum ada slot tersedia</p>
                  <p className="text-xs text-[#5D688A]/55 mt-1">Silakan pilih tanggal lain atau hubungi kami.</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-[#5D688A] transition-all active:scale-95 tap-feedback"
                  style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(93,104,138,0.15)" }}>
                  ← Kembali
                </button>
                <button disabled={!selectedTime} onClick={() => setStep(3)}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-white disabled:opacity-40 transition-all hover:scale-[1.01] active:scale-95 tap-feedback"
                  style={{ background: "linear-gradient(135deg, #5D688A, #7a88b0)", boxShadow: "0 6px 20px rgba(93,104,138,0.3)" }}>
                  Lanjut Isi Data →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Patient Info */}
          {step === 3 && (
            <div className="glass rounded-3xl p-4 sm:p-6 animate-slide-up"
              style={{ border: "1px solid rgba(255,255,255,0.75)", boxShadow: "0 8px 32px rgba(93,104,138,0.1)" }}>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5" style={{ color: "#F7A5A5" }} />
                <h2 className="font-bold text-[#3a3f52]">Data Diri Pasien</h2>
              </div>

              {/* Selected summary */}
              <div className="flex items-center gap-4 p-3 rounded-2xl mb-5"
                style={{ background: "rgba(255,219,182,0.2)", border: "1px solid rgba(255,219,182,0.4)" }}>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5D688A]">
                  <Calendar className="w-3.5 h-3.5 text-[#F7A5A5]" />
                  {new Date(selectedDate).getDate()} {monthNames[new Date(selectedDate).getMonth()]}
                </div>
                <div className="w-px h-4 bg-[#5D688A]/20" />
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5D688A]">
                  <Clock className="w-3.5 h-3.5 text-[#F7A5A5]" />
                  {selectedTime}
                </div>
              </div>

              {error && (
                <div className="rounded-2xl p-3 mb-4 text-sm font-medium"
                  style={{ background: "rgba(247,165,165,0.2)", border: "1px solid rgba(247,165,165,0.4)", color: "#c0504f" }}>
                  ⚠️ {error}
                </div>
              )}

              <div className="space-y-4">
                <FormInput label="Nama Lengkap" icon={User} required>
                  <input type="text" value={form.patientName}
                    onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                    placeholder="Masukkan nama lengkap"
                    className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all"
                    style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = "#F7A5A5"}
                    onBlur={e => e.currentTarget.style.borderColor = "rgba(93,104,138,0.18)"}
                  />
                </FormInput>

                <FormInput label="Nomor HP / WhatsApp" icon={Phone} required>
                  <input type="tel" value={form.patientPhone}
                    onChange={(e) => setForm({ ...form, patientPhone: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all"
                    style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = "#F7A5A5"}
                    onBlur={e => e.currentTarget.style.borderColor = "rgba(93,104,138,0.18)"}
                  />
                </FormInput>

                <FormInput label="Email (opsional)" icon={Mail}>
                  <input type="email" value={form.patientEmail}
                    onChange={(e) => setForm({ ...form, patientEmail: e.target.value })}
                    placeholder="email@contoh.com"
                    className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all"
                    style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = "#F7A5A5"}
                    onBlur={e => e.currentTarget.style.borderColor = "rgba(93,104,138,0.18)"}
                  />
                </FormInput>

                <FormInput label="Keluhan" icon={FileText} required>
                  <textarea rows={3} value={form.complaint}
                    onChange={(e) => setForm({ ...form, complaint: e.target.value })}
                    placeholder="Jelaskan keluhan gigi Anda..."
                    className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all resize-none"
                    style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = "#F7A5A5"}
                    onBlur={e => e.currentTarget.style.borderColor = "rgba(93,104,138,0.18)"}
                  />
                </FormInput>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-[#5D688A] transition-all active:scale-95 tap-feedback"
                  style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(93,104,138,0.15)" }}>
                  ← Kembali
                </button>
                <button
                  disabled={submitting || !form.patientName || !form.patientPhone || !form.complaint}
                  onClick={handleSubmit}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-white disabled:opacity-40 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 tap-feedback"
                  style={{ background: "linear-gradient(135deg, #F7A5A5, #5D688A)", boxShadow: "0 6px 20px rgba(247,165,165,0.35)" }}>
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4" /> Konfirmasi</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

