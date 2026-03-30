"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { AdminUser } from "@/lib/auth";
import {
  NeuAlert,
  NeuButton,
  NeuCard,
  NeuChip,
  NeuIconTile,
  NeuInput,
  NeuSelect,
} from "@/components/ui/neumorphism";
import {
  Settings, Phone, Mail, Clock, Stethoscope,
  Save, Plus, Trash2, Loader2, Instagram, MessageCircle,
  Megaphone, User, Building2, CheckCircle2, Shield, Eye, EyeOff, UserPlus, KeyRound,
} from "lucide-react";
import {
  adminAddSchema,
  adminChangePasswordSchema,
  type AdminAddInput,
  type AdminChangePasswordInput,
  type FieldErrors,
  settingsSchema,
  type SettingsInput,
  validateSchema,
} from "@/lib/validators";

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

function SectionCard({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <NeuCard className="p-5 sm:p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <NeuIconTile tone="primary" className="h-8 w-8 rounded-xl">
          <Icon className="w-4 h-4 text-white" />
        </NeuIconTile>
        <h2 className="font-bold text-[#3a3f52] text-base">{title}</h2>
      </div>
      {children}
    </NeuCard>
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
  const currentUserRole = (session?.user as { role?: string } | undefined)?.role ?? "";
  const isSuperadmin = currentUserRole === "superadmin";

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
  const [settingsErrors, setSettingsErrors] = useState<FieldErrors<SettingsInput>>({});

  // ── Admin management state ─────────────────────────────────────────────────
  const [admins, setAdmins]     = useState<AdminUser[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminMsg, setAdminMsg] = useState<{ type: "ok"|"err"; text: string } | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<FieldErrors<AdminChangePasswordInput> & { confirm?: string }>({});
  const [addAdminErrors, setAddAdminErrors] = useState<FieldErrors<AdminAddInput>>({});

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
    fetch("/api/settings", { cache: "no-store" })
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

  const preview = generateSlotPreview(settings);

  // ── Admin helpers ──────────────────────────────────────────────────────────
  const fetchAdmins = useCallback(async () => {
    if (!isSuperadmin) return;
    setAdminLoading(true);
    try {
      const res = await fetch("/api/admin");
      if (res.ok) setAdmins(await res.json());
    } catch { /* ignore */ }
    setAdminLoading(false);
  }, [isSuperadmin]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void fetchAdmins();
    }, 0);
    return () => window.clearTimeout(id);
  }, [fetchAdmins]);

  function showAdminMsg(type: "ok"|"err", text: string) {
    setAdminMsg({ type, text });
    setTimeout(() => setAdminMsg(null), 4000);
  }

  async function handleChangePassword() {
    const parsed = await validateSchema(adminChangePasswordSchema, { id: currentUserId, newPassword: pwForm.newPassword });
    if (!parsed.success) {
      setPasswordErrors(parsed.errors as FieldErrors<AdminChangePasswordInput>);
      return showAdminMsg("err", parsed.message);
    }
    if (parsed.data.newPassword !== pwForm.confirm) {
      setPasswordErrors({ confirm: "Konfirmasi password tidak cocok" });
      return showAdminMsg("err", "Password tidak cocok");
    }

    setPwForm(p => ({ ...p, saving: true }));
    setPasswordErrors({});
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change_password", id: parsed.data.id, newPassword: parsed.data.newPassword }),
      });
      const data = await res.json();
      if (data.error) {
        if (data.details && typeof data.details === "object") {
          setPasswordErrors(data.details as FieldErrors<AdminChangePasswordInput>);
        }
        showAdminMsg("err", data.error);
      }
      else { showAdminMsg("ok", "Password berhasil diubah!"); setPwForm(p => ({ ...p, newPassword: "", confirm: "" })); }
    } catch { showAdminMsg("err", "Gagal mengubah password"); }
    setPwForm(p => ({ ...p, saving: false }));
  }

  async function handleAddAdmin() {
    const parsed = await validateSchema(adminAddSchema, {
      name: addForm.name,
      email: addForm.email,
      password: addForm.password,
      role: addForm.role,
    });
    if (!parsed.success) {
      setAddAdminErrors(parsed.errors as FieldErrors<AdminAddInput>);
      return showAdminMsg("err", parsed.message);
    }

    setAddForm(p => ({ ...p, saving: true }));
    setAddAdminErrors({});
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", ...parsed.data }),
      });
      const data = await res.json();
      if (data.error) {
        if (data.details && typeof data.details === "object") {
          setAddAdminErrors(data.details as FieldErrors<AdminAddInput>);
        }
        showAdminMsg("err", data.error);
      }
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

  const updateSettings = <K extends keyof ClinicSettings>(key: K, val: ClinicSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
    setSettingsErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = "#FDACAC");
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = "rgba(255,255,255,0.88)");

  const [saveError, setSaveError] = useState("");

  async function handleSave() {
    const parsed = await validateSchema(settingsSchema, settings);
    if (!parsed.success) {
      setSettingsErrors(parsed.errors as FieldErrors<SettingsInput>);
      setSaveError(parsed.message);
      return;
    }

    setSaving(true);
    setSaveError("");
    setSettingsErrors({});
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok || data?.error) {
        if (data?.details && typeof data.details === "object") {
          setSettingsErrors(data.details as FieldErrors<SettingsInput>);
        }
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
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#FDACAC" }} />
    </div>
  );

  return (
    <div className="pb-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#3a3f52] flex items-center gap-2">
            <Settings className="w-6 h-6" style={{ color: "#FDACAC" }} />
            Pengaturan Klinik
          </h1>
          <p className="text-xs text-[#5D688A]/60 mt-1">Kelola info praktek, layanan, dan pengaturan jadwal</p>
        </div>
        <NeuButton onClick={handleSave} disabled={saving} variant="primary" size="md" className="hover:scale-[1.02]">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Tersimpan!" : "Simpan"}
        </NeuButton>
      </div>

      {/* Save error banner */}
      {saveError && (
        <div className="chip-neu flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold" style={{ color: "#c0504f" }}>
          ✕ {saveError}
        </div>
      )}

      {/* ── Clinic Info ── */}
      <SectionCard title="Informasi Klinik" icon={Building2}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nama Klinik">
            <NeuInput value={settings.clinicName}
              onChange={e => updateSettings("clinicName", e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
            {settingsErrors.clinicName ? <p className="mt-1.5 text-xs font-medium text-[#bb6868]">{settingsErrors.clinicName}</p> : null}
          </Field>
          <Field label='Nama Dokter (tanpa "drg.")'>
            <NeuInput value={settings.doctorName}
              onChange={e => updateSettings("doctorName", e.target.value)} onFocus={focusStyle} onBlur={blurStyle}
              placeholder="Natasya Bunga Maureen" />
            {settingsErrors.doctorName ? <p className="mt-1.5 text-xs font-medium text-[#bb6868]">{settingsErrors.doctorName}</p> : null}
          </Field>
          <Field label="Alamat Praktek">
            <NeuInput value={settings.address}
              onChange={e => updateSettings("address", e.target.value)} onFocus={focusStyle} onBlur={blurStyle}
              placeholder="Nama klinik / puskesmas / rumah sakit" />
            {settingsErrors.address ? <p className="mt-1.5 text-xs font-medium text-[#bb6868]">{settingsErrors.address}</p> : null}
          </Field>
          <Field label="Pengumuman / Catatan Publik">
            <NeuInput value={settings.announcement}
              onChange={e => updateSettings("announcement", e.target.value)} onFocus={focusStyle} onBlur={blurStyle}
              placeholder="Contoh: Libur tgl 17 Agustus" />
          </Field>
        </div>
      </SectionCard>

      {/* ── Contact ── */}
      <SectionCard title="Kontak & Media Sosial" icon={Phone}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="No. Telepon">
            <NeuInput type="tel" icon={<Phone className="w-4 h-4" />}
              value={settings.phone} onChange={e => updateSettings("phone", e.target.value)}
              onFocus={focusStyle} onBlur={blurStyle} placeholder="08xxxxxxxxxx" />
            {settingsErrors.phone ? <p className="mt-1.5 text-xs font-medium text-[#bb6868]">{settingsErrors.phone}</p> : null}
          </Field>
          <Field label="No. WhatsApp">
            <NeuInput type="tel" icon={<MessageCircle className="w-4 h-4" />}
              value={settings.whatsapp} onChange={e => updateSettings("whatsapp", e.target.value)}
              onFocus={focusStyle} onBlur={blurStyle} placeholder="08xxxxxxxxxx" />
            {settingsErrors.whatsapp ? <p className="mt-1.5 text-xs font-medium text-[#bb6868]">{settingsErrors.whatsapp}</p> : null}
          </Field>
          <Field label="Email">
            <NeuInput type="email" icon={<Mail className="w-4 h-4" />}
              value={settings.email} onChange={e => updateSettings("email", e.target.value)}
              onFocus={focusStyle} onBlur={blurStyle} placeholder="email@contoh.com" />
            {settingsErrors.email ? <p className="mt-1.5 text-xs font-medium text-[#bb6868]">{settingsErrors.email}</p> : null}
          </Field>
          <Field label="Instagram (URL)">
            <NeuInput icon={<Instagram className="w-4 h-4" />}
              value={settings.instagramUrl} onChange={e => updateSettings("instagramUrl", e.target.value)}
              onFocus={focusStyle} onBlur={blurStyle} placeholder="https://instagram.com/username" />
            {settingsErrors.instagramUrl ? <p className="mt-1.5 text-xs font-medium text-[#bb6868]">{settingsErrors.instagramUrl}</p> : null}
          </Field>
          <Field label="LINE ID">
            <NeuInput
              value={settings.lineId} onChange={e => updateSettings("lineId", e.target.value)}
              onFocus={focusStyle} onBlur={blurStyle} placeholder="@username atau lineid" />
            {settingsErrors.lineId ? <p className="mt-1.5 text-xs font-medium text-[#bb6868]">{settingsErrors.lineId}</p> : null}
          </Field>
        </div>
      </SectionCard>

      {/* ── Services ── */}
      <SectionCard title="Jenis Layanan" icon={Stethoscope}>
        <div className="space-y-2 mb-4">
          {settings.services.map((svc, i) => (
            <div key={i} className="neu-inset flex items-center gap-2 px-3 py-2.5 rounded-2xl">
              <span className="text-sm text-[#3a3f52] flex-1">• {svc}</span>
              <button onClick={() => updateSettings("services", settings.services.filter((_, j) => j !== i))}
                className="p-1 rounded-lg transition-all hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5" style={{ color: "#FDACAC" }} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <NeuInput className="flex-1" value={newService}
            onChange={e => setNewService(e.target.value)}
            onFocus={focusStyle} onBlur={blurStyle}
            onKeyDown={e => { if (e.key === "Enter" && newService.trim()) { updateSettings("services", [...settings.services, newService.trim()]); setNewService(""); }}}
            placeholder="Tambah layanan baru..." />
          <NeuButton onClick={() => { if (newService.trim()) { updateSettings("services", [...settings.services, newService.trim()]); setNewService(""); }}}
            variant="primary" size="md" className="hover:scale-[1.02] px-4 py-3">
            <Plus className="w-4 h-4" />
          </NeuButton>
        </div>
        {settingsErrors.services ? <p className="mt-1.5 text-xs font-medium text-[#bb6868]">{settingsErrors.services}</p> : null}
      </SectionCard>

      {/* ── Schedule Settings ── */}
      <SectionCard title="Pengaturan Jadwal Praktek" icon={Clock}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <Field label="Jam Mulai">
            <NeuInput type="time"
              value={settings.workHourStart} onChange={e => updateSettings("workHourStart", e.target.value)}
              onFocus={focusStyle} onBlur={blurStyle} />
            {settingsErrors.workHourStart ? <p className="mt-1.5 text-xs font-medium text-[#bb6868]">{settingsErrors.workHourStart}</p> : null}
          </Field>
          <Field label="Jam Selesai">
            <NeuInput type="time"
              value={settings.workHourEnd} onChange={e => updateSettings("workHourEnd", e.target.value)}
              onFocus={focusStyle} onBlur={blurStyle} />
            {settingsErrors.workHourEnd ? <p className="mt-1.5 text-xs font-medium text-[#bb6868]">{settingsErrors.workHourEnd}</p> : null}
          </Field>
          <Field label="Istirahat Mulai">
            <NeuInput type="time"
              value={settings.breakStart} onChange={e => updateSettings("breakStart", e.target.value)}
              onFocus={focusStyle} onBlur={blurStyle} />
            {settingsErrors.breakStart ? <p className="mt-1.5 text-xs font-medium text-[#bb6868]">{settingsErrors.breakStart}</p> : null}
          </Field>
          <Field label="Istirahat Selesai">
            <NeuInput type="time"
              value={settings.breakEnd} onChange={e => updateSettings("breakEnd", e.target.value)}
              onFocus={focusStyle} onBlur={blurStyle} />
            {settingsErrors.breakEnd ? <p className="mt-1.5 text-xs font-medium text-[#bb6868]">{settingsErrors.breakEnd}</p> : null}
          </Field>
        </div>

        <Field label="Durasi Setiap Slot (menit)">
          <div className="flex flex-wrap gap-2 mt-1">
            {[15, 20, 30, 45, 60].map(dur => (
              <NeuButton key={dur} onClick={() => updateSettings("slotDurationMinutes", dur)}
                variant={settings.slotDurationMinutes === dur ? "primary" : "secondary"}
                size="sm" className="hover:scale-[1.04]">
                {dur} mnt
              </NeuButton>
            ))}
          </div>
          {settingsErrors.slotDurationMinutes ? <p className="mt-1.5 text-xs font-medium text-[#bb6868]">{settingsErrors.slotDurationMinutes}</p> : null}
        </Field>

        {/* Slot Preview */}
        <NeuCard inset className="mt-5 rounded-2xl p-4">
          <p className="text-xs font-bold text-[#5D688A]/70 mb-3">
            Preview slot ({preview.length} slot × {settings.slotDurationMinutes} mnt):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {preview.map(slot => (
              <NeuChip key={slot} className="px-2.5 py-1 text-[11px]" style={{ color: "#4e6785" }}>
                {slot}
              </NeuChip>
            ))}
            {preview.length === 0 && <p className="text-xs text-[#5D688A]/40">Tidak ada slot tersedia</p>}
          </div>
        </NeuCard>

        {/* Apply to schedule button */}
        <div className="chip-neu mt-4 flex items-start gap-3 rounded-2xl p-4">
          <Megaphone className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#E79191" }} />
          <p className="text-xs text-[#5D688A]/70">
            Setelah menyimpan, buka halaman <strong>Jadwal</strong> dan buat jadwal baru — slot akan otomatis mengikuti durasi yang dipilih di sini.
          </p>
        </div>
      </SectionCard>

      {/* ── Admin Management ── */}
      <SectionCard title={isSuperadmin ? "Manajemen Admin" : "Akun Admin"} icon={Shield}>
        {/* Feedback message */}
        {adminMsg && (
          <div className="chip-neu mb-4 px-4 py-3 rounded-2xl text-sm font-semibold" style={{ color: adminMsg.type === "ok" ? "#bb7f7f" : "#bb6868" }}>
            {adminMsg.type === "ok" ? "✓ " : "✕ "}{adminMsg.text}
          </div>
        )}

        {/* ── Change My Password ── */}
        <NeuCard inset className="mb-5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <KeyRound className="w-4 h-4" style={{ color: "#FDACAC" }} />
            <h3 className="font-bold text-sm text-[#3a3f52]">Ganti Password Saya</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <NeuInput
                type={pwForm.show ? "text" : "password"}
                placeholder="Password baru (min. 6 karakter)"
                value={pwForm.newPassword}
                onChange={e => {
                  setPwForm(p => ({ ...p, newPassword: e.target.value }));
                  setPasswordErrors((prev) => ({ ...prev, newPassword: undefined }));
                }}
                className="pr-10"
                onFocus={e => (e.currentTarget.style.borderColor = "#FDACAC")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.88)")}
              />
              {passwordErrors.newPassword ? <p className="mt-1.5 text-xs font-medium text-[#bb6868]">{passwordErrors.newPassword}</p> : null}
              <button type="button" onClick={() => setPwForm(p => ({ ...p, show: !p.show }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5D688A]/50 hover:text-[#5D688A]">
                {pwForm.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <NeuInput
              type={pwForm.show ? "text" : "password"}
              placeholder="Konfirmasi password baru"
              value={pwForm.confirm}
              onChange={e => {
                setPwForm(p => ({ ...p, confirm: e.target.value }));
                setPasswordErrors((prev) => ({ ...prev, confirm: undefined }));
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "#FDACAC")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.88)")}
            />
          </div>
          {passwordErrors.confirm ? <p className="mt-1.5 text-xs font-medium text-[#bb6868]">{passwordErrors.confirm}</p> : null}
          <NeuButton onClick={handleChangePassword} disabled={pwForm.saving || !pwForm.newPassword}
            variant="primary" size="md" className="mt-3 hover:scale-[1.02]">
            {pwForm.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            Simpan Password Baru
          </NeuButton>
        </NeuCard>

        {isSuperadmin ? (
          <>
            {/* ── Admin List ── */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-[#3a3f52] flex items-center gap-2">
                  <User className="w-4 h-4" style={{ color: "#5D688A" }} />
                  Daftar Admin ({admins.length})
                </h3>
                <NeuButton onClick={() => setAddForm(p => ({ ...p, show: !p.show }))}
                  variant="primary" size="sm" className="hover:scale-[1.02]">
                  <UserPlus className="w-3.5 h-3.5" />
                  Tambah Admin
                </NeuButton>
              </div>

              {adminLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#FDACAC" }} />
                </div>
              ) : admins.length === 0 ? (
                <p className="text-xs text-[#5D688A]/50 py-3 text-center">
                  Belum ada admin di database. Admin default dari environment variable masih aktif.
                </p>
              ) : (
                <div className="space-y-2">
                  {admins.map(admin => (
                    <div key={admin.id} className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
                      <NeuIconTile className="h-8 w-8 rounded-xl">
                        <User className="w-4 h-4" style={{ color: "#5D688A" }} />
                      </NeuIconTile>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#3a3f52] truncate">{admin.name}</p>
                        <p className="text-xs text-[#5D688A]/55 truncate">{admin.email}</p>
                      </div>
                      <NeuChip className="flex-shrink-0 px-2 py-1 text-[10px]" style={{ color: "#4e6785" }}>
                        {admin.role}
                      </NeuChip>
                      {admin.id !== currentUserId && (
                        <button onClick={() => handleDeleteAdmin(admin.id)}
                          className="p-1.5 rounded-lg transition-all hover:bg-red-50 flex-shrink-0">
                          <Trash2 className="w-3.5 h-3.5" style={{ color: "#FDACAC" }} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Add Admin Form ── */}
            {addForm.show && (
              <NeuCard inset className="space-y-3 rounded-2xl p-4">
                <h4 className="font-bold text-sm text-[#3a3f52] flex items-center gap-2">
                  <UserPlus className="w-4 h-4" style={{ color: "#FEC3C3" }} />
                  Tambah Admin Baru
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <NeuInput placeholder="Nama Lengkap" value={addForm.name}
                    onChange={e => {
                      setAddForm(p => ({ ...p, name: e.target.value }));
                      setAddAdminErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#FEC3C3")}
                    onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.88)")}
                  />
                  <NeuInput type="email" placeholder="Email" value={addForm.email}
                    onChange={e => {
                      setAddForm(p => ({ ...p, email: e.target.value }));
                      setAddAdminErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#FEC3C3")}
                    onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.88)")}
                  />
                  <div className="relative">
                    <NeuInput type={addPwShow ? "text" : "password"} placeholder="Password (min. 6 karakter)"
                      value={addForm.password}
                      onChange={e => {
                        setAddForm(p => ({ ...p, password: e.target.value }));
                        setAddAdminErrors((prev) => ({ ...prev, password: undefined }));
                      }}
                      className="pr-10"
                      onFocus={e => (e.currentTarget.style.borderColor = "#FEC3C3")}
                      onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.88)")}
                    />
                    <button type="button" onClick={() => setAddPwShow(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5D688A]/50 hover:text-[#5D688A]">
                      {addPwShow ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <NeuSelect value={addForm.role} onChange={e => {
                    setAddForm(p => ({ ...p, role: e.target.value }));
                    setAddAdminErrors((prev) => ({ ...prev, role: undefined }));
                  }}>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </NeuSelect>
                </div>
                {addAdminErrors.name ? <p className="text-xs font-medium text-[#bb6868]">{addAdminErrors.name}</p> : null}
                {addAdminErrors.email ? <p className="text-xs font-medium text-[#bb6868]">{addAdminErrors.email}</p> : null}
                {addAdminErrors.password ? <p className="text-xs font-medium text-[#bb6868]">{addAdminErrors.password}</p> : null}
                {addAdminErrors.role ? <p className="text-xs font-medium text-[#bb6868]">{addAdminErrors.role}</p> : null}
                <div className="flex gap-2">
                  <NeuButton onClick={() => setAddForm(p => ({ ...p, show: false }))}
                    variant="secondary" size="md">
                    Batal
                  </NeuButton>
                  <NeuButton onClick={handleAddAdmin} disabled={addForm.saving}
                    variant="primary" size="md" className="hover:scale-[1.02]">
                    {addForm.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    Tambah Admin
                  </NeuButton>
                </div>
              </NeuCard>
            )}
          </>
        ) : (
          <NeuAlert tone="secondary" className="mb-4 flex items-start gap-2 text-xs">
            <Shield className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>Akun Anda bertipe <strong>admin</strong>. Manajemen admin hanya tersedia untuk <strong>superadmin</strong>.</span>
          </NeuAlert>
        )}

        {/* Session info */}
        <NeuAlert tone="secondary" className="mt-4 flex items-start gap-2 text-xs">
          <Shield className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>Sesi login aktif sampai <strong>00.00 WIB</strong>. Setelah hari berganti, Anda perlu login ulang.</span>
        </NeuAlert>
      </SectionCard>

      {/* Save button bottom */}
      <NeuButton onClick={handleSave} disabled={saving}
        variant="primary" size="lg" className="flex w-full hover:scale-[1.01]">
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Menyimpan...</>
          : saved ? <><CheckCircle2 className="w-4 h-4" />Pengaturan Tersimpan!</>
          : <><Save className="w-4 h-4" />Simpan Semua Pengaturan</>}
      </NeuButton>
    </div>
  );
}








