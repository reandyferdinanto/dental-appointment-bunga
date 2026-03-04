import { NextRequest, NextResponse } from "next/server";
import { getSchedule, setSchedule, getWeekSchedules } from "@/lib/db/schedules";
import { scheduleSchema } from "@/lib/validators";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const week = searchParams.get("week");

    if (week) {
      const startDate = new Date(week);
      const schedules = await getWeekSchedules(startDate);
      return NextResponse.json(schedules);
    }

    if (date) {
      const schedule = await getSchedule(date);
      return NextResponse.json(schedule);
    }

    // Default: get current week
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    const schedules = await getWeekSchedules(monday);
    return NextResponse.json(schedules);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memuat jadwal" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = scheduleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await setSchedule(parsed.data.date, parsed.data.slots);
    const schedule = await getSchedule(parsed.data.date);
    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal menyimpan jadwal" }, { status: 500 });
  }
}

