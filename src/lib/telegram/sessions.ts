/**
 * In-memory conversation session store with TTL.
 * Scoped per chat_id. Survives within the same Vercel worker lifecycle.
 * For a persistent multi-user bot, upgrade to Upstash Redis KV.
 */

export type BotStep =
  | "IDLE"
  // booking flow
  | "BOOK_NAME"
  | "BOOK_PHONE"
  | "BOOK_COMPLAINT"
  | "BOOK_DATE"
  | "BOOK_TIME"
  | "BOOK_CONFIRM";

export interface BookingDraft {
  name?:      string;
  phone?:     string;
  complaint?: string;
  date?:      string;
  time?:      string;
  slots?:     string[];
}

export interface Session {
  step:       BotStep;
  draft:      BookingDraft;
  updatedAt:  number;
}

const TTL_MS = 30 * 60 * 1000; // 30 minutes idle timeout
const store  = new Map<number, Session>();

export function getSession(chatId: number): Session {
  const s = store.get(chatId);
  if (s && Date.now() - s.updatedAt < TTL_MS) return s;
  const fresh: Session = { step: "IDLE", draft: {}, updatedAt: Date.now() };
  store.set(chatId, fresh);
  return fresh;
}

export function setSession(chatId: number, update: Partial<Session>): Session {
  const s = getSession(chatId);
  const next: Session = { ...s, ...update, updatedAt: Date.now() };
  store.set(chatId, next);
  return next;
}

export function resetSession(chatId: number): void {
  store.delete(chatId);
}

// Cleanup expired sessions periodically (runs on every request — lightweight)
export function pruneExpired(): void {
  const now = Date.now();
  for (const [id, s] of store.entries()) {
    if (now - s.updatedAt > TTL_MS) store.delete(id);
  }
}

