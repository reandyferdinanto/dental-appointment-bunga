/**
 * ============================================================
 *  drg. Natasya Bunga Maureen — Google Apps Script Database
 *  Deploy sebagai: Web App → Execute as: Me → Who has access: Anyone
 * ============================================================
 *
 *  Sheet names (tabs):
 *    Appointments  — janji temu pasien
 *    Logbook       — catatan tindakan medis
 *    Schedules     — jadwal slot waktu tersedia
 *
 *  API endpoint: POST /exec  dengan JSON body { action, ...params }
 * ============================================================
 */

// ── CONFIG ────────────────────────────────────────────────────────────────────
var SPREADSHEET_ID = ""; // ← ISI dengan Spreadsheet ID kamu
var SECRET_TOKEN   = ""; // ← ISI dengan token rahasia (bebas, asal sama dengan GSHEET_SECRET di .env)

// Sheet tab names
var SHEET_APPOINTMENTS = "Appointments";
var SHEET_LOGBOOK      = "Logbook";
var SHEET_SCHEDULES    = "Schedules";

// ── COLUMN DEFINITIONS ───────────────────────────────────────────────────────

// Appointments columns  (A=1 … M=13)
var APT_COLS = {
  ID:            1,   // A — unique ID
  PATIENT_NAME:  2,   // B — nama pasien
  PATIENT_PHONE: 3,   // C — no. HP pasien
  PATIENT_EMAIL: 4,   // D — email pasien (opsional)
  KOAS_ID:       5,   // E — ID koas (default: bunga)
  DATE:          6,   // F — tanggal (YYYY-MM-DD)
  TIME:          7,   // G — jam (HH:mm)
  COMPLAINT:     8,   // H — keluhan
  STATUS:        9,   // I — pending / confirmed / completed / cancelled
  NOTES:         10,  // J — catatan dokter
  CREATED_AT:    11,  // K — timestamp dibuat
};

// Logbook columns  (A=1 … K=11)
var LOG_COLS = {
  ID:               1,   // A
  KOAS_ID:          2,   // B
  APPOINTMENT_ID:   3,   // C — opsional
  DATE:             4,   // D
  PATIENT_INITIALS: 5,   // E — inisial pasien
  PROCEDURE_TYPE:   6,   // F — jenis tindakan
  TOOTH_NUMBER:     7,   // G — nomor gigi (opsional)
  DIAGNOSIS:        8,   // H
  TREATMENT:        9,   // I
  SUPERVISOR_NAME:  10,  // J
  COMPETENCY_LEVEL: 11,  // K — observed / assisted / performed
  NOTES:            12,  // L
  CREATED_AT:       13,  // M
};

// Schedules columns  (A=1 … D=4)
var SCH_COLS = {
  KOAS_ID:    1,  // A
  DATE:       2,  // B — YYYY-MM-DD
  SLOTS:      3,  // C — JSON array string: ["09:00","09:30",...]
  UPDATED_AT: 4,  // D
};

// ── ENTRY POINT ───────────────────────────────────────────────────────────────

function doPost(e) {
  try {
    var body   = JSON.parse(e.postData.contents);
    var token  = body.token || "";
    var action = body.action || "";

    // Auth check (skip if SECRET_TOKEN not set)
    if (SECRET_TOKEN && token !== SECRET_TOKEN) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // ── Appointments ──────────────────────────────────
    if (action === "apt_create")           return jsonResponse(aptCreate(ss, body));
    if (action === "apt_list")             return jsonResponse(aptList(ss));
    if (action === "apt_get")              return jsonResponse(aptGet(ss, body.id));
    if (action === "apt_update_status")    return jsonResponse(aptUpdateStatus(ss, body.id, body.status));
    if (action === "apt_delete")           return jsonResponse(aptDelete(ss, body.id));

    // ── Logbook ───────────────────────────────────────
    if (action === "log_create")           return jsonResponse(logCreate(ss, body));
    if (action === "log_list")             return jsonResponse(logList(ss, body.koasId));
    if (action === "log_delete")           return jsonResponse(logDelete(ss, body.id));

    // ── Schedules ─────────────────────────────────────
    if (action === "sch_set")              return jsonResponse(schSet(ss, body.koasId, body.date, body.slots));
    if (action === "sch_get")              return jsonResponse(schGet(ss, body.koasId, body.date));
    if (action === "sch_get_week")         return jsonResponse(schGetWeek(ss, body.koasId, body.weekStart));
    if (action === "sch_remove_slot")      return jsonResponse(schRemoveSlot(ss, body.koasId, body.date, body.time));

    // ── Seed ──────────────────────────────────────────
    if (action === "seed")                 return jsonResponse(seedData(ss));

    return jsonResponse({ error: "Unknown action: " + action }, 400);

  } catch (err) {
    return jsonResponse({ error: err.toString() }, 500);
  }
}

// Allow GET for health check
function doGet(e) {
  return jsonResponse({ status: "ok", app: "drg-bunga-db", version: "1.0" });
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function jsonResponse(data, code) {
  var output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

function generateId() {
  return Utilities.getUuid().replace(/-/g, "").substring(0, 16);
}

function nowISO() {
  return new Date().toISOString();
}

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Write header row
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#5D688A")
      .setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function sheetData(sheet) {
  var last = sheet.getLastRow();
  if (last < 2) return [];
  return sheet.getRange(2, 1, last - 1, sheet.getLastColumn()).getValues();
}

function findRowById(sheet, idCol, id) {
  var data = sheetData(sheet);
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][idCol - 1]) === String(id)) {
      return { row: i + 2, data: data[i] }; // +2 because row 1 = header
    }
  }
  return null;
}

// ── APPOINTMENTS ──────────────────────────────────────────────────────────────

var APT_HEADERS = [
  "ID", "Nama Pasien", "No. HP", "Email",
  "Koas ID", "Tanggal", "Jam", "Keluhan",
  "Status", "Catatan Dokter", "Dibuat Pada"
];

function aptRowToObj(row) {
  return {
    id:           String(row[APT_COLS.ID - 1]),
    patientName:  String(row[APT_COLS.PATIENT_NAME - 1]),
    patientPhone: String(row[APT_COLS.PATIENT_PHONE - 1]),
    patientEmail: String(row[APT_COLS.PATIENT_EMAIL - 1] || ""),
    koasId:       String(row[APT_COLS.KOAS_ID - 1]),
    date:         String(row[APT_COLS.DATE - 1]),
    time:         String(row[APT_COLS.TIME - 1]),
    complaint:    String(row[APT_COLS.COMPLAINT - 1]),
    status:       String(row[APT_COLS.STATUS - 1]),
    notes:        String(row[APT_COLS.NOTES - 1] || ""),
    createdAt:    String(row[APT_COLS.CREATED_AT - 1]),
  };
}

function aptCreate(ss, body) {
  var sheet = getOrCreateSheet(ss, SHEET_APPOINTMENTS, APT_HEADERS);

  // Check & remove slot from schedule (prevent double booking)
  var slotRemoved = schRemoveSlot(ss, body.koasId || "bunga", body.date, body.time);
  if (!slotRemoved.success) {
    return { error: "Slot sudah tidak tersedia" };
  }

  var id = generateId();
  var row = new Array(Object.keys(APT_COLS).length).fill("");
  row[APT_COLS.ID - 1]            = id;
  row[APT_COLS.PATIENT_NAME - 1]  = body.patientName || "";
  row[APT_COLS.PATIENT_PHONE - 1] = body.patientPhone || "";
  row[APT_COLS.PATIENT_EMAIL - 1] = body.patientEmail || "";
  row[APT_COLS.KOAS_ID - 1]       = body.koasId || "bunga";
  row[APT_COLS.DATE - 1]          = body.date || "";
  row[APT_COLS.TIME - 1]          = body.time || "";
  row[APT_COLS.COMPLAINT - 1]     = body.complaint || "";
  row[APT_COLS.STATUS - 1]        = "pending";
  row[APT_COLS.NOTES - 1]         = "";
  row[APT_COLS.CREATED_AT - 1]    = nowISO();

  sheet.appendRow(row);

  // Color-code by status
  aptColorRow(sheet, sheet.getLastRow(), "pending");

  return aptRowToObj(row);
}

function aptList(ss) {
  var sheet = getOrCreateSheet(ss, SHEET_APPOINTMENTS, APT_HEADERS);
  var rows = sheetData(sheet);
  var result = rows
    .filter(function(r) { return r[0] !== ""; })
    .map(aptRowToObj);
  result.sort(function(a, b) {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  return result;
}

function aptGet(ss, id) {
  var sheet = getOrCreateSheet(ss, SHEET_APPOINTMENTS, APT_HEADERS);
  var found = findRowById(sheet, APT_COLS.ID, id);
  if (!found) return null;
  return aptRowToObj(found.data);
}

function aptUpdateStatus(ss, id, newStatus) {
  var sheet = getOrCreateSheet(ss, SHEET_APPOINTMENTS, APT_HEADERS);
  var found = findRowById(sheet, APT_COLS.ID, id);
  if (!found) return { error: "Appointment tidak ditemukan" };

  sheet.getRange(found.row, APT_COLS.STATUS).setValue(newStatus);

  // If cancelled, restore the slot
  if (newStatus === "cancelled") {
    var apt = aptRowToObj(found.data);
    schAddSlot(ss, apt.koasId, apt.date, apt.time);
  }

  aptColorRow(sheet, found.row, newStatus);

  var updatedRow = sheet.getRange(found.row, 1, 1, Object.keys(APT_COLS).length).getValues()[0];
  return aptRowToObj(updatedRow);
}

function aptDelete(ss, id) {
  var sheet = getOrCreateSheet(ss, SHEET_APPOINTMENTS, APT_HEADERS);
  var found = findRowById(sheet, APT_COLS.ID, id);
  if (!found) return { error: "Appointment tidak ditemukan" };

  // Restore slot
  var apt = aptRowToObj(found.data);
  schAddSlot(ss, apt.koasId, apt.date, apt.time);

  sheet.deleteRow(found.row);
  return { success: true };
}

function aptColorRow(sheet, rowNum, status) {
  var colors = {
    pending:   "#FFF9F0",
    confirmed: "#F0FFF4",
    completed: "#F0F4FF",
    cancelled: "#FFF0F0",
  };
  var color = colors[status] || "#FFFFFF";
  sheet.getRange(rowNum, 1, 1, Object.keys(APT_COLS).length).setBackground(color);
}

// ── LOGBOOK ───────────────────────────────────────────────────────────────────

var LOG_HEADERS = [
  "ID", "Koas ID", "Appointment ID", "Tanggal",
  "Inisial Pasien", "Jenis Tindakan", "No. Gigi",
  "Diagnosis", "Treatment", "Pembimbing",
  "Tingkat Kompetensi", "Catatan", "Dibuat Pada"
];

function logRowToObj(row) {
  return {
    id:               String(row[LOG_COLS.ID - 1]),
    koasId:           String(row[LOG_COLS.KOAS_ID - 1]),
    appointmentId:    String(row[LOG_COLS.APPOINTMENT_ID - 1] || ""),
    date:             String(row[LOG_COLS.DATE - 1]),
    patientInitials:  String(row[LOG_COLS.PATIENT_INITIALS - 1]),
    procedureType:    String(row[LOG_COLS.PROCEDURE_TYPE - 1]),
    toothNumber:      String(row[LOG_COLS.TOOTH_NUMBER - 1] || ""),
    diagnosis:        String(row[LOG_COLS.DIAGNOSIS - 1]),
    treatment:        String(row[LOG_COLS.TREATMENT - 1]),
    supervisorName:   String(row[LOG_COLS.SUPERVISOR_NAME - 1]),
    competencyLevel:  String(row[LOG_COLS.COMPETENCY_LEVEL - 1]),
    notes:            String(row[LOG_COLS.NOTES - 1] || ""),
    createdAt:        String(row[LOG_COLS.CREATED_AT - 1]),
  };
}

function logCreate(ss, body) {
  var sheet = getOrCreateSheet(ss, SHEET_LOGBOOK, LOG_HEADERS);

  var id = generateId();
  var row = new Array(Object.keys(LOG_COLS).length).fill("");
  row[LOG_COLS.ID - 1]               = id;
  row[LOG_COLS.KOAS_ID - 1]          = body.koasId || "bunga";
  row[LOG_COLS.APPOINTMENT_ID - 1]   = body.appointmentId || "";
  row[LOG_COLS.DATE - 1]             = body.date || "";
  row[LOG_COLS.PATIENT_INITIALS - 1] = body.patientInitials || "";
  row[LOG_COLS.PROCEDURE_TYPE - 1]   = body.procedureType || "";
  row[LOG_COLS.TOOTH_NUMBER - 1]     = body.toothNumber || "";
  row[LOG_COLS.DIAGNOSIS - 1]        = body.diagnosis || "";
  row[LOG_COLS.TREATMENT - 1]        = body.treatment || "";
  row[LOG_COLS.SUPERVISOR_NAME - 1]  = body.supervisorName || "";
  row[LOG_COLS.COMPETENCY_LEVEL - 1] = body.competencyLevel || "observed";
  row[LOG_COLS.NOTES - 1]            = body.notes || "";
  row[LOG_COLS.CREATED_AT - 1]       = nowISO();

  sheet.appendRow(row);

  // Color-code by competency
  var compColors = { observed: "#FFF9F0", assisted: "#F0F4FF", performed: "#F0FFF4" };
  var color = compColors[body.competencyLevel] || "#FFFFFF";
  sheet.getRange(sheet.getLastRow(), 1, 1, Object.keys(LOG_COLS).length).setBackground(color);

  return logRowToObj(row);
}

function logList(ss, koasId) {
  var sheet = getOrCreateSheet(ss, SHEET_LOGBOOK, LOG_HEADERS);
  var rows = sheetData(sheet);
  var result = rows
    .filter(function(r) {
      if (r[0] === "") return false;
      if (koasId) return String(r[LOG_COLS.KOAS_ID - 1]) === koasId;
      return true;
    })
    .map(logRowToObj);
  result.sort(function(a, b) {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  return result;
}

function logDelete(ss, id) {
  var sheet = getOrCreateSheet(ss, SHEET_LOGBOOK, LOG_HEADERS);
  var found = findRowById(sheet, LOG_COLS.ID, id);
  if (!found) return { error: "Logbook entry tidak ditemukan" };
  sheet.deleteRow(found.row);
  return { success: true };
}

// ── SCHEDULES ─────────────────────────────────────────────────────────────────

var SCH_HEADERS = ["Koas ID", "Tanggal", "Slot Tersedia (JSON)", "Diperbarui Pada"];

function schRowToObj(row) {
  var slotsRaw = row[SCH_COLS.SLOTS - 1];
  var slots = [];
  try { slots = JSON.parse(String(slotsRaw)); } catch(e) { slots = []; }
  return {
    date:  String(row[SCH_COLS.DATE - 1]),
    slots: Array.isArray(slots) ? slots.sort() : [],
  };
}

function schFindRow(sheet, koasId, date) {
  var rows = sheetData(sheet);
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][SCH_COLS.KOAS_ID - 1]) === koasId &&
        String(rows[i][SCH_COLS.DATE - 1])    === date) {
      return { row: i + 2, data: rows[i] };
    }
  }
  return null;
}

function schSet(ss, koasId, date, slots) {
  var sheet = getOrCreateSheet(ss, SHEET_SCHEDULES, SCH_HEADERS);
  var found = schFindRow(sheet, koasId, date);
  var slotsJson = JSON.stringify(Array.isArray(slots) ? slots.sort() : []);

  if (found) {
    sheet.getRange(found.row, SCH_COLS.SLOTS).setValue(slotsJson);
    sheet.getRange(found.row, SCH_COLS.UPDATED_AT).setValue(nowISO());
  } else {
    var row = ["", "", "", ""];
    row[SCH_COLS.KOAS_ID - 1]    = koasId;
    row[SCH_COLS.DATE - 1]       = date;
    row[SCH_COLS.SLOTS - 1]      = slotsJson;
    row[SCH_COLS.UPDATED_AT - 1] = nowISO();
    sheet.appendRow(row);
  }
  return { success: true, date: date, slots: slots };
}

function schGet(ss, koasId, date) {
  var sheet = getOrCreateSheet(ss, SHEET_SCHEDULES, SCH_HEADERS);
  var found = schFindRow(sheet, koasId, date);
  if (!found) return { date: date, slots: [] };
  return schRowToObj(found.data);
}

function schGetWeek(ss, koasId, weekStart) {
  var results = [];
  var parts = weekStart.split("-").map(Number);
  var base = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
  for (var i = 0; i < 7; i++) {
    var d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i, 0, 0, 0, 0);
    var y = d.getFullYear();
    var mo = String(d.getMonth() + 1).padStart ? String(d.getMonth() + 1) : ("0" + (d.getMonth() + 1)).slice(-2);
    var dy = d.getDate() < 10 ? "0" + d.getDate() : String(d.getDate());
    mo = mo.length === 1 ? "0" + mo : mo;
    var dateStr = y + "-" + mo + "-" + dy;
    results.push(schGet(ss, koasId, dateStr));
  }
  return results;
}

function schRemoveSlot(ss, koasId, date, time) {
  var sheet = getOrCreateSheet(ss, SHEET_SCHEDULES, SCH_HEADERS);
  var found = schFindRow(sheet, koasId, date);
  if (!found) return { success: false };

  var schedule = schRowToObj(found.data);
  var idx = schedule.slots.indexOf(time);
  if (idx === -1) return { success: false };

  schedule.slots.splice(idx, 1);
  sheet.getRange(found.row, SCH_COLS.SLOTS).setValue(JSON.stringify(schedule.slots));
  sheet.getRange(found.row, SCH_COLS.UPDATED_AT).setValue(nowISO());
  return { success: true };
}

function schAddSlot(ss, koasId, date, time) {
  var sheet = getOrCreateSheet(ss, SHEET_SCHEDULES, SCH_HEADERS);
  var found = schFindRow(sheet, koasId, date);

  if (found) {
    var schedule = schRowToObj(found.data);
    if (schedule.slots.indexOf(time) === -1) {
      schedule.slots.push(time);
      schedule.slots.sort();
      sheet.getRange(found.row, SCH_COLS.SLOTS).setValue(JSON.stringify(schedule.slots));
      sheet.getRange(found.row, SCH_COLS.UPDATED_AT).setValue(nowISO());
    }
  } else {
    schSet(ss, koasId, date, [time]);
  }
  return { success: true };
}

// ── SEED DATA ─────────────────────────────────────────────────────────────────

function seedData(ss) {
  // Create sheets with headers
  getOrCreateSheet(ss, SHEET_APPOINTMENTS, APT_HEADERS);
  getOrCreateSheet(ss, SHEET_LOGBOOK, LOG_HEADERS);
  getOrCreateSheet(ss, SHEET_SCHEDULES, SCH_HEADERS);

  // Seed schedules: next 14 days (skip Sundays)
  var slots = ["09:00","09:30","10:00","10:30","11:00","13:00","13:30","14:00","14:30","15:00"];
  var today = new Date();
  for (var i = 0; i < 14; i++) {
    var d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i, 0, 0, 0, 0);
    if (d.getDay() === 0) continue; // skip Sunday
    var mo = d.getMonth() + 1;
    var dy = d.getDate();
    var dateStr = d.getFullYear() + "-" + (mo < 10 ? "0" + mo : mo) + "-" + (dy < 10 ? "0" + dy : dy);
    schSet(ss, "bunga", dateStr, slots);
  }

  // Seed 1 sample appointment
  var tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  var tom = tomorrow;
  var tmo = tom.getMonth() + 1;
  var tdy = tom.getDate();
  var tomorrowStr = tom.getFullYear() + "-" + (tmo < 10 ? "0" + tmo : tmo) + "-" + (tdy < 10 ? "0" + tdy : tdy);

  aptCreate(ss, {
    patientName: "Budi Santoso",
    patientPhone: "081234567890",
    patientEmail: "",
    koasId: "bunga",
    date: tomorrowStr,
    time: "09:00",
    complaint: "Gigi geraham kiri bawah berlubang dan sakit saat makan",
  });

  // Seed 1 sample logbook
  var yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  var ym = yesterday.getMonth() + 1;
  var yd = yesterday.getDate();
  var yesterdayStr = yesterday.getFullYear() + "-" + (ym < 10 ? "0" + ym : ym) + "-" + (yd < 10 ? "0" + yd : yd);

  logCreate(ss, {
    koasId: "bunga",
    appointmentId: "",
    date: yesterdayStr,
    patientInitials: "Tn. BS",
    procedureType: "Penambalan Komposit",
    toothNumber: "36",
    diagnosis: "Karies dentin",
    treatment: "Penambalan komposit kelas I",
    supervisorName: "drg. Hendra Wijaya, Sp.KG",
    competencyLevel: "performed",
    notes: "Pasien kooperatif",
  });

  return {
    success: true,
    message: "Data seed berhasil! Sheet Appointments, Logbook, dan Schedules telah dibuat.",
  };
}

