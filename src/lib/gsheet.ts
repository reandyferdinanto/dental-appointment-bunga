/**
 * lib/gsheet.ts — Google Sheets Database Client
 *
 * ⚠️  Apps Script Web Apps redirect POST → GET (302), which drops the body.
 *     We work around this by encoding the full JSON payload as a `payload`
 *     query-string parameter on a GET request — Apps Script receives it via
 *     e.parameter.payload in doGet(), no body loss.
 *
 * Required env vars:
 *   GSHEET_API_URL  — Web App URL dari Apps Script deployment
 *   GSHEET_SECRET   — Token rahasia (sama dengan SECRET_TOKEN di Code.gs)
 */

const API_URL = process.env.GSHEET_API_URL ?? "";
const SECRET  = process.env.GSHEET_SECRET  ?? "";

class GSheetDB {
  async call(action: string, body: Record<string, unknown> = {}): Promise<unknown> {
    if (!API_URL) {
      console.warn("[gsheet] GSHEET_API_URL not set — data tidak akan tersimpan");
      return null;
    }

    // Encode the full payload as a query param to survive the Apps Script redirect
    const payload = JSON.stringify({ action, token: SECRET, ...body });
    const url = `${API_URL}?payload=${encodeURIComponent(payload)}`;

    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GSheet API error ${res.status}: ${text}`);
    }
    return res.json();
  }
}

export const gsheet = new GSheetDB();

if (!API_URL && process.env.NODE_ENV !== "test") {
  console.warn("[gsheet] GSHEET_API_URL tidak di-set. Data tidak akan persist.");
}
