import { NextRequest, NextResponse } from "next/server";
import { listAppointments, createAppointment } from "@/lib/db/appointments";

export async function GET() {
  try {
    const data = await listAppointments();
    return NextResponse.json(data ?? [], {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memuat appointments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await createAppointment(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(error);
    const msg = error instanceof Error ? error.message : "Gagal membuat appointment";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
