"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { AdminUser } from "@/lib/auth";
import {
  Settings, Phone, Mail, Clock, Stethoscope,
  Save, Plus, Trash2, Loader2, Instagram, MessageCircle,
  Megaphone, User, Building2, CheckCircle2, Shield, Eye, EyeOff, UserPlus, KeyRound,
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
  const { data: session } = useSession();
  const currentUserId = (session?.user as { id?: string } | undefined)?.id ?? "";

  const [settings, setSettings] = useState<ClinicSettings>({
    clinicName: "", doctorName: "", phone: "", whatsapp: "",
    email: "", address: "", slotDurationMinutes: 30,
    workHourStart: "08:00", workHourEnd: "16:00",
    breakStart: "12:00", breakEnd: "13:00",
    services: [], instagramUrl: "", lineId: "", announcement: "",
  });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [newService, setNewService] = useState("");
  const [preview, setPreview]   = useState<string[]>([]);

  // ── Admin management state ─────────────────────────────────────────────────
  const [admins, setAdmins]     = useState<AdminUser[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminMsg, setAdminMsg] = useState<{ type: "ok"|"err"; text: string } | null>(null);

  // Change-password form
  const [pwForm, setPwForm]     = useState({ newPassword: "", confirm: "", show: false, saving: false });

  // Add-admin form
  const [addForm, setAddForm]   = useState({ name: "", email: "", password: "", role: "admin", show: false, saving: false });
  const [addPwShow, setAddPwShow] = useState(false);

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
      .then(data => {
        // Normalize time fields in case Google Sheets returns ISO date strings
        const nt = (v: unknown, fb: string) => {
          if (!v) return fb;
          const s = String(v);
          if (/^\d{1,2}:\d{2}/.test(s)) return s.slice(0, 5);
          const m = s.match(/T(\d{2}):(\d{2})/);
          return m ? `${m[1]}:${m[2]}` : fb;
        };
        setSettings({
          ...data,
          workHourStart: nt(data.workHourStart, "08:00"),
          workHourEnd:   nt(data.workHourEnd,   "16:00"),
          breakStart:    nt(data.breakStart,    "12:00"),
          breakEnd:      nt(data.breakEnd,      "13:00"),
          slotDurationMinutes: Number(data.slotDurationMinutes) || 30,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPreview(generateSlotPreview(settings));
  }, [settings.slotDurationMinutes, settings.workHourStart, settings.workHourEnd, settings.breakStart, settings.breakEnd, generateSlotPreview]);

  // ── Admin helpers ──────────────────────────────────────────────────────────
  const fetchAdmins = useCallback(async () => {
    setAdminLoading(true);
    try {
      const res = await fetch("/api/admin");
      if (res.ok) setAdmins(await res.json());
    } catch { /* ignore */ }
    setAdminLoading(false);
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  function showAdminMsg(type: "ok"|"err", text: string) {
    setAdminMsg({ type, text });
    setTimeout(() => setAdminMsg(null), 4000);
  }

  async function handleChangePassword() {
    if (pwForm.newPassword !== pwForm.confirm) {
      return showAdminMsg("err", "Password tidak cocok");
    }
    if (pwForm.newPassword.length < 6) {
      return showAdminMsg("err", "Password minimal 6 karakter");
    }
    setPwForm(p => ({ ...p, saving: true }));
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change_password", id: currentUserId, newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (data.error) showAdminMsg("err", data.error);
      else { showAdminMsg("ok", "Password berhasil diubah!"); setPwForm(p => ({ ...p, newPassword: "", confirm: "" })); }
    } catch { showAdminMsg("err", "Gagal mengubah password"); }
    setPwForm(p => ({ ...p, saving: false }));
  }

  async function handleAddAdmin() {
    if (!addForm.name || !addForm.email || !addForm.password) {
      return showAdminMsg("err", "Semua field wajib diisi");
    }
    setAddForm(p => ({ ...p, saving: true }));
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", name: addForm.name, email: addForm.email, password: addForm.password, role: addForm.role }),
      });
      const data = await res.json();
      if (data.error) showAdminMsg("err", data.error);
      else {
        showAdminMsg("ok", "Admin berhasil ditambahkan!");
        setAddForm({ name: "", email: "", password: "", role: "admin", show: false, saving: false });
        fetchAdmins();
      }
    } catch { showAdminMsg("err", "Gagal menambah admin"); }
    setAddForm(p => ({ ...p, saving: false }));
  }

  async function handleDeleteAdmin(id: string) {
    if (!confirm("Hapus admin ini?")) return;
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const data = await res.json();
      if (data.error) showAdminMsg("err", data.error);
      else { showAdminMsg("ok", "Admin dihapus"); fetchAdmins(); }
    } catch { showAdminMsg("err", "Gagal menghapus admin"); }
  }

  const set = (key: keyof ClinicSettings, val: unknown) =>
    setSettings(prev => ({ ...prev, [key]: val }));

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = "#F7A5A5");
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = "rgba(93,104,138,0.18)");

  const [saveError, setSaveError] = useState("");

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok || data?.error) {
        setSaveError(data?.error || "Gagal menyimpan. Coba lagi.");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error(e);
      setSaveError("Koneksi gagal. Periksa jaringan Anda.");
    }
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

      {/* Save error banner */}
      {saveError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold"
          style={{ background: "rgba(247,165,165,0.15)", border: "1px solid rgba(247,165,165,0.4)", color: "#c0504f" }}>
          ✕ {saveError}
        </div>
      )}

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

      {/* ── Admin Management ── */}
      <SectionCard title="Manajemen Admin" icon={Shield}>
        {/* Feedback message */}
        {adminMsg && (
          <div className="mb-4 px-4 py-3 rounded-2xl text-sm font-semibold"
            style={{
              background: adminMsg.type === "ok" ? "rgba(110,198,160,0.15)" : "rgba(247,165,165,0.15)",
              border: `1px solid ${adminMsg.type === "ok" ? "rgba(110,198,160,0.4)" : "rgba(247,165,165,0.4)"}`,
              color: adminMsg.type === "ok" ? "#2d8a5e" : "#c0504f",
            }}>
            {adminMsg.type === "ok" ? "✓ " : "✕ "}{adminMsg.text}
          </div>
        )}

        {/* ── Change My Password ── */}
        <div className="mb-5 p-4 rounded-2xl" style={{ background: "rgba(93,104,138,0.05)", border: "1px solid rgba(93,104,138,0.1)" }}>
          <div className="flex items-center gap-2 mb-3">
            <KeyRound className="w-4 h-4" style={{ color: "#F7A5A5" }} />
            <h3 className="font-bold text-sm text-[#3a3f52]">Ganti Password Saya</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <input
                type={pwForm.show ? "text" : "password"}
                placeholder="Password baru (min. 6 karakter)"
                value={pwForm.newPassword}
                onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none pr-10"
                style={{ background: "rgba(255,255,255,0.75)", border: "1.5px solid rgba(93,104,138,0.18)", color: "#3a3f52" }}
                onFocus={e => (e.currentTarget.style.borderColor = "#F7A5A5")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(93,104,138,0.18)")}
              />
              <button type="button" onClick={() => setPwForm(p => ({ ...p, show: !p.show }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5D688A]/50 hover:text-[#5D688A]">
                {pwForm.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <input
              type={pwForm.show ? "text" : "password"}
              placeholder="Konfirmasi password baru"
              value={pwForm.confirm}
              onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.75)", border: "1.5px solid rgba(93,104,138,0.18)", color: "#3a3f52" }}
              onFocus={e => (e.currentTarget.style.borderColor = "#F7A5A5")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(93,104,138,0.18)")}
            />
          </div>
          <button onClick={handleChangePassword} disabled={pwForm.saving || !pwForm.newPassword}
            className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95"
            style={{ background: "linear-gradient(135deg,#5D688A,#7a88b0)", boxShadow: "0 4px 12px rgba(93,104,138,0.3)" }}>
            {pwForm.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            Simpan Password Baru
          </button>
        </div>

        {/* ── Admin List ── */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-[#3a3f52] flex items-center gap-2">
              <User className="w-4 h-4" style={{ color: "#5D688A" }} />
              Daftar Admin ({admins.length})
            </h3>
            <button onClick={() => setAddForm(p => ({ ...p, show: !p.show }))}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg,#F7A5A5,#5D688A)", boxShadow: "0 3px 10px rgba(247,165,165,0.35)" }}>
              <UserPlus className="w-3.5 h-3.5" />
              Tambah Admin
            </button>
          </div>

          {adminLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#F7A5A5" }} />
            </div>
          ) : admins.length === 0 ? (
            <p className="text-xs text-[#5D688A]/50 py-3 text-center">
              Belum ada admin di database. Admin default dari environment variable masih aktif.
            </p>
          ) : (
            <div className="space-y-2">
              {admins.map(admin => (
                <div key={admin.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(93,104,138,0.1)" }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,rgba(247,165,165,0.3),rgba(93,104,138,0.2))" }}>
                    <User className="w-4 h-4" style={{ color: "#5D688A" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#3a3f52] truncate">{admin.name}</p>
                    <p className="text-xs text-[#5D688A]/55 truncate">{admin.email}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0"
                    style={{ background: admin.role === "superadmin" ? "rgba(247,165,165,0.2)" : "rgba(93,104,138,0.1)", color: "#5D688A" }}>
                    {admin.role}
                  </span>
                  {admin.id !== currentUserId && (
                    <button onClick={() => handleDeleteAdmin(admin.id)}
                      className="p-1.5 rounded-lg transition-all hover:bg-red-50 flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5" style={{ color: "#F7A5A5" }} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Add Admin Form ── */}
        {addForm.show && (
          <div className="p-4 rounded-2xl space-y-3" style={{ background: "rgba(255,219,182,0.1)", border: "1px solid rgba(255,219,182,0.3)" }}>
            <h4 className="font-bold text-sm text-[#3a3f52] flex items-center gap-2">
              <UserPlus className="w-4 h-4" style={{ color: "#FFDBB6" }} />
              Tambah Admin Baru
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input placeholder="Nama Lengkap" value={addForm.name}
                onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.75)", border: "1.5px solid rgba(93,104,138,0.18)", color: "#3a3f52" }}
                onFocus={e => (e.currentTarget.style.borderColor = "#FFDBB6")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(93,104,138,0.18)")}
              />
              <input type="email" placeholder="Email" value={addForm.email}
                onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.75)", border: "1.5px solid rgba(93,104,138,0.18)", color: "#3a3f52" }}
                onFocus={e => (e.currentTarget.style.borderColor = "#FFDBB6")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(93,104,138,0.18)")}
              />
              <div className="relative">
                <input type={addPwShow ? "text" : "password"} placeholder="Password (min. 6 karakter)"
                  value={addForm.password}
                  onChange={e => setAddForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl text-sm outline-none pr-10"
                  style={{ background: "rgba(255,255,255,0.75)", border: "1.5px solid rgba(93,104,138,0.18)", color: "#3a3f52" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#FFDBB6")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(93,104,138,0.18)")}
                />
                <button type="button" onClick={() => setAddPwShow(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5D688A]/50 hover:text-[#5D688A]">
                  {addPwShow ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <select value={addForm.role} onChange={e => setAddForm(p => ({ ...p, role: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.75)", border: "1.5px solid rgba(93,104,138,0.18)", color: "#3a3f52" }}>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setAddForm(p => ({ ...p, show: false }))}
                className="px-4 py-2.5 rounded-2xl text-sm font-bold text-[#5D688A] transition-all"
                style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(93,104,138,0.15)" }}>
                Batal
              </button>
              <button onClick={handleAddAdmin} disabled={addForm.saving}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white disabled:opacity-50 transition-all hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg,#F7A5A5,#5D688A)", boxShadow: "0 4px 12px rgba(247,165,165,0.3)" }}>
                {addForm.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Tambah Admin
              </button>
            </div>
          </div>
        )}

        {/* Session info */}
        <div className="mt-4 flex items-start gap-2 px-4 py-3 rounded-2xl text-xs"
          style={{ background: "rgba(93,104,138,0.06)", border: "1px solid rgba(93,104,138,0.1)", color: "#5D688A" }}>
          <Shield className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>Sesi login otomatis berakhir setelah <strong>6 jam</strong>. Setelah itu Anda perlu login ulang.</span>
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

