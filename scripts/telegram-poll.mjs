/**
 * Telegram Long-Polling Script for drg. Natasya Bunga Maureen Bot
 * ─────────────────────────────────────────────────────────────────
 * Run with:  node scripts/telegram-poll.mjs
 *
 * This script polls Telegram for updates and forwards them to the
 * Next.js webhook endpoint running locally at http://localhost:3001
 * (or wherever NEXTAUTH_URL points).
 *
 * It also DELETES any existing webhook so Telegram uses polling mode.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Load .env.local ──────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath   = resolve(__dirname, "../.env.local");

try {
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = process.env[key] ?? val;
  }
} catch {
  console.warn("⚠️  Could not load .env.local — using process.env only");
}

// ── Config ───────────────────────────────────────────────────────────────────
const TOKEN      = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL    = (process.env.NEXTAUTH_URL ?? "http://localhost:3001").replace(/\/$/, "");
const WEBHOOK_URL = `${APP_URL}/api/telegram/webhook`;
const BASE       = `https://api.telegram.org/bot${TOKEN}`;

if (!TOKEN) {
  console.error("❌  TELEGRAM_BOT_TOKEN is not set!");
  process.exit(1);
}

// ── Remove existing webhook (so Telegram uses polling) ───────────────────────
async function removeWebhook() {
  const res  = await fetch(`${BASE}/deleteWebhook`, { method: "POST" });
  const data = await res.json();
  if (data.ok) {
    console.log("✅  Webhook removed — polling mode active");
  } else {
    console.warn("⚠️  Could not remove webhook:", data.description);
  }
}

// ── Get bot info ─────────────────────────────────────────────────────────────
async function getBotInfo() {
  const res  = await fetch(`${BASE}/getMe`);
  const data = await res.json();
  if (data.ok) {
    console.log(`🤖  Bot: @${data.result.username} (${data.result.first_name})`);
  }
}

// ── Forward update to Next.js webhook route ──────────────────────────────────
async function forwardUpdate(update) {
  try {
    const res = await fetch(WEBHOOK_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(update),
    });
    if (!res.ok) {
      console.warn(`⚠️  Webhook route returned ${res.status}`);
    }
  } catch (err) {
    console.error("❌  Failed to forward update to Next.js:", err.message);
  }
}

// ── Polling loop ─────────────────────────────────────────────────────────────
let offset = 0;

async function poll() {
  try {
    const res  = await fetch(`${BASE}/getUpdates?offset=${offset}&timeout=30&allowed_updates=message,callback_query`);
    const data = await res.json();

    if (!data.ok) {
      console.error("❌  getUpdates error:", data.description);
      await sleep(5000);
      return;
    }

    for (const update of data.result) {
      offset = update.update_id + 1;
      const who =
        update.message?.from?.first_name ??
        update.callback_query?.from?.first_name ??
        "?";
      const text =
        update.message?.text ??
        `[callback: ${update.callback_query?.data}]` ??
        "";
      console.log(`📨  Update #${update.update_id} from ${who}: ${text}`);
      await forwardUpdate(update);
    }
  } catch (err) {
    console.error("❌  Poll error:", err.message);
    await sleep(5000);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log("🦷  drg. Natasya Bunga Maureen — Telegram Bot Polling");
  console.log(`📡  Forwarding to: ${WEBHOOK_URL}`);
  console.log("─────────────────────────────────────────────────────");

  await removeWebhook();
  await getBotInfo();

  console.log("\n✅  Polling started. Send a message to your bot on Telegram!\n");
  console.log("Press Ctrl+C to stop.\n");

  // Main loop
  while (true) {
    await poll();
  }
})();

