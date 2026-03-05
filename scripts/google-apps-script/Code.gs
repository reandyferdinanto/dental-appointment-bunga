/**
 * ============================================================
 *  drg. Natasya Bunga Maureen — Google Apps Script Database
 *  Deploy: Web App → Execute as: Me → Who has access: Anyone
 * ============================================================
 */

// ── CONFIG ────────────────────────────────────────────────────────────────────
var SPREADSHEET_ID = "1q1CUP-MoY_ZcJHP3nGtNkODW29bY8MnG12RBHXdtRD4";
var SECRET_TOKEN   = "bunga-secret-2024";

var SHEET_APPOINTMENTS = "Appointments";
var SHEET_LOGBOOK      = "Logbook";
var SHEET_SCHEDULES    = "Schedules";

// ── COLUMN DEFINITIONS ───────────────────────────────────────────────────────

var APT_COLS = {
  ID: 1, PATIENT_NAME: 2, PATIENT_PHONE: 3, PATIENT_EMAIL: 4,
  KOAS_ID: 5, DATE: 6, TIME: 7, COMPLAINT: 8,
  STATUS: 9, NOTES: 10, CREATED_AT: 11,
};

var LOG_COLS = {
  ID: 1, KOAS_ID: 2, APPOINTMENT_ID: 3, DATE: 4,
  PATIENT_INITIALS: 5, PROCEDURE_TYPE: 6, TOOTH_NUMBER: 7,
  DIAGNOSIS: 8, TREATMENT: 9, SUPERVISOR_NAME: 10,
  COMPETENCY_LEVEL: 11, NOTES: 12, CREATED_AT: 13,
};

var SCH_COLS = { KOAS_ID: 1, DATE: 2, SLOTS: 3, UPDATED_AT: 4 };

// ── ENTRY POINT ───────────────────────────────────────────────────────────────

function doGet(e) {
  try {
    var rawPayload = (e && e.parameter && e.parameter.payload) ? e.parameter.payload : null;
    if (!rawPayload) {
      return jsonResponse({ status: "ok", app: "drg-bunga-db", version: "2.0" });
    }
    var body   = JSON.parse(rawPayload);
    var token  = body.token  || "";
    var action = body.action || "";

    if (SECRET_TOKEN && token !== SECRET_TOKEN) return jsonResponse({ error: "Unauthorized" });

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    if (action === "apt_create")        return jsonResponse(aptCreate(ss, body));
    if (action === "apt_list")          return jsonResponse(aptList(ss));
    if (action === "apt_get")           return jsonResponse(aptGet(ss, body.id));
    if (action === "apt_update_status") return jsonResponse(aptUpdateStatus(ss, body.id, body.status));
    if (action === "apt_delete")        return jsonResponse(aptDelete(ss, body.id));
    if (action === "log_create")        return jsonResponse(logCreate(ss, body));
    if (action === "log_list")          return jsonResponse(logList(ss, body.koasId));
    if (action === "log_delete")        return jsonResponse(logDelete(ss, body.id));
    if (action === "sch_set")           return jsonResponse(schSet(ss, body.koasId, body.date, body.slots));
    if (action === "sch_get")           return jsonResponse(schGet(ss, body.koasId, body.date));
    if (action === "sch_get_week")      return jsonResponse(schGetWeek(ss, body.koasId, body.weekStart));
    if (action === "sch_remove_slot")   return jsonResponse(schRemoveSlot(ss, body.koasId, body.date, body.time));
    if (action === "settings_get")      return jsonResponse(settingsGet(ss));
    if (action === "settings_set")      return jsonResponse(settingsSet(ss, body));
    if (action === "admin_list")        return jsonResponse(adminList(ss));
    if (action === "admin_create")      return jsonResponse(adminCreate(ss, body));
    if (action === "admin_update_password") return jsonResponse(adminUpdatePassword(ss, body.id, body.passwordHash));
    if (action === "admin_update")      return jsonResponse(adminUpdate(ss, body));
    if (action === "admin_delete")      return jsonResponse(adminDelete(ss, body.id));
    if (action === "seed")              return jsonResponse(seedData(ss));

    return jsonResponse({ error: "Unknown action: " + action });
  } catch (err) {
    return jsonResponse({ error: err.toString() });
  }
}

function doPost(e) {
  try {
    e.parameter         = e.parameter || {};
    e.parameter.payload = e.postData.contents;
    return doGet(e);
  } catch (err) {
    return jsonResponse({ error: err.toString() });
  }
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function generateId() { return Utilities.getUuid().replace(/-/g, "").substring(0, 16); }
function nowISO()     { return new Date().toISOString(); }
function pad2(n)      { return n < 10 ? "0" + n : "" + n; }
function fmtDate(d)   { return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#5D688A").setFontColor("#FFFFFF");
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
    if (String(data[i][idCol - 1]) === String(id)) return { row: i + 2, data: data[i] };
  }
  return null;
}

// ── APPOINTMENTS ──────────────────────────────────────────────────────────────

var APT_HEADERS = ["ID","Nama Pasien","No. HP","Email","Koas ID","Tanggal","Jam","Keluhan","Status","Catatan Dokter","Dibuat Pada"];

function aptRowToObj(row) {
  return {
    id: String(row[0]), patientName: String(row[1]), patientPhone: String(row[2]),
    patientEmail: String(row[3] || ""), koasId: String(row[4]),
    date: String(row[5]), time: String(row[6]), complaint: String(row[7]),
    status: String(row[8]), notes: String(row[9] || ""), createdAt: String(row[10]),
  };
}

function aptCreate(ss, body) {
  var sheet = getOrCreateSheet(ss, SHEET_APPOINTMENTS, APT_HEADERS);
  var slotRemoved = schRemoveSlot(ss, body.koasId || "bunga", body.date, body.time);
  if (!slotRemoved.success) return { error: "Slot sudah tidak tersedia" };

  var id  = generateId();
  var row = [id, body.patientName||"", body.patientPhone||"", body.patientEmail||"",
             body.koasId||"bunga", body.date||"", body.time||"", body.complaint||"",
             "pending", "", nowISO()];
  sheet.appendRow(row);
  aptColorRow(sheet, sheet.getLastRow(), "pending");
  return aptRowToObj(row);
}

function aptList(ss) {
  var sheet  = getOrCreateSheet(ss, SHEET_APPOINTMENTS, APT_HEADERS);
  var result = sheetData(sheet).filter(function(r) { return r[0] !== ""; }).map(aptRowToObj);
  result.sort(function(a, b) { return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); });
  return result;
}

function aptGet(ss, id) {
  var sheet = getOrCreateSheet(ss, SHEET_APPOINTMENTS, APT_HEADERS);
  var found = findRowById(sheet, 1, id);
  return found ? aptRowToObj(found.data) : null;
}

function aptUpdateStatus(ss, id, newStatus) {
  var sheet = getOrCreateSheet(ss, SHEET_APPOINTMENTS, APT_HEADERS);
  var found = findRowById(sheet, 1, id);
  if (!found) return { error: "Appointment tidak ditemukan" };
  sheet.getRange(found.row, APT_COLS.STATUS).setValue(newStatus);
  if (newStatus === "cancelled") schAddSlot(ss, aptRowToObj(found.data).koasId, aptRowToObj(found.data).date, aptRowToObj(found.data).time);
  aptColorRow(sheet, found.row, newStatus);
  return aptRowToObj(sheet.getRange(found.row, 1, 1, 11).getValues()[0]);
}

function aptDelete(ss, id) {
  var sheet = getOrCreateSheet(ss, SHEET_APPOINTMENTS, APT_HEADERS);
  var found = findRowById(sheet, 1, id);
  if (!found) return { error: "Appointment tidak ditemukan" };
  var apt = aptRowToObj(found.data);
  schAddSlot(ss, apt.koasId, apt.date, apt.time);
  sheet.deleteRow(found.row);
  return { success: true };
}

function aptColorRow(sheet, rowNum, status) {
  var colors = { pending: "#FFF9F0", confirmed: "#F0FFF4", completed: "#F0F4FF", cancelled: "#FFF0F0" };
  sheet.getRange(rowNum, 1, 1, 11).setBackground(colors[status] || "#FFFFFF");
}

// ── LOGBOOK ───────────────────────────────────────────────────────────────────

var LOG_HEADERS = ["ID","Koas ID","Appointment ID","Tanggal","Inisial Pasien","Jenis Tindakan","No. Gigi","Diagnosis","Treatment","Pembimbing","Tingkat Kompetensi","Catatan","Dibuat Pada"];

function logRowToObj(row) {
  return {
    id: String(row[0]), koasId: String(row[1]), appointmentId: String(row[2]||""),
    date: String(row[3]), patientInitials: String(row[4]), procedureType: String(row[5]),
    toothNumber: String(row[6]||""), diagnosis: String(row[7]), treatment: String(row[8]),
    supervisorName: String(row[9]), competencyLevel: String(row[10]),
    notes: String(row[11]||""), createdAt: String(row[12]),
  };
}

function logCreate(ss, body) {
  var sheet = getOrCreateSheet(ss, SHEET_LOGBOOK, LOG_HEADERS);
  var id    = generateId();
  var row   = [id, body.koasId||"bunga", body.appointmentId||"", body.date||"",
               body.patientInitials||"", body.procedureType||"", body.toothNumber||"",
               body.diagnosis||"", body.treatment||"", body.supervisorName||"",
               body.competencyLevel||"observed", body.notes||"", nowISO()];
  sheet.appendRow(row);
  var compColors = { observed: "#FFF9F0", assisted: "#F0F4FF", performed: "#F0FFF4" };
  sheet.getRange(sheet.getLastRow(), 1, 1, 13).setBackground(compColors[body.competencyLevel] || "#FFFFFF");
  return logRowToObj(row);
}

function logList(ss, koasId) {
  var sheet  = getOrCreateSheet(ss, SHEET_LOGBOOK, LOG_HEADERS);
  var result = sheetData(sheet)
    .filter(function(r) { return r[0] !== "" && (koasId ? String(r[1]) === koasId : true); })
    .map(logRowToObj);
  result.sort(function(a, b) { return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); });
  return result;
}

function logDelete(ss, id) {
  var sheet = getOrCreateSheet(ss, SHEET_LOGBOOK, LOG_HEADERS);
  var found = findRowById(sheet, 1, id);
  if (!found) return { error: "Logbook entry tidak ditemukan" };
  sheet.deleteRow(found.row);
  return { success: true };
}

// ── SCHEDULES ─────────────────────────────────────────────────────────────────

var SCH_HEADERS = ["Koas ID","Tanggal","Slot Tersedia (JSON)","Diperbarui Pada"];

function cellToDateStr(val) {
  // Google Sheets may store date cells as Date objects, not strings.
  // Convert to YYYY-MM-DD regardless of the stored type.
  if (!val) return "";
  if (val instanceof Date) {
    return fmtDate(val);
  }
  var s = String(val).trim();
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // Try parsing other formats
  var d = new Date(s);
  if (!isNaN(d.getTime())) return fmtDate(d);
  return s;
}

function schRowToObj(row) {
  var slots = [];
  try { slots = JSON.parse(String(row[2])); } catch(e) { slots = []; }
  return { date: cellToDateStr(row[1]), slots: Array.isArray(slots) ? slots.sort() : [] };
}

function schFindRow(sheet, koasId, date) {
  var rows = sheetData(sheet);
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][0]) === koasId && cellToDateStr(rows[i][1]) === date) return { row: i + 2, data: rows[i] };
  }
  return null;
}

function schSet(ss, koasId, date, slots) {
  var sheet     = getOrCreateSheet(ss, SHEET_SCHEDULES, SCH_HEADERS);
  var found     = schFindRow(sheet, koasId, date);
  var slotsJson = JSON.stringify(Array.isArray(slots) ? slots.sort() : []);
  if (found) {
    sheet.getRange(found.row, 3).setValue(slotsJson);
    sheet.getRange(found.row, 4).setValue(nowISO());
  } else {
    sheet.appendRow([koasId, date, slotsJson, nowISO()]);
    // Force date cell to plain text to prevent auto Date conversion
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 2).setNumberFormat("@");
    sheet.getRange(lastRow, 2).setValue(date);
  }
  return { success: true, date: date, slots: slots };
}

function schGet(ss, koasId, date) {
  var sheet = getOrCreateSheet(ss, SHEET_SCHEDULES, SCH_HEADERS);
  var found = schFindRow(sheet, koasId, date);
  return found ? schRowToObj(found.data) : { date: date, slots: [] };
}

function schGetWeek(ss, koasId, weekStart) {
  var parts   = weekStart.split("-");
  var base    = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 0, 0, 0, 0);
  var results = [];
  for (var i = 0; i < 7; i++) {
    var d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i, 0, 0, 0, 0);
    results.push(schGet(ss, koasId, fmtDate(d)));
  }
  return results;
}

function schRemoveSlot(ss, koasId, date, time) {
  var sheet    = getOrCreateSheet(ss, SHEET_SCHEDULES, SCH_HEADERS);
  var found    = schFindRow(sheet, koasId, date);
  if (!found) return { success: false };
  var schedule = schRowToObj(found.data);
  var idx      = schedule.slots.indexOf(time);
  if (idx === -1) return { success: false };
  schedule.slots.splice(idx, 1);
  sheet.getRange(found.row, 3).setValue(JSON.stringify(schedule.slots));
  sheet.getRange(found.row, 4).setValue(nowISO());
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
      sheet.getRange(found.row, 3).setValue(JSON.stringify(schedule.slots));
      sheet.getRange(found.row, 4).setValue(nowISO());
    }
  } else {
    schSet(ss, koasId, date, [time]);
  }
  return { success: true };
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────

var SHEET_SETTINGS = "Settings";

function settingsGet(ss) {
  var sheet = ss.getSheetByName(SHEET_SETTINGS);
  if (!sheet) return { error: "Settings not found" };
  var data = sheetData(sheet);
  var result = {};
  for (var i = 0; i < data.length; i++) {
    var key = String(data[i][0]);
    var val = data[i][1];
    if (key) result[key] = val;
  }
  // Parse services JSON
  if (result.services && typeof result.services === "string") {
    try { result.services = JSON.parse(result.services); } catch(e) { result.services = []; }
  }
  // Parse numeric
  if (result.slotDurationMinutes) result.slotDurationMinutes = parseInt(result.slotDurationMinutes);
  return result;
}

function settingsSet(ss, body) {
  var sheet = ss.getSheetByName(SHEET_SETTINGS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_SETTINGS);
    sheet.getRange(1,1,1,2).setValues([["Key","Value"]]);
    sheet.getRange(1,1,1,2).setFontWeight("bold").setBackground("#5D688A").setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
  }

  var keys = ["clinicName","doctorName","phone","whatsapp","email","address",
              "slotDurationMinutes","workHourStart","workHourEnd","breakStart","breakEnd",
              "services","instagramUrl","lineId","announcement"];

  // Load existing rows
  var existing = {};
  var rows = sheetData(sheet);
  for (var i = 0; i < rows.length; i++) {
    existing[String(rows[i][0])] = i + 2; // row number
  }

  for (var k = 0; k < keys.length; k++) {
    var key = keys[k];
    if (!(key in body)) continue;
    var value = body[key];
    if (Array.isArray(value)) value = JSON.stringify(value);
    if (existing[key]) {
      sheet.getRange(existing[key], 2).setValue(value);
    } else {
      sheet.appendRow([key, value]);
      existing[key] = sheet.getLastRow();
    }
  }
  return { success: true };
}

// ── ADMINS ────────────────────────────────────────────────────────────────────

var SHEET_ADMINS   = "Admins";
var ADM_HEADERS    = ["ID","Nama","Email","Password Hash","Role","Dibuat Pada"];
var ADM_COLS       = { ID:1, NAME:2, EMAIL:3, PASSWORD_HASH:4, ROLE:5, CREATED_AT:6 };

function admRowToObj(row) {
  return {
    id:           String(row[0]),
    name:         String(row[1]),
    email:        String(row[2]),
    passwordHash: String(row[3]),
    role:         String(row[4] || "admin"),
    createdAt:    String(row[5] || ""),
  };
}

function adminList(ss) {
  var sheet = getOrCreateSheet(ss, SHEET_ADMINS, ADM_HEADERS);
  return sheetData(sheet)
    .filter(function(r){ return r[0] !== ""; })
    .map(admRowToObj);
}

function adminCreate(ss, body) {
  var sheet = getOrCreateSheet(ss, SHEET_ADMINS, ADM_HEADERS);
  // Check duplicate email
  var existing = sheetData(sheet).filter(function(r){ return String(r[2]).toLowerCase() === String(body.email||"").toLowerCase(); });
  if (existing.length > 0) return { error: "Email sudah terdaftar" };
  var id  = generateId();
  var row = [id, body.name||"", body.email||"", body.passwordHash||"", body.role||"admin", nowISO()];
  sheet.appendRow(row);
  return admRowToObj(row);
}

function adminUpdatePassword(ss, id, passwordHash) {
  var sheet = getOrCreateSheet(ss, SHEET_ADMINS, ADM_HEADERS);
  var found = findRowById(sheet, 1, id);
  if (!found) return { error: "Admin tidak ditemukan" };
  sheet.getRange(found.row, ADM_COLS.PASSWORD_HASH).setValue(passwordHash);
  return { success: true };
}

function adminUpdate(ss, body) {
  var sheet = getOrCreateSheet(ss, SHEET_ADMINS, ADM_HEADERS);
  var found = findRowById(sheet, 1, body.id);
  if (!found) return { error: "Admin tidak ditemukan" };
  if (body.name)  sheet.getRange(found.row, ADM_COLS.NAME).setValue(body.name);
  if (body.email) sheet.getRange(found.row, ADM_COLS.EMAIL).setValue(body.email);
  return { success: true };
}

function adminDelete(ss, id) {
  var sheet = getOrCreateSheet(ss, SHEET_ADMINS, ADM_HEADERS);
  var found = findRowById(sheet, 1, id);
  if (!found) return { error: "Admin tidak ditemukan" };
  sheet.deleteRow(found.row);
  return { success: true };
}

// ── SEED DATA ─────────────────────────────────────────────────────────────────

function seedData(ss) {
  getOrCreateSheet(ss, SHEET_APPOINTMENTS, APT_HEADERS);
  getOrCreateSheet(ss, SHEET_LOGBOOK,      LOG_HEADERS);
  getOrCreateSheet(ss, SHEET_SCHEDULES,    SCH_HEADERS);

  var defaultSlots = ["09:00","09:30","10:00","10:30","11:00","13:00","13:30","14:00","14:30","15:00"];
  var today        = new Date();

  for (var i = 0; i < 14; i++) {
    var d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i, 0, 0, 0, 0);
    if (d.getDay() === 0) continue;
    schSet(ss, "bunga", fmtDate(d), defaultSlots);
  }

  var tomorrow  = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  var yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

  aptCreate(ss, {
    patientName: "Budi Santoso", patientPhone: "081234567890", patientEmail: "",
    koasId: "bunga", date: fmtDate(tomorrow), time: "09:30",
    complaint: "Gigi geraham kiri bawah berlubang dan sakit saat makan",
  });

  logCreate(ss, {
    koasId: "bunga", appointmentId: "", date: fmtDate(yesterday),
    patientInitials: "Tn. BS", procedureType: "Penambalan Komposit", toothNumber: "36",
    diagnosis: "Karies dentin", treatment: "Penambalan komposit kelas I",
    supervisorName: "drg. Hendra Wijaya, Sp.KG", competencyLevel: "performed",
    notes: "Pasien kooperatif",
  });

  return { success: true, message: "Seed berhasil! Sheets dibuat dengan data awal." };
}
