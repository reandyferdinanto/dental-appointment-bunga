import { NextRequest, NextResponse } from "next/server";
import { getAppointment, updateAppointmentStatus, deleteAppointment } from "@/lib/db/appointments";
import { auth } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await getAppointment(id);
    if (!data) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { status } = await req.json();

    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    const updated = await updateAppointmentStatus(id, status);
    if (!updated) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal update" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const success = await deleteAppointment(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal hapus" }, { status: 500 });
  }
}
