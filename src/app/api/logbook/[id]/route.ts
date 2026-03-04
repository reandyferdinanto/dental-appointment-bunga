import { NextRequest, NextResponse } from "next/server";
import { getLogbookEntry, updateLogbookEntry, deleteLogbookEntry } from "@/lib/db/logbook";
import { auth } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const entry = await getLogbookEntry(id);
    if (!entry) {
      return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(entry);
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
    const updated = await updateLogbookEntry(id, body);
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
    const deleted = await deleteLogbookEntry(id);
    if (!deleted) {
      return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal hapus" }, { status: 500 });
  }
}

