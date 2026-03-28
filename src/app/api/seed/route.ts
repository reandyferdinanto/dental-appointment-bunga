import { NextResponse } from "next/server";
import { gsheet } from "@/lib/gsheet";
import { getDb, COLLECTIONS } from "@/lib/mongodb";

export async function POST() {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_SEED) {
    return NextResponse.json({ error: "Not allowed in production. Set ALLOW_SEED=1 to enable." }, { status: 403 });
  }
  try {
    // Seed to both MongoDB and Google Sheets
    const result = await gsheet.call("seed");

    // Also seed initial data to MongoDB if empty
    const db = await getDb();
    const aptCount = await db.collection(COLLECTIONS.appointments).countDocuments();
    if (aptCount === 0) {
      // If GSheet seed returned data, try to import it to MongoDB
      console.log("[seed] MongoDB collections are empty. You may need to run /api/sync to import GSheet data.");
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal seed data" }, { status: 500 });
  }
}
