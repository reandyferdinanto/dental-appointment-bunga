import { NextRequest, NextResponse } from "next/server";
import { gsheet } from "@/lib/gsheet";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const data = await gsheet.call("log_list", { koasId: "bunga" });
    return NextResponse.json(data ?? [], {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
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
    const result = await gsheet.call("log_create", body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal simpan logbook" }, { status: 500 });
  }
}

