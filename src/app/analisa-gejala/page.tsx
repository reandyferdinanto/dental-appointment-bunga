"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Info,
  Loader2,
  ShieldAlert,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import {
  NeuButton,
  NeuCard,
  NeuChip,
  NeuInput,
  NeuTextarea,
} from "@/components/ui/neumorphism";
import type { SymptomAnalysisResult } from "@/lib/validators";

const urgencyConfig: Record<SymptomAnalysisResult["urgency"], { label: string; color: string }> = {
  darurat: { label: "Darurat", color: "#ef4444" },
  segera: { label: "Segera", color: "#f59e0b" },
  terjadwal: { label: "Terjadwal", color: "#4e6785" },
  observasi: { label: "Observasi", color: "#10b981" },
};

const initialForm = {
  patientName: "",
  age: 24,
  sex: "female",
  chiefComplaint: "",
  duration: "",
  painScale: 5,
  hasSwelling: false,
  hasFever: false,
  hasBleeding: false,
  hasBadBreath: false,
  hasTrauma: false,
  hasDifficultyOpeningMouth: false,
  hasDifficultySwallowing: false,
  hasPus: false,
  hasToothSensitivity: false,
  pregnancyStatus: "unknown",
  allergies: "",
  medications: "",
  additionalNotes: "",
};

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="rounded-[1.2rem] border px-3 py-3 text-left transition-all"
      style={{
        background: checked ? "rgba(255,255,255,0.62)" : "rgba(255,255,255,0.34)",
        borderColor: checked ? "rgba(253,172,172,0.45)" : "rgba(255,255,255,0.42)",
        boxShadow: checked
          ? "10px 10px 20px rgba(163,177,198,0.12), -8px -8px 18px rgba(255,255,255,0.74)"
          : "inset 1px 1px 0 rgba(255,255,255,0.3)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-[#3a3f52]">{label}</span>
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{
            color: checked ? "#4e6785" : "rgba(78,103,133,0.55)",
            background: checked ? "rgba(253,172,172,0.2)" : "rgba(255,255,255,0.38)",
          }}
        >
          {checked ? "Ya" : "Tidak"}
        </span>
      </div>
    </button>
  );
}

function SegmentedField<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ value: T; label: string; description?: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="grid gap-2 rounded-[1.45rem] border border-white/55 bg-[rgba(255,255,255,0.34)] p-2 shadow-[inset_1px_1px_0_rgba(255,255,255,0.46),8px_8px_18px_rgba(163,177,198,0.08)] sm:grid-cols-2">
      {options.map((item) => {
        const active = item.value === value;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className="rounded-[1.1rem] px-3 py-3 text-left transition-all duration-200"
            style={active ? {
              background: "linear-gradient(135deg, #4e6785 0%, #6d7f9e 100%)",
              color: "#ffffff",
              boxShadow: "10px 10px 20px rgba(120,134,155,0.22), -6px -6px 16px rgba(255,255,255,0.16)",
              border: "1px solid rgba(255,255,255,0.14)",
            } : {
              background: "rgba(255,255,255,0.44)",
              color: "#4e6785",
              boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.4)",
              border: "1px solid rgba(255,255,255,0.54)",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold tracking-[-0.02em]">{item.label}</span>
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  background: active ? "rgba(253,172,172,0.95)" : "rgba(93,104,138,0.22)",
                  boxShadow: active ? "0 0 0 4px rgba(253,172,172,0.16)" : "none",
                }}
              />
            </div>
            {item.description ? (
              <p className="mt-1 text-[11px] leading-5" style={{ color: active ? "rgba(255,255,255,0.78)" : "rgba(93,104,138,0.72)" }}>
                {item.description}
              </p>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function HoverInfo({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/60 bg-white/55 text-[#7b88a6] shadow-[4px_4px_10px_rgba(163,177,198,0.12),-4px_-4px_10px_rgba(255,255,255,0.72)]">
        <Info className="h-3.5 w-3.5" />
      </span>
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-56 -translate-x-1/2 rounded-[1rem] border border-white/60 bg-[rgba(255,255,255,0.92)] px-3 py-2 text-[11px] font-medium leading-5 text-[#4e6785] shadow-[10px_10px_24px_rgba(163,177,198,0.16),-8px_-8px_20px_rgba(255,255,255,0.78)] group-hover:block">
        {text}
      </span>
    </span>
  );
}

export default function AnalisaGejalaPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SymptomAnalysisResult | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/symptoms/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload.error || "Analisa gagal diproses.");
      }

      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analisa gagal diproses.");
    }

    setLoading(false);
  }

  const urgency = result ? urgencyConfig[result.urgency] : null;

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />

      <main className="py-6 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-8">
            <section>
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(253,172,172,0.45)] bg-white/50 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5D688A] shadow-[8px_8px_18px_rgba(163,177,198,0.12),-8px_-8px_18px_rgba(255,255,255,0.8)]">
                <span className="h-2 w-2 rounded-full bg-[#FDACAC] animate-pulse-soft" />
                AI Symptoms Dental Triage
              </div>

              <h1 className="mt-4 max-w-[12ch] text-[2.2rem] font-extrabold leading-[0.94] tracking-[-0.05em] text-[#3a3f52] sm:text-[2.9rem] lg:text-[3.35rem]">
                Analisa <span className="gradient-text">Gejala Gigi</span> Awal
              </h1>
              <p className="mt-3 max-w-[34rem] text-sm leading-7 text-[#5D688A]/78 sm:text-[15px]">
                Fitur ini membantu triage awal gejala gigi untuk edukasi dan prioritas tindakan. Ini bukan diagnosis final dan tidak menggantikan pemeriksaan dokter gigi.
              </p>

              <NeuCard className="mt-6 rounded-[2rem] border border-white/55 bg-white/38 p-5 shadow-[14px_14px_28px_rgba(163,177,198,0.14),-12px_-12px_24px_rgba(255,255,255,0.78)] backdrop-blur-xl sm:p-6">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-[#FDACAC]" />
                  <h2 className="text-lg font-bold text-[#3a3f52]">Data Keluhan</h2>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#4e6785]">Nama pasien</label>
                    <NeuInput value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} placeholder="Opsional" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#4e6785]">Umur</label>
                    <NeuInput type="number" value={String(form.age)} onChange={(e) => setForm({ ...form, age: Number(e.target.value || 0) })} />
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#4e6785]">Jenis kelamin</label>
                    <SegmentedField
                      value={form.sex}
                      onChange={(value) => setForm({ ...form, sex: value })}
                      options={[
                        { value: "female", label: "Perempuan", description: "Pasien wanita" },
                        { value: "male", label: "Laki-laki", description: "Pasien pria" },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#4e6785]">Status kehamilan</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "no", label: "Tidak" },
                        { value: "yes", label: "Ya" },
                        { value: "unknown", label: "Tidak tahu" },
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setForm({ ...form, pregnancyStatus: item.value as typeof form.pregnancyStatus })}
                          className="rounded-2xl px-3 py-3 text-xs font-semibold transition-all"
                          style={form.pregnancyStatus === item.value ? {
                            background: "#4e6785",
                            color: "white",
                            boxShadow: "4px 4px 8px rgba(137,150,166,0.28), -4px -4px 8px rgba(255,255,255,0.12)",
                          } : {
                            background: "#e6e7ee",
                            color: "#5D688A",
                            border: "1px solid rgba(255,255,255,0.52)",
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-sm font-semibold text-[#4e6785]">Keluhan utama</label>
                  <NeuTextarea rows={4} value={form.chiefComplaint} onChange={(e) => setForm({ ...form, chiefComplaint: e.target.value })} placeholder="Contoh: gigi belakang kiri sakit berdenyut sejak 3 hari, makin sakit saat malam dan saat minum dingin" />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#4e6785]">Durasi keluhan</label>
                    <NeuInput value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="Misal: 2 hari, 1 minggu" />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#4e6785]">
                      <label>Skala nyeri: {form.painScale}/10</label>
                      <HoverInfo text="0 berarti tidak nyeri, 1-3 ringan, 4-6 sedang, 7-8 berat, dan 9-10 sangat berat atau tidak tertahankan." />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={form.painScale}
                      onChange={(e) => setForm({ ...form, painScale: Number(e.target.value) })}
                      className="w-full accent-[#FDACAC]"
                    />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <ToggleField label="Ada bengkak" checked={form.hasSwelling} onChange={(value) => setForm({ ...form, hasSwelling: value })} />
                  <ToggleField label="Ada demam" checked={form.hasFever} onChange={(value) => setForm({ ...form, hasFever: value })} />
                  <ToggleField label="Ada perdarahan" checked={form.hasBleeding} onChange={(value) => setForm({ ...form, hasBleeding: value })} />
                  <ToggleField label="Bau mulut berat" checked={form.hasBadBreath} onChange={(value) => setForm({ ...form, hasBadBreath: value })} />
                  <ToggleField label="Ada trauma atau benturan" checked={form.hasTrauma} onChange={(value) => setForm({ ...form, hasTrauma: value })} />
                  <ToggleField label="Sulit membuka mulut" checked={form.hasDifficultyOpeningMouth} onChange={(value) => setForm({ ...form, hasDifficultyOpeningMouth: value })} />
                  <ToggleField label="Sulit menelan" checked={form.hasDifficultySwallowing} onChange={(value) => setForm({ ...form, hasDifficultySwallowing: value })} />
                  <ToggleField label="Ada nanah" checked={form.hasPus} onChange={(value) => setForm({ ...form, hasPus: value })} />
                  <ToggleField label="Ngilu dingin atau manis" checked={form.hasToothSensitivity} onChange={(value) => setForm({ ...form, hasToothSensitivity: value })} />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#4e6785]">Alergi obat</label>
                    <NeuInput value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="Opsional" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#4e6785]">Obat yang sedang diminum</label>
                    <NeuInput value={form.medications} onChange={(e) => setForm({ ...form, medications: e.target.value })} placeholder="Opsional" />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-sm font-semibold text-[#4e6785]">Catatan tambahan</label>
                  <NeuTextarea rows={3} value={form.additionalNotes} onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })} placeholder="Opsional" />
                </div>

                {error && (
                  <div className="mt-4 rounded-[1.4rem] border border-[rgba(239,68,68,0.18)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-sm font-medium text-[#b91c1c]">
                    {error}
                  </div>
                )}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <NeuButton
                    onClick={handleAnalyze}
                    variant="primary"
                    size="lg"
                    className="flex-1 hover:scale-[1.01]"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Analisa Gejala
                  </NeuButton>
                  <Link href="/booking" className="btn-neu-secondary flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-[#4e6785] transition-all hover:scale-[1.01] active:scale-95">
                    <Calendar className="h-4 w-4" />
                    Langsung Booking
                  </Link>
                </div>
              </NeuCard>
            </section>

            <section>
              <div className="relative overflow-hidden rounded-[2.4rem] border border-white/55 bg-[linear-gradient(145deg,rgba(255,255,255,0.46),rgba(230,231,238,0.88))] p-4 shadow-[18px_18px_36px_rgba(163,177,198,0.18),-16px_-16px_30px_rgba(255,255,255,0.86)] backdrop-blur-xl sm:p-5 lg:p-6">
                <div className="blob-pink pointer-events-none absolute -left-10 -top-10 h-28 w-28 opacity-28" />
                <div className="blob-peach pointer-events-none absolute -bottom-10 right-0 h-36 w-36 opacity-28" />

                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8a8fa8]">Hasil Triage</p>
                    <p className="mt-1 text-sm font-bold text-[#3a3f52] sm:text-base">Analisa awal gejala gigi</p>
                  </div>
                  <div className="rounded-full border border-[rgba(253,172,172,0.32)] bg-white/55 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#4e6785] shadow-[6px_6px_14px_rgba(163,177,198,0.1),-6px_-6px_14px_rgba(255,255,255,0.66)]">
                    AI Assist
                  </div>
                </div>

                {result ? (
                  <div className="relative z-10 mt-5 space-y-4">
                    <div className="rounded-[1.7rem] border border-white/50 bg-white/46 px-4 py-4 shadow-[10px_10px_24px_rgba(163,177,198,0.12),-10px_-10px_20px_rgba(255,255,255,0.72)]">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a8fa8]">Urgensi</p>
                          <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-[#3a3f52]">{urgency?.label}</h2>
                        </div>
                        <NeuChip className="px-3 py-1 text-[10px] uppercase tracking-[0.2em]" style={{ color: urgency?.color }}>
                          {result.urgency}
                        </NeuChip>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[#5D688A]/82">{result.summary}</p>
                    </div>

                    <NeuCard className="rounded-[1.8rem] border border-white/55 bg-white/38 p-5 shadow-[14px_14px_28px_rgba(163,177,198,0.14),-12px_-12px_24px_rgba(255,255,255,0.78)] backdrop-blur-xl">
                      <div className="flex items-center gap-2 text-[#3a3f52]">
                        <CheckCircle2 className="h-4 w-4 text-[#FDACAC]" />
                        <h3 className="font-bold">Kemungkinan kondisi</h3>
                      </div>
                      <div className="mt-3 space-y-3">
                        {result.possibleConditions.map((condition) => (
                          <div key={condition.name} className="rounded-[1.2rem] border border-white/50 bg-white/32 px-4 py-3">
                            <p className="font-semibold text-[#3a3f52]">{condition.name}</p>
                            <p className="mt-1 text-sm leading-6 text-[#5D688A]/78">{condition.reason}</p>
                          </div>
                        ))}
                      </div>
                    </NeuCard>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <NeuCard className="rounded-[1.8rem] border border-white/55 bg-white/38 p-5 shadow-[14px_14px_28px_rgba(163,177,198,0.14),-12px_-12px_24px_rgba(255,255,255,0.78)] backdrop-blur-xl">
                        <div className="flex items-center gap-2 text-[#3a3f52]">
                          <Stethoscope className="h-4 w-4 text-[#FDACAC]" />
                          <h3 className="font-bold">Saran tindakan awal</h3>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-[#5D688A]/82">{result.recommendedAction}</p>
                        <div className="mt-4 space-y-2">
                          {result.selfCare.map((item) => (
                            <div key={item} className="flex gap-2 text-sm text-[#4e6785]">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FDACAC]" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </NeuCard>

                      <NeuCard className="rounded-[1.8rem] border border-white/55 bg-white/38 p-5 shadow-[14px_14px_28px_rgba(163,177,198,0.14),-12px_-12px_24px_rgba(255,255,255,0.78)] backdrop-blur-xl">
                        <div className="flex items-center gap-2 text-[#3a3f52]">
                          <ShieldAlert className="h-4 w-4 text-[#ef4444]" />
                          <h3 className="font-bold">Red flags</h3>
                        </div>
                        <div className="mt-3 space-y-2">
                          {result.redFlags.map((item) => (
                            <div key={item} className="flex gap-2 text-sm text-[#4e6785]">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ef4444]" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </NeuCard>
                    </div>

                    <NeuCard className="rounded-[1.8rem] border border-white/55 bg-white/38 p-5 shadow-[14px_14px_28px_rgba(163,177,198,0.14),-12px_-12px_24px_rgba(255,255,255,0.78)] backdrop-blur-xl">
                      <div className="flex items-center gap-2 text-[#3a3f52]">
                        <AlertTriangle className="h-4 w-4 text-[#FDACAC]" />
                        <h3 className="font-bold">Pertanyaan lanjutan yang penting</h3>
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {result.followUpQuestions.map((item) => (
                          <div key={item} className="rounded-[1.2rem] border border-white/48 bg-white/28 px-4 py-3 text-sm text-[#4e6785]">
                            {item}
                          </div>
                        ))}
                      </div>
                    </NeuCard>

                    <div className="rounded-[1.8rem] border border-[rgba(253,172,172,0.28)] bg-[rgba(255,255,255,0.58)] px-5 py-4 shadow-[10px_10px_22px_rgba(163,177,198,0.12),-10px_-10px_18px_rgba(255,255,255,0.74)]">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a8fa8]">Saran booking</p>
                      <p className="mt-2 text-sm leading-7 text-[#4e6785]">{result.bookingSuggestion}</p>
                      <p className="mt-3 text-xs leading-6 text-[#5D688A]/75">{result.disclaimer}</p>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <Link href="/booking" className="btn-neu-primary flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white transition-all hover:scale-[1.01] active:scale-95">
                          <Calendar className="h-4 w-4" />
                          Buat Janji Sekarang
                        </Link>
                        <Link href="/jadwal" className="btn-neu-secondary flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-[#4e6785] transition-all hover:scale-[1.01] active:scale-95">
                          Lihat Jadwal
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10 mt-5 rounded-[2rem] border border-white/50 bg-white/38 px-5 py-8 text-center shadow-[14px_14px_28px_rgba(163,177,198,0.14),-12px_-12px_24px_rgba(255,255,255,0.78)] backdrop-blur-xl sm:px-6 sm:py-10">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.6rem] border border-white/62 bg-white/54 shadow-[10px_10px_22px_rgba(163,177,198,0.14),-8px_-8px_18px_rgba(255,255,255,0.76)]">
                      <Sparkles className="h-7 w-7 text-[#FDACAC]" />
                    </div>
                    <h2 className="mt-4 text-xl font-extrabold text-[#3a3f52]">Siap menganalisa gejala</h2>
                    <p className="mx-auto mt-3 max-w-[28rem] text-sm leading-7 text-[#5D688A]/78">
                      Isi keluhan dan tanda-tanda yang Anda rasakan. Sistem akan memberi triage awal untuk membantu menentukan urgensi dan langkah berikutnya.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}


