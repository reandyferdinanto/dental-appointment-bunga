/**
 * Telegram HTTP API helpers — zero dependencies, uses native fetch.
 */

const TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const BASE   = `https://api.telegram.org/bot${TOKEN}`;

export type InlineKeyboardButton = {
  text: string;
  callback_data?: string;
  url?: string;
};

export async function sendMessage(
  chatId: number,
  text: string,
  opts?: {
    reply_markup?: {
      inline_keyboard?: InlineKeyboardButton[][];
      keyboard?:        string[][];
      resize_keyboard?: boolean;
      one_time_keyboard?: boolean;
      remove_keyboard?: boolean;
    };
    parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
    disable_web_page_preview?: boolean;
  }
): Promise<void> {
  await fetch(`${BASE}/sendMessage`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ chat_id: chatId, text, ...opts }),
  });
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
  await fetch(`${BASE}/answerCallbackQuery`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ callback_query_id: callbackQueryId, text }),
  });
}

export async function setWebhook(webhookUrl: string): Promise<unknown> {
  const res = await fetch(`${BASE}/setWebhook`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ url: webhookUrl, allowed_updates: ["message", "callback_query"] }),
  });
  return res.json();
}

export async function deleteWebhook(): Promise<unknown> {
  const res = await fetch(`${BASE}/deleteWebhook`);
  return res.json();
}

