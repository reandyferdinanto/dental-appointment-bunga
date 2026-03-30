import { NextRequest, NextResponse } from "next/server";
import { listAppointments, createAppointment } from "@/lib/db/appointments";
import { auth } from "@/lib/auth";
import { appointmentSchema, validateSchema } from "@/lib/validators";
import { applyRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await listAppointments();
    return NextResponse.json(data ?? [], {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memuat appointments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateLimit = applyRateLimit({
      key: `appointments:create:${ip}`,
      limit: 6,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan booking. Coba lagi beberapa menit lagi." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const body = await req.json();
    const parsed = await validateSchema(appointmentSchema, body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data booking tidak valid", details: parsed.errors },
        {
          status: 400,
          headers: {
            "X-RateLimit-Remaining": String(rateLimit.remaining),
          },
        }
      );
    }

    const result = await createAppointment(parsed.data);
    return NextResponse.json(result, {
      status: 201,
      headers: {
        "X-RateLimit-Remaining": String(rateLimit.remaining),
      },
    });
  } catch (error) {
    console.error(error);
    const msg = error instanceof Error ? error.message : "Gagal membuat appointment";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
