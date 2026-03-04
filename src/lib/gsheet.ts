/**
 * lib/gsheet.ts — Google Sheets Database Client
 * Replaces Redis. All calls go to the Apps Script Web App.
 *
 * Required env vars:
 *   GSHEET_API_URL  — Web App URL dari Apps Script deployment
 *   GSHEET_SECRET   — Token rahasia (sama dengan SECRET_TOKEN di Code.gs)
 */

const API_URL = process.env.GSHEET_API_URL ?? "";
const SECRET  = process.env.GSHEET_SECRET  ?? "";

class GSheetDB {
  /** POST to the Apps Script Web App endpoint */
  async call(action: string, body: Record<string, unknown> = {}): Promise<unknown> {
    if (!API_URL) {
      console.warn("[gsheet] GSHEET_API_URL not set — data tidak akan tersimpan");
      return null;
    }
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, token: SECRET, ...body }),
      redirect: "follow", // Apps Script 302-redirects POST
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

