/**
 * GET /api/debug
 * Returns current env var status and tests the GSheet connection.
 * Remove this file after setup is confirmed working.
 */
import { NextResponse } from "next/server";

export async function GET() {
  const apiUrl = process.env.GSHEET_API_URL ?? "";
  const secret = process.env.GSHEET_SECRET  ?? "";

  const status: Record<string, unknown> = {
    GSHEET_API_URL_set: !!apiUrl,
    GSHEET_API_URL_value: apiUrl ? apiUrl.substring(0, 60) + "..." : "(not set)",
    GSHEET_SECRET_set: !!secret,
    NEXTAUTH_SECRET_set: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "(not set)",
    NODE_ENV: process.env.NODE_ENV,
  };

  // If URL is set, test the connection
  if (apiUrl) {
    try {
      const payload = JSON.stringify({ action: "sch_get_week", token: secret, koasId: "bunga", weekStart: "2026-03-02" });
      const url = `${apiUrl}?payload=${encodeURIComponent(payload)}`;
      const res = await fetch(url, { method: "GET", redirect: "follow" });
      const text = await res.text();
      let parsed: unknown;
      try { parsed = JSON.parse(text); } catch { parsed = text.substring(0, 200); }
      status.gsheet_test_status   = res.status;
      status.gsheet_test_response = parsed;
    } catch (e) {
      status.gsheet_test_error = String(e);
    }
  }

  return NextResponse.json(status);
}

