/**
 * Database client — Upstash Redis (REST API)
 *
 * Production  : Set KV_REST_API_URL + KV_REST_API_TOKEN in Vercel env vars
 *               (Vercel auto-injects these when you connect an Upstash store)
 *               OR use the legacy UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN names.
 *
 * Development : If neither is set, falls back to an in-memory store so the
 *               app runs locally without any Redis credentials.
 */

import { Redis } from "@upstash/redis";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getEnv(...keys: string[]): string {
  for (const key of keys) {
    const val = process.env[key];
    if (val && !val.startsWith("https://your-")) return val;
  }
  return "";
}

const redisUrl   = getEnv("KV_REST_API_URL",   "UPSTASH_REDIS_REST_URL");
const redisToken = getEnv("KV_REST_API_TOKEN",  "UPSTASH_REDIS_REST_TOKEN");

// ─── In-memory fallback (local dev without credentials) ──────────────────────

const mem = new Map<string, string>();

class MemoryRedis {
  async get(key: string) {
    const v = mem.get(key);
    if (!v) return null;
    try { return JSON.parse(v); } catch { return v; }
  }
  async set(key: string, value: unknown) {
    mem.set(key, JSON.stringify(value));
    return "OK";
  }
  async del(key: string) {
    return mem.delete(key) ? 1 : 0;
  }
  async exists(key: string) {
    return mem.has(key) ? 1 : 0;
  }

  // ── Set operations ──
  async sadd(key: string, ...members: string[]) {
    const set = this._getSet(key);
    members.forEach((m) => set.add(m));
    mem.set(key, JSON.stringify([...set]));
    return members.length;
  }
  async srem(key: string, ...members: string[]) {
    const set = this._getSet(key);
    let n = 0;
    members.forEach((m) => { if (set.delete(m)) n++; });
    mem.set(key, JSON.stringify([...set]));
    return n;
  }
  async smembers(key: string): Promise<string[]> {
    return this._getSet(key) ? [...this._getSet(key)] : [];
  }
  async sismember(key: string, member: string) {
    return this._getSet(key).has(member) ? 1 : 0;
  }

  // ── Hash operations ──
  async hset(key: string, field: Record<string, unknown>) {
    const hash = this._getHash(key);
    Object.assign(hash, field);
    mem.set(key, JSON.stringify(hash));
    return Object.keys(field).length;
  }
  async hgetall(key: string) {
    const v = mem.get(key);
    return v ? JSON.parse(v) : null;
  }

  // ── Scan / keys ──
  async keys(pattern: string): Promise<string[]> {
    const re = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    return [...mem.keys()].filter((k) => re.test(k));
  }

  // ── Internals ──
  private _getSet(key: string): Set<string> {
    const v = mem.get(key);
    return v ? new Set(JSON.parse(v)) : new Set();
  }
  private _getHash(key: string): Record<string, unknown> {
    const v = mem.get(key);
    return v ? JSON.parse(v) : {};
  }
}

// ─── Export ──────────────────────────────────────────────────────────────────

const hasCredentials = Boolean(redisUrl && redisToken);

/**
 * `db` — use this everywhere instead of importing Redis directly.
 *
 * - In production (Vercel + Upstash) → real Redis via REST API
 * - In local dev without credentials  → in-memory store (data lost on restart)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db: any = hasCredentials
  ? new Redis({ url: redisUrl, token: redisToken })
  : new MemoryRedis();

if (!hasCredentials && process.env.NODE_ENV !== "test") {
  console.warn(
    "[db] No Redis credentials found (KV_REST_API_URL / UPSTASH_REDIS_REST_URL). " +
    "Using in-memory store — data will NOT persist between restarts."
  );
}
