"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Calendar,
  Stethoscope,
  User,
  GraduationCap,
  Loader2,
  X,
  Trash2,
  Eye,
  Download,
  FileSpreadsheet,
  FileText,
  ChevronDown,
} from "lucide-react";

interface LogbookEntry {
  id: string;
  koasId: string;
  appointmentId?: string;
  date: string;
  patientInitials: string;
  procedureType: string;
  toothNumber?: string;
  diagnosis: string;
  treatment: string;
  supervisorName: string;
  competencyLevel: "observed" | "assisted" | "performed";
  notes?: string;
  createdAt: string;
}

const procedureTypes = [
  "Penambalan Komposit",
  "Penambalan GIC",
  "Pencabutan Gigi",
  "Scaling / Pembersihan Karang Gigi",
  "Perawatan Saluran Akar",
  "Pulp Capping",
  "Aplikasi Fissure Sealant",
  "Aplikasi Fluor",
  "Insisi Drainase Abses",
  "Pencetakan Rahang",
  "Pemasangan Gigi Tiruan",
  "Konsultasi & Edukasi",
  "Lainnya",
];

const competencyLabels: Record<string, { label: string; color: string }> = {
  observed: { label: "Observasi",  color: "bg-[#FFDBB6]/40 text-[#b87333]" },
  assisted: { label: "Asistensi",  color: "bg-[#5D688A]/10 text-[#5D688A]" },
  performed: { label: "Mandiri",   color: "bg-green-100/60 text-[#3aaa7c]" },
};

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

const monthNamesFull = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

function fmtDate(dateStr: string) {
  if (!dateStr || dateStr === "undefined" || dateStr === "null") return "-";

  let d: Date | null = null;

  // 1. Already YYYY-MM-DD  →  parse as local to avoid UTC shift
  const isoSimple = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
  if (isoSimple) {
    d = new Date(Number(isoSimple[1]), Number(isoSimple[2]) - 1, Number(isoSimple[3]));
  }

  // 2. Full ISO string  e.g. "2026-03-05T00:00:00.000Z"
  if (!d || isNaN(d.getTime())) {
    const isoFull = /^(\d{4})-(\d{2})-(\d{2})T/.exec(dateStr);
    if (isoFull) {
      d = new Date(Number(isoFull[1]), Number(isoFull[2]) - 1, Number(isoFull[3]));
    }
  }

  // 3. Google Sheets epoch ISO  "1899-12-30T..."  — means it's a time-only cell, skip
  // 4. Locale formats  "3/5/2026"  or  "05/03/2026"  or  "2026/03/05"
  if (!d || isNaN(d.getTime())) {
    // Try native Date parse as last resort
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) d = parsed;
  }

  if (!d || isNaN(d.getTime())) return dateStr; // return raw if still can't parse

  const day   = d.getDate();
  const month = monthNamesFull[d.getMonth()];
  const year  = d.getFullYear();
  // sanity-check: year should be reasonable
  if (year < 1990 || year > 2100) return dateStr;
  return `${day} ${month} ${year}`;
}

const competencyMap: Record<string, string> = {
  observed: "Observasi",
  assisted: "Asistensi",
  performed: "Mandiri",
};

// ── Excel color palette ───────────────────────────────────────────────────────
const XL = {
  navy:       "5D688A",
  pink:       "F7A5A5",
  peach:      "FFDBB6",
  cream:      "FFF2EF",
  white:      "FFFFFF",
  darkText:   "2D3748",
  mutedText:  "718096",
  green:      "276749",
  greenBg:    "C6F6D5",
  blueBg:     "EBF4FF",
  blueText:   "2B6CB0",
  orangeBg:   "FEEBC8",
  orangeText: "9C4221",
  rowEven:    "F8F9FC",
  rowOdd:     "FFFFFF",
  border:     "CBD5E0",
};

function xlCell(
  value: string | number,
  opts: {
    bold?: boolean; italic?: boolean; sz?: number;
    color?: string; bg?: string;
    halign?: "left"|"center"|"right"; valign?: "top"|"center"|"bottom";
    wrap?: boolean; border?: boolean; borderColor?: string;
    underline?: boolean;
  } = {}
) {
  const t = typeof value === "number" ? "n" : "s";
  const cell: Record<string, unknown> = { v: value, t };
  cell.s = {
    font: {
      bold:      opts.bold      ?? false,
      italic:    opts.italic    ?? false,
      underline: opts.underline ?? false,
      sz:        opts.sz        ?? 10,
      color:     { rgb: opts.color ?? XL.darkText },
      name:      "Calibri",
    },
    fill: opts.bg
      ? { patternType: "solid", fgColor: { rgb: opts.bg } }
      : { patternType: "none" },
    alignment: {
      horizontal: opts.halign ?? "left",
      vertical:   opts.valign ?? "center",
      wrapText:   opts.wrap   ?? false,
    },
    ...(opts.border ? {
      border: {
        top:    { style: "thin", color: { rgb: opts.borderColor ?? XL.border } },
        bottom: { style: "thin", color: { rgb: opts.borderColor ?? XL.border } },
        left:   { style: "thin", color: { rgb: opts.borderColor ?? XL.border } },
        right:  { style: "thin", color: { rgb: opts.borderColor ?? XL.border } },
      }
    } : {}),
  };
  return cell;
}

async function exportExcel(entries: LogbookEntry[]) {
  const XLSX = await import("xlsx");

  const now       = new Date();
  const stamp     = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}`;
  const printDate = now.toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" });

  const totalPerformed = entries.filter(e => e.competencyLevel === "performed").length;
  const totalAssisted  = entries.filter(e => e.competencyLevel === "assisted").length;
  const totalObserved  = entries.filter(e => e.competencyLevel === "observed").length;

  // ── Competency styling map ──────────────────────────────────────────────────
  const compStyle: Record<string, { bg: string; color: string; label: string }> = {
    performed: { bg: XL.greenBg,  color: XL.green,       label: "✓ Mandiri"   },
    assisted:  { bg: XL.blueBg,   color: XL.blueText,    label: "◎ Asistensi" },
    observed:  { bg: XL.orangeBg, color: XL.orangeText,  label: "○ Observasi" },
  };

  // ════════════════════════════════════════════════════════════════════════════
  // SHEET 1 — COVER / RINGKASAN
  // ════════════════════════════════════════════════════════════════════════════
  const wsCover: Record<string, unknown> = {};

  // Title block
  wsCover["A1"] = xlCell("E-LOGBOOK KOAS KEDOKTERAN GIGI", { bold:true, sz:18, color:XL.white, bg:XL.navy, halign:"center" });
  wsCover["A2"] = xlCell("drg. Natasya Bunga Maureen",     { bold:true, sz:13, color:XL.white, bg:XL.navy, halign:"center", italic:true });
  wsCover["A3"] = xlCell("Stase Klinik Kedokteran Gigi",   { sz:11, color:XL.peach, bg:XL.navy, halign:"center" });
  wsCover["A4"] = xlCell("",                                { bg:XL.navy });
  wsCover["A5"] = xlCell(`Tanggal Cetak: ${printDate}`,    { sz:10, color:XL.mutedText, halign:"center", italic:true });
  wsCover["A6"] = xlCell("", {});

  // Stats header
  wsCover["A7"] = xlCell("RINGKASAN CAPAIAN",  { bold:true, sz:12, color:XL.white, bg:XL.navy, halign:"center", border:true });
  wsCover["A8"] = xlCell("",                   { bg:"EBF8FF" });

  // Stat rows
  const stats = [
    ["📋  Total Catatan",      entries.length,    XL.navy,    "E8EDF5"],
    ["✅  Tindakan Mandiri",   totalPerformed,    XL.green,   "F0FFF4"],
    ["🔵  Asistensi",          totalAssisted,     XL.blueText,"EBF4FF"],
    ["🟡  Observasi",          totalObserved,     XL.orangeText, "FFFBEB"],
  ];
  stats.forEach(([label, val, color, bg], i) => {
    const r = 9 + i;
    wsCover[`A${r}`] = xlCell(label as string, { sz:11, bold:true, color: color as string, bg: bg as string, border:true, borderColor:XL.border });
    wsCover[`B${r}`] = xlCell(val as number,   { sz:14, bold:true, color: color as string, bg: bg as string, halign:"center", border:true, borderColor:XL.border, t:"n" } as Parameters<typeof xlCell>[1] & { t?: string });
  });

  wsCover["A13"] = xlCell("",{});
  wsCover["A14"] = xlCell("DISTRIBUSI TINDAKAN TERBANYAK", { bold:true, sz:11, color:XL.white, bg:XL.navy, halign:"center", border:true });

  // Procedure frequency
  const procCount: Record<string, number> = {};
  entries.forEach(e => { procCount[e.procedureType] = (procCount[e.procedureType] || 0) + 1; });
  const topProcs = Object.entries(procCount).sort((a,b) => b[1]-a[1]).slice(0, 7);
  topProcs.forEach(([proc, cnt], i) => {
    const r = 15 + i;
    const pct = Math.round((cnt / entries.length) * 100);
    const bar = "█".repeat(Math.round(pct / 5)) + "░".repeat(20 - Math.round(pct / 5));
    wsCover[`A${r}`] = xlCell(`${i+1}. ${proc}`, { sz:10, color:XL.darkText, bg: i%2===0 ? XL.rowEven : XL.rowOdd, border:true });
    wsCover[`B${r}`] = xlCell(cnt,                { sz:10, bold:true, color:XL.navy, halign:"center", bg: i%2===0 ? XL.rowEven : XL.rowOdd, border:true });
    wsCover[`C${r}`] = xlCell(`${bar} ${pct}%`,   { sz:9, color:XL.navy, bg: i%2===0 ? XL.rowEven : XL.rowOdd, border:true });
  });

  // Set ref & merges
  const coverLastRow = 15 + topProcs.length;
  wsCover["!ref"] = `A1:C${coverLastRow}`;
  wsCover["!merges"] = [
    { s:{r:0,c:0}, e:{r:0,c:2} }, // A1:C1 title
    { s:{r:1,c:0}, e:{r:1,c:2} }, // A2:C2 name
    { s:{r:2,c:0}, e:{r:2,c:2} }, // A3:C3 subtitle
    { s:{r:3,c:0}, e:{r:3,c:2} }, // A4:C4 blank
    { s:{r:4,c:0}, e:{r:4,c:2} }, // A5:C5 date
    { s:{r:5,c:0}, e:{r:5,c:2} }, // A6
    { s:{r:6,c:0}, e:{r:6,c:2} }, // A7 stats header
    { s:{r:7,c:0}, e:{r:7,c:2} }, // A8
    { s:{r:13,c:0}, e:{r:13,c:2} }, // A14 procedure header
  ];
  wsCover["!cols"] = [{ wch: 36 }, { wch: 12 }, { wch: 30 }];
  wsCover["!rows"] = [
    { hpt: 36 }, { hpt: 24 }, { hpt: 20 }, { hpt: 8 },
    { hpt: 18 }, { hpt: 8 },
  ];

  // ════════════════════════════════════════════════════════════════════════════
  // SHEET 2 — DATA LOGBOOK
  // ════════════════════════════════════════════════════════════════════════════
  const wsData: Record<string, unknown> = {};

  // ── Sub-header title strip ──────────────────────────────────────────────────
  wsData["A1"] = xlCell("E-LOGBOOK — drg. Natasya Bunga Maureen",
    { bold:true, sz:13, color:XL.white, bg:XL.navy, halign:"center" });
  wsData["A2"] = xlCell(`Total ${entries.length} catatan  ·  Dicetak: ${printDate}`,
    { sz:9, color:XL.peach, bg:XL.navy, halign:"center", italic:true });

  // ── Column headers (row 4) ──────────────────────────────────────────────────
  const headers = [
    "No","Tanggal","Inisial Pasien","Jenis Tindakan",
    "No. Gigi","Diagnosis","Treatment","Pembimbing",
    "Kompetensi","Catatan",
  ];
  const headerBg   = XL.navy;
  const headerCols = ["A","B","C","D","E","F","G","H","I","J"];
  headers.forEach((h, i) => {
    wsData[`${headerCols[i]}4`] = xlCell(h, {
      bold:true, sz:10, color:XL.white, bg:headerBg,
      halign:"center", border:true, borderColor:"4A5568",
    });
  });

  // ── Data rows (start row 5) ─────────────────────────────────────────────────
  entries.forEach((e, i) => {
    const r   = i + 5;
    const isEven = i % 2 === 0;
    const cs  = compStyle[e.competencyLevel] ?? { bg: XL.rowOdd, color: XL.darkText, label: e.competencyLevel };
    const rowBg = isEven ? XL.rowEven : XL.rowOdd;

    const base = { sz:9, wrap:true, border:true, borderColor:XL.border, valign:"top" as const };

    wsData[`A${r}`] = xlCell(i+1,                               { ...base, halign:"center", bg:rowBg, bold:true, color:XL.navy });
    wsData[`B${r}`] = xlCell(fmtDate(e.date),                   { ...base, bg:rowBg, color:XL.darkText });
    wsData[`C${r}`] = xlCell(e.patientInitials,                  { ...base, halign:"center", bg:rowBg });
    wsData[`D${r}`] = xlCell(e.procedureType,                    { ...base, bold:true, bg:rowBg, color:XL.navy });
    wsData[`E${r}`] = xlCell(e.toothNumber || "-",               { ...base, halign:"center", bg:rowBg });
    wsData[`F${r}`] = xlCell(e.diagnosis,                        { ...base, bg:rowBg, italic:true });
    wsData[`G${r}`] = xlCell(e.treatment,                        { ...base, bg:rowBg });
    wsData[`H${r}`] = xlCell(e.supervisorName,                   { ...base, bg:rowBg });
    wsData[`I${r}`] = xlCell(cs.label,                           { ...base, halign:"center", bg:cs.bg, color:cs.color, bold:true });
    wsData[`J${r}`] = xlCell(e.notes || "-",                     { ...base, bg:rowBg, color:XL.mutedText, italic:true });
  });

  // ── Footer row ──────────────────────────────────────────────────────────────
  const footerRow = entries.length + 5;
  const footerText = `Total: ${entries.length} catatan  |  Mandiri: ${totalPerformed}  |  Asistensi: ${totalAssisted}  |  Observasi: ${totalObserved}`;
  wsData[`A${footerRow}`] = xlCell(footerText,
    { bold:true, sz:9, color:XL.white, bg:XL.navy, halign:"center", border:true });

  // ref, merges, cols, freeze
  wsData["!ref"] = `A1:J${footerRow}`;
  wsData["!merges"] = [
    { s:{r:0,c:0}, e:{r:0,c:9} },  // A1:J1  title
    { s:{r:1,c:0}, e:{r:1,c:9} },  // A2:J2  subtitle
    { s:{r:2,c:0}, e:{r:2,c:9} },  // A3:J3  spacer
    { s:{r:footerRow-1,c:0}, e:{r:footerRow-1,c:9} }, // footer
  ];
  wsData["!cols"] = [
    { wch: 4 },   // No
    { wch: 20 },  // Tanggal
    { wch: 16 },  // Inisial Pasien
    { wch: 30 },  // Jenis Tindakan
    { wch: 9 },   // No. Gigi
    { wch: 32 },  // Diagnosis
    { wch: 36 },  // Treatment
    { wch: 28 },  // Pembimbing
    { wch: 16 },  // Kompetensi
    { wch: 28 },  // Catatan
  ];
  wsData["!rows"] = [
    { hpt: 30 },  // row 1 title
    { hpt: 16 },  // row 2 subtitle
    { hpt: 8  },  // row 3 spacer
    { hpt: 22 },  // row 4 headers
    ...entries.map(() => ({ hpt: 36 })),
    { hpt: 20 },  // footer
  ];
  // Freeze header rows (row 1-4)
  wsData["!freeze"] = { xSplit: 0, ySplit: 4 };

  // ── Build workbook ──────────────────────────────────────────────────────────
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsCover as unknown as ReturnType<typeof XLSX.utils.aoa_to_sheet>, "📊 Ringkasan");
  XLSX.utils.book_append_sheet(wb, wsData  as unknown as ReturnType<typeof XLSX.utils.aoa_to_sheet>, "📋 E-Logbook");

  XLSX.writeFile(wb, `ELogbook_BungaMaureen_${stamp}.xlsx`, {
    bookType: "xlsx",
    cellStyles: true,
  });
}

function exportPDF(entries: LogbookEntry[]) {
  const now = new Date();
  const printDate = now.toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" });
  const totalPerformed = entries.filter(e => e.competencyLevel === "performed").length;
  const totalAssisted  = entries.filter(e => e.competencyLevel === "assisted").length;
  const totalObserved  = entries.filter(e => e.competencyLevel === "observed").length;

  const rows = entries.map((e, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${fmtDate(e.date)}</td>
      <td>${e.patientInitials}</td>
      <td>${e.procedureType}</td>
      <td>${e.toothNumber || "-"}</td>
      <td>${e.diagnosis}</td>
      <td>${e.treatment}</td>
      <td>${e.supervisorName}</td>
      <td><span class="badge badge-${e.competencyLevel}">${competencyMap[e.competencyLevel]}</span></td>
      <td>${e.notes || "-"}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>E-Logbook — drg. Natasya Bunga Maureen</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #2d3748; background: white; padding: 20px; }
  .header { text-align: center; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 2.5px solid #5D688A; }
  .header h1 { font-size: 18px; font-weight: 800; color: #5D688A; letter-spacing: 0.3px; }
  .header h2 { font-size: 13px; font-weight: 600; color: #F7A5A5; margin-top: 3px; }
  .header p  { font-size: 10px; color: #718096; margin-top: 4px; }
  .stats { display: flex; gap: 12px; margin-bottom: 16px; }
  .stat { flex: 1; text-align: center; padding: 10px 8px; border-radius: 10px; background: #f7fafc; border: 1px solid #e2e8f0; }
  .stat .val { font-size: 20px; font-weight: 800; color: #5D688A; }
  .stat .lbl { font-size: 9px; color: #718096; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
  thead tr { background: #5D688A; color: white; }
  thead th { padding: 7px 6px; text-align: left; font-weight: 700; letter-spacing: 0.2px; white-space: nowrap; }
  tbody tr:nth-child(even) { background: #f8f9fc; }
  tbody tr:hover { background: #fff5f5; }
  tbody td { padding: 6px 6px; vertical-align: top; border-bottom: 1px solid #e2e8f0; }
  .badge { display: inline-block; padding: 2px 7px; border-radius: 20px; font-size: 8.5px; font-weight: 700; white-space: nowrap; }
  .badge-performed { background: #c6f6d5; color: #276749; }
  .badge-assisted  { background: #e2e8f0; color: #4a5568; }
  .badge-observed  { background: #feebc8; color: #9c4221; }
  .footer { margin-top: 16px; font-size: 9px; color: #a0aec0; text-align: right; border-top: 1px solid #e2e8f0; padding-top: 8px; }
  @media print {
    body { padding: 10px; font-size: 10px; }
    .no-print { display: none; }
    table { font-size: 8.5px; }
    @page { margin: 12mm; size: A4 landscape; }
  }
</style>
</head>
<body>
  <div class="header">
    <h1>📋 E-Logbook Koas Kedokteran Gigi</h1>
    <h2>drg. Natasya Bunga Maureen</h2>
    <p>Dicetak pada ${printDate} &nbsp;·&nbsp; Total ${entries.length} catatan</p>
  </div>
  <div class="stats">
    <div class="stat"><div class="val">${entries.length}</div><div class="lbl">Total Catatan</div></div>
    <div class="stat"><div class="val" style="color:#276749">${totalPerformed}</div><div class="lbl">Mandiri</div></div>
    <div class="stat"><div class="val" style="color:#4a5568">${totalAssisted}</div><div class="lbl">Asistensi</div></div>
    <div class="stat"><div class="val" style="color:#9c4221">${totalObserved}</div><div class="lbl">Observasi</div></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>No</th><th>Tanggal</th><th>Pasien</th><th>Jenis Tindakan</th>
        <th>No.Gigi</th><th>Diagnosis</th><th>Treatment</th>
        <th>Pembimbing</th><th>Kompetensi</th><th>Catatan</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">E-Logbook · drg. Natasya Bunga Maureen · ${printDate}</div>
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, "_blank", "width=1200,height=800");
  if (win) win.focus();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export default function LogbookPage() {
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewEntry, setViewEntry] = useState<LogbookEntry | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showDownload, setShowDownload] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  function todayLocal() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  const [form, setForm] = useState({
    date: todayLocal(),
    patientInitials: "",
    procedureType: "",
    toothNumber: "",
    diagnosis: "",
    treatment: "",
    supervisorName: "",
    competencyLevel: "observed" as "observed" | "assisted" | "performed",
    notes: "",
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    try {
      const res = await fetch("/api/logbook");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setEntries(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/logbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, koasId: "bunga" }),
      });
      if (res.ok) {
        await fetchEntries();
        setShowForm(false);
        resetForm();
      }
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus catatan logbook ini?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/logbook/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
    setDeleting(null);
  }

  function resetForm() {
    setForm({
      date: todayLocal(),
      patientInitials: "",
      procedureType: "",
      toothNumber: "",
      diagnosis: "",
      treatment: "",
      supervisorName: "",
      competencyLevel: "observed",
      notes: "",
    });
  }

  const filtered = entries.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.patientInitials.toLowerCase().includes(q) ||
      e.procedureType.toLowerCase().includes(q) ||
      e.diagnosis.toLowerCase().includes(q) ||
      e.supervisorName.toLowerCase().includes(q)
    );
  });

  // Stats
  const totalPerformed = entries.filter((e) => e.competencyLevel === "performed").length;
  const totalAssisted = entries.filter((e) => e.competencyLevel === "assisted").length;
  const totalObserved = entries.filter((e) => e.competencyLevel === "observed").length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#3a3f52] flex items-center gap-2">
            <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: "#FFDBB6" }} />
            E-Logbook
          </h1>
          <p className="text-xs sm:text-sm text-[#5D688A]/65 mt-1">Catatan tindakan medis dan requirement kelulusan stase</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Download dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDownload(v => !v)}
              disabled={entries.length === 0}
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40"
              style={{ background: "rgba(255,219,182,0.25)", color: "#5D688A", border: "1.5px solid rgba(255,219,182,0.5)" }}>
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Unduh</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDownload ? "rotate-180" : ""}`} />
            </button>

            {showDownload && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-40" onClick={() => setShowDownload(false)} />
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 z-50 min-w-[180px] rounded-2xl overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 8px 32px rgba(93,104,138,0.18)" }}>
                  <div className="px-3 py-2 border-b"
                    style={{ borderColor: "rgba(93,104,138,0.08)" }}>
                    <p className="text-[10px] font-semibold text-[#5D688A]/50 uppercase tracking-wider">Unduh Laporan</p>
                  </div>
                  {/* Excel */}
                  <button
                    onClick={async () => {
                      setShowDownload(false);
                      setExportingExcel(true);
                      await exportExcel(entries);
                      setExportingExcel(false);
                    }}
                    disabled={exportingExcel}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all hover:bg-green-50 tap-feedback">
                    {exportingExcel
                      ? <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                      : <FileSpreadsheet className="w-4 h-4 text-green-600" />}
                    <div className="text-left">
                      <p className="text-[#3a3f52] text-sm">Excel (.xlsx)</p>
                      <p className="text-[10px] text-[#5D688A]/50">Semua data + ringkasan</p>
                    </div>
                  </button>
                  {/* PDF */}
                  <button
                    onClick={() => {
                      setShowDownload(false);
                      exportPDF(entries);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all hover:bg-red-50 tap-feedback">
                    <FileText className="w-4 h-4 text-red-500" />
                    <div className="text-left">
                      <p className="text-[#3a3f52] text-sm">PDF (cetak)</p>
                      <p className="text-[10px] text-[#5D688A]/50">A4 landscape, siap cetak</p>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white hover:scale-[1.02] active:scale-95 transition-all tap-feedback"
            style={{ background: "linear-gradient(135deg, #5D688A, #7a88b0)", boxShadow: "0 6px 20px rgba(93,104,138,0.35)" }}>
            <Plus className="w-4 h-4" /> Tambah Catatan
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Catatan",  value: entries.length,    color: "#5D688A",  bg: "rgba(93,104,138,0.1)" },
          { label: "Mandiri",        value: totalPerformed,    color: "#3aaa7c",  bg: "rgba(110,198,160,0.18)" },
          { label: "Asistensi",      value: totalAssisted,     color: "#5D688A",  bg: "rgba(93,104,138,0.1)" },
          { label: "Observasi",      value: totalObserved,     color: "#b87333",  bg: "rgba(255,219,182,0.35)" },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-3.5 sm:p-4 text-center"
            style={{ border: "1px solid rgba(255,255,255,0.75)" }}>
            <p className="text-xl sm:text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] sm:text-xs text-[#5D688A]/60 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5D688A]/40" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari catatan logbook..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm outline-none transition-all"
          style={{ background: "rgba(255,255,255,0.65)", border: "1.5px solid rgba(93,104,138,0.15)", color: "#3a3f52" }}
          onFocus={e => e.currentTarget.style.borderColor = "#F7A5A5"}
          onBlur={e => e.currentTarget.style.borderColor = "rgba(93,104,138,0.15)"}
        />
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(58,63,82,0.4)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowForm(false)}>
          <div className="glass rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            style={{ border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 20px 60px rgba(93,104,138,0.2)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-[#3a3f52]">Tambah Catatan Logbook</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-white/60 text-[#5D688A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#5D688A] mb-1.5">
                    <Calendar className="w-3.5 h-3.5 inline mr-1" /> Tanggal *
                  </label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required
                    className="w-full px-4 py-2.5 rounded-2xl text-sm outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(93,104,138,0.15)", color: "#3a3f52" }} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#5D688A] mb-1.5">
                    <User className="w-3.5 h-3.5 inline mr-1" /> Inisial Pasien *
                  </label>
                  <input type="text" value={form.patientInitials} onChange={(e) => setForm({ ...form, patientInitials: e.target.value })}
                    placeholder="Ny. S / Tn. A" required
                    className="w-full px-4 py-2.5 rounded-2xl text-sm outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(93,104,138,0.15)", color: "#3a3f52" }} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#5D688A] mb-1.5">
                    <Stethoscope className="w-3.5 h-3.5 inline mr-1" /> Jenis Tindakan *
                  </label>
                  <select value={form.procedureType} onChange={(e) => setForm({ ...form, procedureType: e.target.value })} required
                    className="w-full px-4 py-2.5 rounded-2xl text-sm outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(93,104,138,0.15)", color: "#3a3f52" }}>
                    <option value="">Pilih tindakan...</option>
                    {procedureTypes.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#5D688A] mb-1.5">Nomor Gigi</label>
                  <input type="text" value={form.toothNumber} onChange={(e) => setForm({ ...form, toothNumber: e.target.value })}
                    placeholder="Contoh: 36, 11"
                    className="w-full px-4 py-2.5 rounded-2xl text-sm outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(93,104,138,0.15)", color: "#3a3f52" }} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#5D688A] mb-1.5">Diagnosis *</label>
                <input type="text" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                  placeholder="Contoh: Pulpitis irreversible" required
                  className="w-full px-4 py-2.5 rounded-2xl text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(93,104,138,0.15)", color: "#3a3f52" }} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#5D688A] mb-1.5">Tindakan / Treatment *</label>
                <textarea rows={2} value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })}
                  placeholder="Jelaskan tindakan yang dilakukan..." required
                  className="w-full px-4 py-2.5 rounded-2xl text-sm outline-none transition-all resize-none"
                  style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(93,104,138,0.15)", color: "#3a3f52" }} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#5D688A] mb-1.5">
                    <GraduationCap className="w-3.5 h-3.5 inline mr-1" /> Pembimbing *
                  </label>
                  <input type="text" value={form.supervisorName} onChange={(e) => setForm({ ...form, supervisorName: e.target.value })}
                    placeholder="Nama dosen pembimbing" required
                    className="w-full px-4 py-2.5 rounded-2xl text-sm outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(93,104,138,0.15)", color: "#3a3f52" }} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#5D688A] mb-1.5">Tingkat Kompetensi *</label>
                  <select value={form.competencyLevel} onChange={(e) => setForm({ ...form, competencyLevel: e.target.value as "observed" | "assisted" | "performed" })} required
                    className="w-full px-4 py-2.5 rounded-2xl text-sm outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(93,104,138,0.15)", color: "#3a3f52" }}>
                    <option value="observed">Observasi (Mengamati)</option>
                    <option value="assisted">Asistensi (Membantu)</option>
                    <option value="performed">Mandiri (Melakukan)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#5D688A] mb-1.5">Catatan Tambahan</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Catatan tambahan (opsional)..."
                  className="w-full px-4 py-2.5 rounded-2xl text-sm outline-none transition-all resize-none"
                  style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(93,104,138,0.15)", color: "#3a3f52" }} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm text-[#5D688A] hover:bg-white/60 transition-all"
                  style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(93,104,138,0.15)" }}>
                  Batal
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  style={{ background: "linear-gradient(135deg, #F7A5A5, #5D688A)", boxShadow: "0 6px 20px rgba(247,165,165,0.35)" }}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Entry Modal */}
      {viewEntry && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: "rgba(58,63,82,0.45)", backdropFilter: "blur(8px)" }}
          onClick={() => setViewEntry(null)}>
          <div className="modal-sheet glass sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto"
            style={{ border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 20px 60px rgba(93,104,138,0.2)" }}
            onClick={(e) => e.stopPropagation()}>
            {/* Drag handle (mobile) */}
            <div className="sm:hidden flex justify-center mb-3">
              <div className="w-10 h-1 rounded-full" style={{ background: "rgba(93,104,138,0.25)" }} />
            </div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-[#3a3f52]">Detail Catatan</h3>
              <button onClick={() => setViewEntry(null)} className="p-2 rounded-xl hover:bg-white/60 text-[#5D688A] tap-feedback">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label: "Tanggal",     value: fmtDate(viewEntry.date) },
                { label: "Pasien",      value: viewEntry.patientInitials },
                { label: "Tindakan",    value: viewEntry.procedureType },
                { label: "Nomor Gigi",  value: viewEntry.toothNumber || "-" },
                { label: "Diagnosis",   value: viewEntry.diagnosis },
                { label: "Treatment",   value: viewEntry.treatment },
                { label: "Pembimbing",  value: viewEntry.supervisorName },
                { label: "Kompetensi",  value: competencyLabels[viewEntry.competencyLevel].label },
                { label: "Catatan",     value: viewEntry.notes || "-" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-start gap-4 py-2"
                  style={{ borderBottom: "1px solid rgba(93,104,138,0.1)" }}>
                  <span className="text-sm text-[#5D688A]/60 shrink-0">{item.label}</span>
                  <span className="text-sm font-semibold text-[#3a3f52] text-right">{item.value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setViewEntry(null)}
              className="w-full mt-6 py-3 rounded-2xl font-bold text-sm text-[#5D688A] hover:bg-white/60 transition-all"
              style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(93,104,138,0.15)" }}>
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Entry List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl p-5 animate-pulse"
              style={{ border: "1px solid rgba(255,255,255,0.7)" }}>
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-2xl" style={{ background: "rgba(93,104,138,0.08)" }} />
                <div className="flex-1 space-y-2">
                  <div className="h-4 rounded-lg w-1/4" style={{ background: "rgba(93,104,138,0.08)" }} />
                  <div className="h-3 rounded-lg w-1/2" style={{ background: "rgba(93,104,138,0.06)" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass text-center py-16 rounded-2xl"
          style={{ border: "1px solid rgba(255,255,255,0.7)" }}>
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-[#FFDBB6] opacity-60" />
          <p className="font-bold text-[#3a3f52]">Belum ada catatan logbook</p>
          <p className="text-sm text-[#5D688A]/55 mt-1">Klik &ldquo;Tambah Catatan&rdquo; untuk mulai mencatat</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => {
            // Robust date parsing — same logic as fmtDate
            let d: Date;
            const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(entry.date);
            if (iso) {
              d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
            } else {
              d = new Date(entry.date);
            }
            const validDate = !isNaN(d.getTime()) && d.getFullYear() > 1990;
            const comp = competencyLabels[entry.competencyLevel];
            return (
              <div key={entry.id}
                className="glass rounded-2xl p-4 sm:p-5 transition-all duration-200 tap-feedback"
                style={{ border: "1px solid rgba(255,255,255,0.75)", boxShadow: "0 2px 12px rgba(93,104,138,0.06)" }}>
                <div className="flex items-start gap-3">
                  {/* Date */}
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg, rgba(255,219,182,0.3), rgba(247,165,165,0.2))", border: "1px solid rgba(255,219,182,0.4)" }}>
                    <span className="text-[8px] sm:text-[9px] font-bold" style={{ color: "#F7A5A5" }}>
                      {validDate ? monthNames[d.getMonth()] : "—"}
                    </span>
                    <span className="text-base sm:text-lg font-extrabold text-[#3a3f52] -mt-0.5">
                      {validDate ? d.getDate() : "?"}
                    </span>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-[#3a3f52] text-sm break-word">{entry.procedureType}</h3>
                      <span className={`text-[9px] sm:text-[10px] px-2 py-1 rounded-full font-semibold shrink-0 ${comp.color}`}>
                        {comp.label}
                      </span>
                    </div>
                    <p className="text-xs text-[#5D688A]/60 mb-1">
                      Pasien: <strong>{entry.patientInitials}</strong>
                      {entry.toothNumber && <> · Gigi: <strong>{entry.toothNumber}</strong></>}
                    </p>
                    <p className="text-xs text-[#5D688A]/55 leading-relaxed">
                      Dx: {entry.diagnosis} · {entry.supervisorName}
                    </p>
                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <button onClick={() => setViewEntry(entry)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.03] active:scale-95 tap-feedback"
                        style={{ background: "rgba(93,104,138,0.1)", color: "#5D688A" }}>
                        <Eye className="w-3 h-3" /> Detail
                      </button>
                      <button onClick={() => handleDelete(entry.id)} disabled={deleting === entry.id}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50 tap-feedback"
                        style={{ background: "rgba(247,165,165,0.2)", color: "#c0504f" }}>
                        {deleting === entry.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

