"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Settings, Phone, Mail, MapPin, Clock, Stethoscope,
  Save, Plus, Trash2, Loader2, Instagram, MessageCircle,
  Megaphone, User, Building2, CheckCircle2,
} from "lucide-react";

interface ClinicSettings {
  clinicName: string;
  doctorName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  slotDurationMinutes: number;
  workHourStart: string;
  workHourEnd: string;
  breakStart: string;
  breakEnd: string;
  services: string[];
  instagramUrl: string;
  lineId: string;
  announcement: string;
}

const inputCls = "w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all";
const inputStyle = {
  background: "rgba(255,255,255,0.75)",
  border: "1.5px solid rgba(93,104,138,0.18)",
  color: "#3a3f52",
};

function SectionCard({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-3xl p-5 sm:p-6"
      style={{ border: "1px solid rgba(255,255,255,0.75)", boxShadow: "0 4px 20px rgba(93,104,138,0.07)" }}>
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#F7A5A5,#5D688A)" }}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h2 className="font-bold text-[#3a3f52] text-base">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#5D688A]/70 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<ClinicSettings>({
    clinicName: "", doctorName: "", phone: "", whatsapp: "",
    email: "", address: "", slotDurationMinutes: 30,
    workHourStart: "08:00", workHourEnd: "16:00",
    breakStart: "12:00", breakEnd: "13:00",
    services: [], instagramUrl: "", lineId: "", announcement: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newService, setNewService] = useState("");
  const [preview, setPreview] = useState<string[]>([]);

  const generateSlotPreview = useCallback((settings: ClinicSettings) => {
    const slots: string[] = [];
    const dur = settings.slotDurationMinutes || 30;
    const [sh, sm] = settings.workHourStart.split(":").map(Number);
    const [eh, em] = settings.workHourEnd.split(":").map(Number);
    const [bsh, bsm] = settings.breakStart.split(":").map(Number);
    const [beh, bem] = settings.breakEnd.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin   = eh * 60 + em;
    const bsMin    = bsh * 60 + bsm;
    const beMin    = beh * 60 + bem;
    for (let m = startMin; m < endMin; m += dur) {
      if (m >= bsMin && m < beMin) continue;
      const hh = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      slots.push(`${hh}:${mm}`);
    }
    return slots;
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => { setSettings(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPreview(generateSlotPreview(settings));
  }, [settings.slotDurationMinutes, settings.workHourStart, settings.workHourEnd, settings.breakStart, settings.breakEnd, generateSlotPreview]);

  const set = (key: keyof ClinicSettings, val: unknown) =>
    setSettings(prev => ({ ...prev, [key]: val }));

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = "#F7A5A5");
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = "rgba(93,104,138,0.18)");

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#F7A5A5" }} />
    </div>
  );

  return (
    <div className="pb-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#3a3f52] flex items-center gap-2">
            <Settings className="w-6 h-6" style={{ color: "#F7A5A5" }} />
            Pengaturan Klinik
          </h1>
          <p className="text-xs text-[#5D688A]/60 mt-1">Kelola info praktek, layanan, dan pengaturan jadwal</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white disabled:opacity-60 transition-all hover:scale-[1.02] active:scale-95"
          style={{ background: "linear-gradient(135deg,#F7A5A5,#5D688A)", boxShadow: "0 4px 15px rgba(247,165,165,0.35)" }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Tersimpan!" : "Simpan"}
        </button>
      </div>

      {/* ── Clinic Info ── */}
      <SectionCard title="Informasi Klinik" icon={Building2}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nama Klinik">
            <input className={inputCls} style={inputStyle} value={settings.clinicName}
              onChange={e => set("clinicName", e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
          </Field>
          <Field label="Nama Dokter">
            <input className={inputCls} style={inputStyle} value={settings.doctorName}
              onChange={e => set("doctorName", e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
          </Field>
          <Field label="Alamat Praktek">
            <input className={inputCls} style={inputStyle} value={settings.address}
              onChange={e => set("address", e.target.value)} onFocus={focusStyle} onBlur={blurStyle}
              placeholder="Nama klinik / puskesmas / rumah sakit" />
          </Field>
          <Field label="Pengumuman / Catatan Publik">
            <input className={inputCls} style={inputStyle} value={settings.announcement}
              onChange={e => set("announcement", e.target.value)} onFocus={focusStyle} onBlur={blurStyle}
              placeholder="Contoh: Libur tgl 17 Agustus" />
          </Field>
        </div>
      </SectionCard>

      {/* ── Contact ── */}
      <SectionCard title="Kontak & Media Sosial" icon={Phone}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="No. Telepon">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#5D688A" }} />
              <input type="tel" className={inputCls} style={{ ...inputStyle, paddingLeft: "2.5rem" }}
                value={settings.phone} onChange={e => set("phone", e.target.value)}
                onFocus={focusStyle} onBlur={blurStyle} placeholder="08xxxxxxxxxx" />
            </div>
          </Field>
          <Field label="No. WhatsApp">
            <div className="relative">
              <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#5D688A" }} />
              <input type="tel" className={inputCls} style={{ ...inputStyle, paddingLeft: "2.5rem" }}
                value={settings.whatsapp} onChange={e => set("whatsapp", e.target.value)}
                onFocus={focusStyle} onBlur={blurStyle} placeholder="08xxxxxxxxxx" />
            </div>
          </Field>
          <Field label="Email">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#5D688A" }} />
              <input type="email" className={inputCls} style={{ ...inputStyle, paddingLeft: "2.5rem" }}
                value={settings.email} onChange={e => set("email", e.target.value)}
                onFocus={focusStyle} onBlur={blurStyle} placeholder="email@contoh.com" />
            </div>
          </Field>
          <Field label="Instagram (URL)">
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#5D688A" }} />
              <input className={inputCls} style={{ ...inputStyle, paddingLeft: "2.5rem" }}
                value={settings.instagramUrl} onChange={e => set("instagramUrl", e.target.value)}
                onFocus={focusStyle} onBlur={blurStyle} placeholder="https://instagram.com/username" />
            </div>
          </Field>
        </div>
      </SectionCard>

      {/* ── Services ── */}
      <SectionCard title="Jenis Layanan" icon={Stethoscope}>
        <div className="space-y-2 mb-4">
          {settings.services.map((svc, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2.5 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(93,104,138,0.1)" }}>
              <span className="text-sm text-[#3a3f52] flex-1">• {svc}</span>
              <button onClick={() => set("services", settings.services.filter((_, j) => j !== i))}
                className="p-1 rounded-lg transition-all hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5" style={{ color: "#F7A5A5" }} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input className={`${inputCls} flex-1`} style={inputStyle} value={newService}
            onChange={e => setNewService(e.target.value)}
            onFocus={focusStyle} onBlur={blurStyle}
            onKeyDown={e => { if (e.key === "Enter" && newService.trim()) { set("services", [...settings.services, newService.trim()]); setNewService(""); }}}
            placeholder="Tambah layanan baru..." />
          <button onClick={() => { if (newService.trim()) { set("services", [...settings.services, newService.trim()]); setNewService(""); }}}
            className="px-4 py-3 rounded-2xl font-bold text-sm text-white transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg,#F7A5A5,#5D688A)" }}>
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </SectionCard>

      {/* ── Schedule Settings ── */}
      <SectionCard title="Pengaturan Jadwal Praktek" icon={Clock}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <Field label="Jam Mulai">
            <input type="time" className={inputCls} style={inputStyle}
              value={settings.workHourStart} onChange={e => set("workHourStart", e.target.value)}
              onFocus={focusStyle} onBlur={blurStyle} />
          </Field>
          <Field label="Jam Selesai">
            <input type="time" className={inputCls} style={inputStyle}
              value={settings.workHourEnd} onChange={e => set("workHourEnd", e.target.value)}
              onFocus={focusStyle} onBlur={blurStyle} />
          </Field>
          <Field label="Istirahat Mulai">
            <input type="time" className={inputCls} style={inputStyle}
              value={settings.breakStart} onChange={e => set("breakStart", e.target.value)}
              onFocus={focusStyle} onBlur={blurStyle} />
          </Field>
          <Field label="Istirahat Selesai">
            <input type="time" className={inputCls} style={inputStyle}
              value={settings.breakEnd} onChange={e => set("breakEnd", e.target.value)}
              onFocus={focusStyle} onBlur={blurStyle} />
          </Field>
        </div>

        <Field label="Durasi Setiap Slot (menit)">
          <div className="flex flex-wrap gap-2 mt-1">
            {[15, 20, 30, 45, 60].map(dur => (
              <button key={dur} onClick={() => set("slotDurationMinutes", dur)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-[1.04]"
                style={settings.slotDurationMinutes === dur ? {
                  background: "linear-gradient(135deg,#F7A5A5,#5D688A)",
                  color: "white",
                  boxShadow: "0 3px 10px rgba(247,165,165,0.4)"
                } : {
                  background: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(93,104,138,0.15)",
                  color: "#5D688A"
                }}>
                {dur} mnt
              </button>
            ))}
          </div>
        </Field>

        {/* Slot Preview */}
        <div className="mt-5 p-4 rounded-2xl" style={{ background: "rgba(93,104,138,0.05)", border: "1px solid rgba(93,104,138,0.1)" }}>
          <p className="text-xs font-bold text-[#5D688A]/70 mb-3">
            Preview slot ({preview.length} slot × {settings.slotDurationMinutes} mnt):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {preview.map(slot => (
              <span key={slot} className="px-2.5 py-1 rounded-xl text-[11px] font-semibold"
                style={{ background: "rgba(247,165,165,0.15)", color: "#5D688A", border: "1px solid rgba(247,165,165,0.25)" }}>
                {slot}
              </span>
            ))}
            {preview.length === 0 && <p className="text-xs text-[#5D688A]/40">Tidak ada slot tersedia</p>}
          </div>
        </div>

        {/* Apply to schedule button */}
        <div className="mt-4 p-4 rounded-2xl flex items-start gap-3"
          style={{ background: "rgba(255,219,182,0.2)", border: "1px solid rgba(255,219,182,0.4)" }}>
          <Megaphone className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#e8994a" }} />
          <p className="text-xs text-[#5D688A]/70">
            Setelah menyimpan, buka halaman <strong>Jadwal</strong> dan buat jadwal baru — slot akan otomatis mengikuti durasi yang dipilih di sini.
          </p>
        </div>
      </SectionCard>

      {/* Save button bottom */}
      <button onClick={handleSave} disabled={saving}
        className="w-full py-4 rounded-2xl font-bold text-sm text-white disabled:opacity-60 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95"
        style={{ background: "linear-gradient(135deg,#5D688A,#7a88b0)", boxShadow: "0 6px 20px rgba(93,104,138,0.3)" }}>
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Menyimpan...</>
          : saved ? <><CheckCircle2 className="w-4 h-4" />Pengaturan Tersimpan!</>
          : <><Save className="w-4 h-4" />Simpan Semua Pengaturan</>}
      </button>
    </div>
  );
}

