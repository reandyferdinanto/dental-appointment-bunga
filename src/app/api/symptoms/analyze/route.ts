import { NextRequest, NextResponse } from "next/server";
import { analyzeDentalSymptoms, AiProviderError } from "@/lib/ai/gemini";
import { applyRateLimit, getClientIp } from "@/lib/rate-limit";
import { symptomAnalysisSchema, validateSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limiter = applyRateLimit({
    key: `symptoms:${ip}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi beberapa menit lagi." },
      {
        status: 429,
        headers: {
          "Retry-After": String(limiter.retryAfterSeconds),
          "X-RateLimit-Remaining": String(limiter.remaining),
        },
      },
    );
  }

  try {
    const body = await req.json();
    const parsed = await validateSchema(symptomAnalysisSchema, body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.message, details: parsed.errors },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const input = parsed.data;
    const analysis = await analyzeDentalSymptoms(input);

    return NextResponse.json(analysis, {
      headers: {
        "Cache-Control": "no-store",
        "X-RateLimit-Remaining": String(limiter.remaining),
      },
    });
  } catch (error) {
    if (error instanceof AiProviderError) {
      return NextResponse.json(
        { error: error.message },
        {
          status: error.status,
          headers: {
            "Cache-Control": "no-store",
            ...(error.retryAfterSeconds ? { "Retry-After": String(error.retryAfterSeconds) } : {}),
          },
        },
      );
    }

    const message = error instanceof Error ? error.message : "Analisa gejala gagal diproses.";

    return NextResponse.json(
      { error: message },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }
}

