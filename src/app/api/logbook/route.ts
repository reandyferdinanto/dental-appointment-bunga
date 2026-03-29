import { NextRequest, NextResponse } from "next/server";
import { listLogbookEntries, createLogbookEntry } from "@/lib/db/logbook";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await listLogbookEntries("bunga");
    return NextResponse.json(data ?? [], {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memuat logbook" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const result = await createLogbookEntry(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal simpan logbook" }, { status: 500 });
  }
}
