import { NextRequest, NextResponse } from "next/server";
import { createAppointment, listAppointments } from "@/lib/db/appointments";
import { appointmentSchema } from "@/lib/validators";

export async function GET() {
  try {
    const appointments = await listAppointments();
    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error listing appointments:", error);
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = appointmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const appointment = await createAppointment(parsed.data);
    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal membuat janji";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

