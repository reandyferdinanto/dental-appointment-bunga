import { NextRequest, NextResponse } from "next/server";
import { gsheet } from "@/lib/gsheet";
import { scheduleSchema } from "@/lib/validators";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const week = searchParams.get("week");

    if (week) {
      const data = await gsheet.call("sch_get_week", { koasId: "bunga", weekStart: week });
      return NextResponse.json(Array.isArray(data) ? data : []);
    }

    if (date) {
      const data = await gsheet.call("sch_get", { koasId: "bunga", date });
      const schedule = (data && typeof data === "object" && !Array.isArray(data)) ? data : { date, slots: [] };
      return NextResponse.json(schedule);
    }

    // Default: current week starting Monday
    const today = new Date();
    const day = today.getDay();
    const mon = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (day === 0 ? 6 : day - 1), 0, 0, 0, 0);
    const y = mon.getFullYear();
    const m = String(mon.getMonth() + 1).padStart(2, "0");
    const d = String(mon.getDate()).padStart(2, "0");
    const data = await gsheet.call("sch_get_week", { koasId: "bunga", weekStart: `${y}-${m}-${d}` });
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memuat jadwal" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = scheduleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak valid", details: parsed.error.flatten() }, { status: 400 });
    }

    const result = await gsheet.call("sch_set", {
      koasId: "bunga",
      date: parsed.data.date,
      slots: parsed.data.slots,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal menyimpan jadwal" }, { status: 500 });
  }
}
