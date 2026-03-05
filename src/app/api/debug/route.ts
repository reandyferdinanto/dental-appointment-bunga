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
    GSHEET_API_URL_value: apiUrl ? apiUrl.substring(0, 80) + "..." : "(not set)",
    GSHEET_SECRET_set: !!secret,
    NEXTAUTH_SECRET_set: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "(not set)",
    NODE_ENV: process.env.NODE_ENV,
  };

  async function testAction(action: string, extra: Record<string, unknown> = {}) {
    const payload = JSON.stringify({ action, token: secret, ...extra });
    const url = `${apiUrl}?payload=${encodeURIComponent(payload)}`;
    const res = await fetch(url, { method: "GET", redirect: "follow" });
    const text = await res.text();
    try { return { status: res.status, data: JSON.parse(text) }; }
    catch { return { status: res.status, raw: text.substring(0, 300) }; }
  }

  if (apiUrl) {
    try {
      // 1. Health check
      const health = await fetch(apiUrl, { method: "GET", redirect: "follow" });
      status.health = await health.json();

      // 2. sch_get for the exact date in the sheet
      status.sch_get_0306 = await testAction("sch_get", { koasId: "bunga", date: "2026-03-06" });

      // 3. sch_get_week starting Mon 2026-03-02
      status.sch_get_week_0302 = await testAction("sch_get_week", { koasId: "bunga", weekStart: "2026-03-02" });

      // 4. sch_get_week starting Mon 2026-03-09 (current week)
      status.sch_get_week_0309 = await testAction("sch_get_week", { koasId: "bunga", weekStart: "2026-03-09" });

      // 5. apt_list
      status.apt_list = await testAction("apt_list");

      // 6. log_list
      status.log_list = await testAction("log_list", { koasId: "bunga" });

    } catch (e) {
      status.error = String(e);
    }
  }

  return NextResponse.json(status, { headers: { "Cache-Control": "no-store" } });
}
