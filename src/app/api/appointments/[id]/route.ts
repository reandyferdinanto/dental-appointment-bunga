import { NextRequest, NextResponse } from "next/server";
import { getAppointment, updateAppointmentStatus, deleteAppointment } from "@/lib/db/appointments";
import { auth } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const appointment = await getAppointment(id);
    if (!appointment) {
      return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(appointment);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    const updated = await updateAppointmentStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal update" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const deleted = await deleteAppointment(id);
    if (!deleted) {
      return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal hapus" }, { status: 500 });
  }
}

