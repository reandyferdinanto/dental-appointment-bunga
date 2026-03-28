/**
 * GET /api/debug
 * Returns current env var status and tests both GSheet and MongoDB connections.
 */
import { NextResponse } from "next/server";
import { getDb, COLLECTIONS } from "@/lib/mongodb";

export async function GET() {
  const apiUrl = process.env.GSHEET_API_URL ?? "";
  const secret = process.env.GSHEET_SECRET ?? "";
  const mongoUri = process.env.MONGODB_URI ?? "";

  const status: Record<string, unknown> = {
    GSHEET_API_URL_set: !!apiUrl,
    GSHEET_API_URL_value: apiUrl ? apiUrl.substring(0, 80) + "..." : "(not set)",
    GSHEET_SECRET_set: !!secret,
    MONGODB_URI_set: !!mongoUri,
    NEXTAUTH_SECRET_set: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "(not set)",
    NODE_ENV: process.env.NODE_ENV,
  };

  // Test MongoDB connection
  try {
    const db = await getDb();
    const collections = await db.listCollections().toArray();
    const counts: Record<string, number> = {};
    for (const col of [COLLECTIONS.appointments, COLLECTIONS.logbook, COLLECTIONS.schedules, COLLECTIONS.settings, COLLECTIONS.admins]) {
      counts[col] = await db.collection(col).countDocuments();
    }
    status.mongodb = {
      connected: true,
      database: db.databaseName,
      collections: collections.map(c => c.name),
      documentCounts: counts,
    };
  } catch (e) {
    status.mongodb = { connected: false, error: String(e) };
  }

  // Test GSheet connection
  if (apiUrl) {
    try {
      const health = await fetch(apiUrl, { method: "GET", redirect: "follow" });
      status.gsheet_health = await health.json();
    } catch (e) {
      status.gsheet_health = { error: String(e) };
    }
  }

  return NextResponse.json(status, { headers: { "Cache-Control": "no-store" } });
}
