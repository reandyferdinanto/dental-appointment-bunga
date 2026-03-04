import { NextRequest, NextResponse } from "next/server";
import { createLogbookEntry, listLogbookEntries } from "@/lib/db/logbook";
import { logbookSchema } from "@/lib/validators";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entries = await listLogbookEntries("bunga");
    return NextResponse.json(entries);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memuat logbook" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = logbookSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const entry = await createLogbookEntry(parsed.data);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal menyimpan logbook" }, { status: 500 });
  }
}

