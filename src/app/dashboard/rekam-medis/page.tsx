"use client";

import { useState, useCallback } from "react";
import {
  Search, User, Shield, Heart, MapPin, Phone, Mail,
  Calendar, Activity, ChevronDown, ChevronUp, RefreshCw,
  AlertCircle, CheckCircle, Loader2, FileText, Hash, X,
  Fingerprint, Users,
} from "lucide-react";
import {
  NeuAlert,
  NeuButton,
  NeuCard,
  NeuChip,
  NeuInput,
  NeuSelect,
} from "@/components/ui/neumorphism";

/* ────────────────────────────────────────────────────────── types */
interface PatientInfo {
  id: string;
  nik?: string;
  ihsNumber?: string;
  name: string;
  gender: string;
  birthDate?: string | null;
  addressText?: string | null;
  phone?: string | null;
  email?: string | null;
  maritalStatus?: string | null;
  active?: boolean | null;
  lastUpdated?: string | null;
}

/* ────────────────────────────────────────────────────────── page */
export default function RekamMedisPage() {
  // ── search state ──────────────────────────────────────────────
  const [searchType, setSearchType] = useState<"nik" | "search">("nik");
  const [nik, setNik] = useState("");
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");

  // ── result state ──────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientInfo | null>(null);
  const [rawData, setRawData] = useState<Record<string, unknown> | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  // ── detail state ──────────────────────────────────────────────
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<PatientInfo | null>(null);
  const [detailRaw, setDetailRaw] = useState<Record<string, unknown> | null>(null);
  const [showDetailRaw, setShowDetailRaw] = useState(false);

  // ── search handler ────────────────────────────────────────────
  const handleSearch = useCallback(async () => {
    setError(null);
    setPatients([]);
    setTotal(null);
    setSelectedPatient(null);
    setRawData(null);
    setDetailData(null);
    setDetailRaw(null);
    setLoading(true);

    try {
      let url = "/api/satusehat?";
      if (searchType === "nik") {
        if (!nik.trim()) { setError("Masukkan NIK pasien"); return; }
        url += `type=nik&nik=${encodeURIComponent(nik.trim())}`;
      } else {
        if (!name.trim() || !birthdate) {
          setError("Masukkan nama dan tanggal lahir pasien");
          return;
        }
        url += `type=search&name=${encodeURIComponent(name.trim())}&birthdate=${birthdate}&gender=${gender}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mencari data pasien");
        return;
      }

      setPatients(data.patients || []);
      setTotal(data.total ?? 0);
      setRawData(data.raw);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, [searchType, nik, name, birthdate, gender]);

  // ── detail handler ────────────────────────────────────────────
  const handleViewDetail = useCallback(async (patient: PatientInfo) => {
    setSelectedPatient(patient);
    setDetailLoading(true);
    setDetailData(null);
    setDetailRaw(null);

    try {
      const res = await fetch(`/api/satusehat?type=detail&patientId=${encodeURIComponent(patient.id)}`);
      const data = await res.json();

      if (!res.ok) {
        setDetailData(patient); // fallback to search data
        return;
      }

      setDetailData(data.patient);
      setDetailRaw(data.raw);
    } catch {
      setDetailData(patient); // fallback
    } finally {
      setDetailLoading(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#3a3f52] flex items-center gap-2">
            <FileText className="w-7 h-7 text-[#FDACAC]" />
            Rekam Medis Pasien
          </h1>
          <p className="text-sm text-[#8a8fa8] mt-1">
            Pencarian data pasien terintegrasi <span className="font-semibold text-[#5D688A]">SATUSEHAT</span>
          </p>
        </div>
        <NeuChip className="text-xs font-medium" style={{ color: "#2d7a5a" }}>
          <div className="w-2 h-2 rounded-full bg-[#FDACAC] animate-pulse-soft" />
          Sandbox Mode
        </NeuChip>
      </div>

      {/* ── Search Card ── */}
      <NeuCard className="space-y-5 rounded-3xl p-6">
        {/* Search Type Tabs */}
        <div className="neu-inset flex rounded-2xl p-1">
          <button
            onClick={() => setSearchType("nik")}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
            style={searchType === "nik" ? {
              background: "#4e6785",
              color: "white",
              boxShadow: "4px 4px 8px rgba(137,150,166,0.24), -4px -4px 8px rgba(255,255,255,0.16)"
            } : {
              color: "#4e6785",
              background: "#e6e7ee",
              border: "1px solid rgba(255,255,255,0.58)",
              boxShadow: "4px 4px 8px rgba(163,177,198,0.18), -4px -4px 8px rgba(255,255,255,0.52)"
            }}
          >
            <Fingerprint className="w-4 h-4" />
            Cari via NIK
          </button>
          <button
            onClick={() => setSearchType("search")}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
            style={searchType === "search" ? {
              background: "#4e6785",
              color: "white",
              boxShadow: "4px 4px 8px rgba(137,150,166,0.24), -4px -4px 8px rgba(255,255,255,0.16)"
            } : {
              color: "#4e6785",
              background: "#e6e7ee",
              border: "1px solid rgba(255,255,255,0.58)",
              boxShadow: "4px 4px 8px rgba(163,177,198,0.18), -4px -4px 8px rgba(255,255,255,0.52)"
            }}
          >
            <Users className="w-4 h-4" />
            Cari via Nama
          </button>
        </div>

        {/* Search Fields */}
        {searchType === "nik" ? (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-[#5D688A] uppercase tracking-wider">
              Nomor Induk Kependudukan (NIK)
            </label>
              <div className="relative">
                <NeuInput
                  type="text"
                  icon={<Hash className="w-5 h-5" />}
                  placeholder="Masukkan 16 digit NIK pasien..."
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, "").slice(0, 16))}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="py-3.5 pl-12 pr-14 font-medium placeholder:text-[#8a8fa8]/60"
                  maxLength={16}
                />
                {nik && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[#8a8fa8]">
                    {nik.length}/16
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#5D688A] uppercase tracking-wider">
                Nama Pasien
              </label>
              <NeuInput
                type="text"
                icon={<User className="w-4 h-4" />}
                placeholder="Nama lengkap/sebagian..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="py-3.5 pl-11 font-medium placeholder:text-[#8a8fa8]/60"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#5D688A] uppercase tracking-wider">
                Tanggal Lahir
              </label>
              <NeuInput
                type="date"
                icon={<Calendar className="w-4 h-4" />}
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="py-3.5 pl-11 font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#5D688A] uppercase tracking-wider">
                Jenis Kelamin
              </label>
              <div className="relative">
                <Shield className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8fa8]" />
                <NeuSelect
                  value={gender}
                  onChange={(e) => setGender(e.target.value as "male" | "female")}
                  className="cursor-pointer appearance-none py-3.5 pl-11 pr-10 font-medium"
                >
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                </NeuSelect>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8fa8] pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* Search Button */}
        <NeuButton
          onClick={handleSearch}
          disabled={loading}
          variant="primary"
          size="lg"
          className="w-full sm:w-auto"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          {loading ? "Mencari..." : "Cari Pasien"}
        </NeuButton>
      </NeuCard>

      {/* ── Error Alert ── */}
      {error && (
        <NeuAlert tone="danger" className="flex items-start gap-3 animate-slide-up">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Gagal Mencari</p>
            <p className="text-sm text-red-600 mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </NeuAlert>
      )}

      {/* ── Results ── */}
      {total !== null && !loading && (
        <div className="space-y-4 animate-slide-up">
          {/* Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#5D688A]">
              {total === 0 ? "Tidak ada data ditemukan" : `${total} pasien ditemukan`}
            </p>
            <button onClick={() => { setShowRaw(false); setTotal(null); setPatients([]); }}
              className="text-xs text-[#8a8fa8] hover:text-[#5D688A] flex items-center gap-1 transition-colors">
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Patient Cards */}
          <div className="grid gap-4">
            {patients.map((patient) => (
              <NeuCard
                key={patient.id}
                className="group cursor-pointer rounded-2xl p-5 transition-all duration-200"
                style={{
                  borderColor: selectedPatient?.id === patient.id ? "#FDACAC" : undefined,
                  borderWidth: selectedPatient?.id === patient.id ? "2px" : undefined,
                }}
                onClick={() => handleViewDetail(patient)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="chip-neu w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ color: "#4e6785" }}>
                      <User className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-[#3a3f52] group-hover:text-[#5D688A] transition-colors">
                        {patient.name}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {patient.nik && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg"
                            style={{ background: "rgba(93,104,138,0.08)", color: "#5D688A" }}>
                            <Fingerprint className="w-3 h-3" />
                            NIK: {patient.nik}
                          </span>
                        )}
                        {patient.ihsNumber && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg"
                            style={{ background: "rgba(253,172,172,0.15)", color: "#bb6868" }}>
                            <Hash className="w-3 h-3" />
                            IHS: {patient.ihsNumber}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#8a8fa8]">
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          {patient.gender}
                        </span>
                        {patient.birthDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {patient.birthDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {patient.active !== null && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg"
                        style={patient.active ? {
                          background: "rgba(247,215,215,0.72)", color: "#bb7f7f"
                        } : {
                          background: "rgba(239,68,68,0.1)", color: "#dc2626"
                        }}>
                        {patient.active ? (
                          <><CheckCircle className="w-3 h-3" /> Aktif</>
                        ) : (
                          <><AlertCircle className="w-3 h-3" /> Nonaktif</>
                        )}
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4 text-[#8a8fa8] group-hover:text-[#5D688A] transition-colors" />
                  </div>
                </div>
              </NeuCard>
            ))}
          </div>

          {/* Raw FHIR Data Toggle */}
          {rawData && (
            <div>
              <button
                onClick={() => setShowRaw(!showRaw)}
                className="flex items-center gap-2 text-xs font-medium text-[#8a8fa8] hover:text-[#5D688A] transition-colors"
              >
                {showRaw ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {showRaw ? "Sembunyikan" : "Tampilkan"} Raw FHIR Bundle
              </button>
              {showRaw && (
                <pre className="mt-2 p-4 rounded-2xl text-xs overflow-x-auto animate-slide-up"
                  style={{ background: "rgba(93,104,138,0.06)", color: "#5D688A", maxHeight: 400 }}>
                  {JSON.stringify(rawData, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Patient Detail Modal ── */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
          onClick={() => { setSelectedPatient(null); setDetailData(null); setDetailRaw(null); setShowDetailRaw(false); }}>
          {/* Overlay */}
          <div className="absolute inset-0 bg-[#3a3f52]/40 backdrop-blur-sm" />

          {/* Modal */}
          <NeuCard
            className="relative modal-sheet w-full overflow-hidden rounded-t-3xl animate-slide-up sm:max-w-xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: "85vh" }}
          >
            {/* Header Gradient */}
            <div className="p-6 pb-4"
              style={{ background: "rgba(255,255,255,0.16)" }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="glass-dark w-14 h-14 rounded-2xl flex items-center justify-center">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#3a3f52]">Detail Pasien</h2>
                    <p className="text-xs text-[#8a8fa8]">Data dari SATUSEHAT</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedPatient(null); setDetailData(null); }}
                  className="p-2 rounded-xl hover:bg-white/50 text-[#5D688A] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-2 overflow-y-auto" style={{ maxHeight: "calc(85vh - 120px)" }}>
              {detailLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-8 h-8 text-[#5D688A] animate-spin" />
                  <p className="text-sm text-[#8a8fa8]">Memuat detail pasien...</p>
                </div>
              ) : detailData ? (
                <div className="space-y-4">
                  {/* Name Card */}
                  <div className="neu-inset p-4 rounded-2xl">
                    <h3 className="text-xl font-bold text-[#3a3f52]">{detailData.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {detailData.active !== null && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg"
                          style={detailData.active ? {
                            background: "rgba(247,215,215,0.72)", color: "#bb7f7f"
                          } : {
                            background: "rgba(239,68,68,0.12)", color: "#dc2626"
                          }}>
                          {detailData.active ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {detailData.active ? "Aktif" : "Nonaktif"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <DetailItem icon={Hash} label="Patient ID" value={detailData.id} />
                    <DetailItem icon={Fingerprint} label="NIK" value={detailData.nik || "-"} />
                    <DetailItem icon={Activity} label="IHS Number" value={detailData.ihsNumber || "-"} />
                    <DetailItem icon={Shield} label="Jenis Kelamin" value={detailData.gender} />
                    <DetailItem icon={Calendar} label="Tanggal Lahir" value={detailData.birthDate || "-"} />
                    <DetailItem icon={Heart} label="Status Pernikahan" value={detailData.maritalStatus || "-"} />
                    <DetailItem icon={Phone} label="Telepon" value={detailData.phone || "-"} />
                    <DetailItem icon={Mail} label="Email" value={detailData.email || "-"} />
                  </div>

                  {detailData.addressText && (
                    <div className="neu-inset p-3.5 rounded-2xl flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-[#8a8fa8] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-semibold text-[#8a8fa8] uppercase tracking-wider">Alamat</p>
                        <p className="text-sm font-medium text-[#3a3f52] mt-0.5">{detailData.addressText}</p>
                      </div>
                    </div>
                  )}

                  {detailData.lastUpdated && (
                    <p className="text-[10px] text-[#8a8fa8] text-right">
                      Terakhir diperbarui: {new Date(detailData.lastUpdated).toLocaleString("id-ID")}
                    </p>
                  )}

                  {/* Raw FHIR Detail */}
                  {detailRaw && (
                    <div className="pt-2">
                      <button
                        onClick={() => setShowDetailRaw(!showDetailRaw)}
                        className="flex items-center gap-2 text-xs font-medium text-[#8a8fa8] hover:text-[#5D688A] transition-colors"
                      >
                        {showDetailRaw ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {showDetailRaw ? "Sembunyikan" : "Tampilkan"} Raw FHIR Patient
                      </button>
                      {showDetailRaw && (
                        <pre className="mt-2 p-3 rounded-xl text-[10px] overflow-x-auto"
                          style={{ background: "rgba(93,104,138,0.06)", color: "#5D688A", maxHeight: 250 }}>
                          {JSON.stringify(detailRaw, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </NeuCard>
        </div>
      )}

      {/* ── Empty State ── */}
      {total === null && !loading && !error && (
        <NeuCard className="flex flex-col items-center justify-center space-y-4 rounded-3xl p-12 text-center animate-fade-in">
          <div className="chip-neu w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ color: "#4e6785" }}>
            <Search className="w-9 h-9 text-[#FDACAC]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#3a3f52]">Cari Rekam Medis Pasien</h3>
            <p className="text-sm text-[#8a8fa8] mt-1 max-w-md">
              Masukkan NIK atau nama pasien untuk mencari data rekam medis dari sistem SATUSEHAT Kementerian Kesehatan RI.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <span className="text-[10px] font-medium px-2.5 py-1.5 rounded-lg"
              style={{ background: "rgba(93,104,138,0.06)", color: "#8a8fa8" }}>
              🔍 Pencarian via NIK
            </span>
            <span className="text-[10px] font-medium px-2.5 py-1.5 rounded-lg"
              style={{ background: "rgba(93,104,138,0.06)", color: "#8a8fa8" }}>
              👤 Pencarian via Nama + Tanggal Lahir
            </span>
            <span className="text-[10px] font-medium px-2.5 py-1.5 rounded-lg"
              style={{ background: "rgba(93,104,138,0.06)", color: "#8a8fa8" }}>
              📋 Detail Pasien FHIR R4
            </span>
          </div>
        </NeuCard>
      )}

      {/* ── Sandbox Info ── */}
      <NeuCard className="flex items-start gap-3 rounded-2xl p-4" 
        style={{ borderColor: "rgba(93,104,138,0.12)" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(93,104,138,0.08)" }}>
          <Activity className="w-4 h-4 text-[#5D688A]" />
        </div>
        <div>
          <p className="text-xs font-bold text-[#5D688A]">Data Sandbox untuk Uji Coba</p>
          <p className="text-[11px] text-[#8a8fa8] mt-0.5 leading-relaxed">
            Sistem terhubung ke environment <strong>Sandbox/Staging</strong> SATUSEHAT.
            Gunakan NIK dummy berikut untuk testing:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2">
            {[
              { nik: "9271060312000001", name: "Ardianto Putra" },
              { nik: "9204014804000002", name: "Claudia Sintia" },
              { nik: "9104224509000003", name: "Elizabeth Dior" },
              { nik: "9104223107000004", name: "Dr. Alan Bagus Prasetya" },
              { nik: "9104224606000005", name: "Ghina Assyifa" },
            ].map((p) => (
              <button
                key={p.nik}
                onClick={() => { setSearchType("nik"); setNik(p.nik); }}
                className="chip-neu text-left text-[10px] px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-2"
              >
                <code className="font-mono text-[#5D688A] font-semibold">{p.nik}</code>
                <span className="text-[#8a8fa8]">— {p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </NeuCard>
    </div>
  );
}

/* ── Detail Item Component ── */
function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="neu-inset p-3.5 rounded-2xl flex items-start gap-3">
      <Icon className="w-4 h-4 text-[#8a8fa8] mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-[#8a8fa8] uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-[#3a3f52] mt-0.5 break-all">{value}</p>
      </div>
    </div>
  );
}
