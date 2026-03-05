/**
 * POST /api/telegram/webhook
 * Receives all updates from Telegram and dispatches to bot logic.
 * Register this URL as webhook via /api/telegram/setup
 *
 * IMPORTANT: We MUST await handlers before returning 200.
 * On Vercel serverless, returning the response immediately terminates
 * the function — any pending "void/fire-and-forget" async work is killed.
 */

import { NextRequest, NextResponse } from "next/server";
import { handleMessage, handleCallback } from "@/lib/telegram/bot";

// Allow up to 60s for slow Google Sheets API calls
export const maxDuration = 60;

// Telegram sends updates as JSON POST
export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // ── Text message ──────────────────────────────────────────────────────────
    if (update.message) {
      const msg       = update.message;
      const chatId    = msg.chat.id as number;
      const text      = (msg.text as string) ?? "";
      const firstName = (msg.from?.first_name as string) ?? "";

      // MUST await — Vercel kills async work when the response is returned
      await handleMessage(chatId, text, firstName);
    }

    // ── Callback query (button taps) ──────────────────────────────────────────
    if (update.callback_query) {
      const cq        = update.callback_query;
      const chatId    = cq.message?.chat?.id as number;
      const queryId   = cq.id as string;
      const data      = (cq.data as string) ?? "";
      const firstName = (cq.from?.first_name as string) ?? "";

      // MUST await
      await handleCallback(chatId, queryId, data, firstName);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[telegram/webhook]", err);
    return NextResponse.json({ ok: false }, { status: 200 }); // Always 200 to Telegram
  }
}

// Prevent GET probe from erroring
export async function GET() {
  return NextResponse.json({ status: "Telegram webhook active" });
}

