/**
 * GET /api/telegram/setup
 * Registers or removes the Telegram webhook.
 * Usage:
 *   GET /api/telegram/setup?action=set   → registers webhook
 *   GET /api/telegram/setup?action=delete → removes webhook
 *   GET /api/telegram/setup              → shows current webhook info
 *
 * Protected by TELEGRAM_SETUP_SECRET query param.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { setWebhook, deleteWebhook } from "@/lib/telegram/api";

const TOKEN  = process.env.TELEGRAM_BOT_TOKEN ?? "";
const BASE   = `https://api.telegram.org/bot${TOKEN}`;

export async function GET(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const secret = searchParams.get("secret");

  // Simple protection
  if (secret !== (process.env.TELEGRAM_SETUP_SECRET ?? "setup-secret")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (action === "set") {
    // Auto-detect the host
    const host = req.headers.get("host") ?? "";
    const proto = host.includes("localhost") ? "http" : "https";
    const webhookUrl = `${proto}://${host}/api/telegram/webhook`;
    const result = await setWebhook(webhookUrl);
    return NextResponse.json({ action: "set", webhookUrl, result });
  }

  if (action === "delete") {
    const result = await deleteWebhook();
    return NextResponse.json({ action: "delete", result });
  }

  // Default: show current info
  const res    = await fetch(`${BASE}/getWebhookInfo`);
  const info   = await res.json();
  return NextResponse.json({ action: "info", info });
}

