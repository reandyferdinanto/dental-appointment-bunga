import { NextRequest, NextResponse } from "next/server";
import { getSchedule, getWeekSchedules, setSchedule } from "@/lib/db/schedules";
import { scheduleSchema } from "@/lib/validators";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const week = searchParams.get("week");

    if (week) {
      // Parse the week start date
      const [y, m, d] = week.split("-").map(Number);
      const startDate = new Date(y, m - 1, d);
      const data = await getWeekSchedules(startDate);
      return NextResponse.json(Array.isArray(data) ? data : [], {
        headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
      });
    }

    if (date) {
      const schedule = await getSchedule(date);
      return NextResponse.json(schedule, {
        headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
      });
    }

    // Default: current week starting Monday
    const today = new Date();
    const day = today.getDay();
    const mon = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (day === 0 ? 6 : day - 1), 0, 0, 0, 0);
    const data = await getWeekSchedules(mon);
    return NextResponse.json(Array.isArray(data) ? data : [], {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
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

    await setSchedule(parsed.data.date, parsed.data.slots);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal menyimpan jadwal" }, { status: 500 });
  }
}
