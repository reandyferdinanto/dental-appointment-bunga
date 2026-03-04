import { NextRequest, NextResponse } from "next/server";
import { gsheet } from "@/lib/gsheet";

export async function GET() {
  try {
    const data = await gsheet.call("apt_list");
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memuat appointments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await gsheet.call("apt_create", body);
    if (result && typeof result === "object" && "error" in result) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal membuat appointment" }, { status: 500 });
  }
}
