import { NextRequest, NextResponse } from "next/server";
import { listLogbookEntries, createLogbookEntry } from "@/lib/db/logbook";
import { auth } from "@/lib/auth";
import { logbookSchema, validateSchema } from "@/lib/validators";

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
    const parsed = await validateSchema(logbookSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.message, details: parsed.errors }, { status: 400 });
    }

    const result = await createLogbookEntry(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal simpan logbook" }, { status: 500 });
  }
}
