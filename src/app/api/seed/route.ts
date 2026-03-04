import { NextResponse } from "next/server";
import { gsheet } from "@/lib/gsheet";

export async function POST() {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_SEED) {
    return NextResponse.json({ error: "Not allowed in production. Set ALLOW_SEED=1 to enable." }, { status: 403 });
  }
  try {
    const result = await gsheet.call("seed");
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal seed data" }, { status: 500 });
  }
}
