/**
 * lib/db.ts — Edge Config Database Adapter
 *
 * Uses Vercel Edge Config as the database:
 *  - READ  : @vercel/edge-config SDK  (fast, edge-cached)
 *  - WRITE : Vercel REST API  (EDGE_CONFIG_ID + VERCEL_API_TOKEN env vars)
 *
 * Data model mirrors the original Redis key/set/hash patterns using
 * Edge Config items where each key maps to a JSON-serialised value.
 *
 * Required env vars:
 *   EDGE_CONFIG            – full connection string (auto-injected by Vercel)
 *   EDGE_CONFIG_ID         – ecfg_xxxx  (extract from the EDGE_CONFIG URL)
 *   VERCEL_API_TOKEN       – a Vercel personal access token with read/write
 *   VERCEL_TEAM_ID         – (optional) team slug/id if project is in a team
 */

import { get, getAll, has } from "@vercel/edge-config";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Sanitise a Redis-style key so it is a valid Edge Config item key.
 *  Edge Config keys may only contain [a-zA-Z0-9_-] and max 256 chars. */
function sanitize(key: string): string {
  return key.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 256);
}

const EDGE_CONFIG_ID   = process.env.EDGE_CONFIG_ID   ?? "";
const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN ?? "";
const VERCEL_TEAM_ID   = process.env.VERCEL_TEAM_ID   ?? "";

const teamQuery = VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : "";

/** Write one or more items to Edge Config via the Vercel REST API. */
async function ecWrite(items: Record<string, unknown>): Promise<void> {
  if (!EDGE_CONFIG_ID || !VERCEL_API_TOKEN) {
    // Fall back to in-memory when not configured
    for (const [k, v] of Object.entries(items)) memStore.set(k, v);
    return;
  }
  const url = `https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items${teamQuery}`;
  const body = JSON.stringify({
    items: Object.entries(items).map(([key, value]) => ({
      operation: "upsert",
      key: sanitize(key),
      value,
    })),
  });
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${VERCEL_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body,
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("[EdgeConfig] write error:", res.status, err);
  }
}

/** Delete one item from Edge Config via the Vercel REST API. */
async function ecDelete(key: string): Promise<void> {
  if (!EDGE_CONFIG_ID || !VERCEL_API_TOKEN) {
    memStore.delete(key);
    return;
  }
  const url = `https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items${teamQuery}`;
  await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${VERCEL_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [{ operation: "delete", key: sanitize(key) }],
    }),
  });
}

/** Read one item — tries Edge Config SDK first, falls back to in-memory. */
async function ecGet(key: string): Promise<unknown> {
  const sk = sanitize(key);
  if (EDGE_CONFIG_ID) {
    try {
      const val = await get(sk);
      return val ?? null;
    } catch {
      // Edge Config not reachable locally without EDGE_CONFIG env var
    }
  }
  return memStore.get(sk) ?? null;
}

// ─── In-memory fallback (local dev without EDGE_CONFIG env) ─────────────────

const memStore = new Map<string, unknown>();

// ─── EdgeConfigDB — drop-in replacement for the previous Redis `db` ─────────

class EdgeConfigDB {
  // ── String / JSON ──────────────────────────────────────────────────────────

  async get(key: string): Promise<unknown> {
    return ecGet(sanitize(key));
  }

  async set(key: string, value: unknown): Promise<string> {
    await ecWrite({ [sanitize(key)]: value });
    return "OK";
  }

  async del(key: string): Promise<number> {
    await ecDelete(sanitize(key));
    return 1;
  }

  async exists(key: string): Promise<number> {
    const sk = sanitize(key);
    if (EDGE_CONFIG_ID) {
      try { return (await has(sk)) ? 1 : 0; } catch {}
    }
    return memStore.has(sk) ? 1 : 0;
  }

  // ── Set operations (stored as JSON array in a single Edge Config item) ─────

  async sadd(key: string, ...members: string[]): Promise<number> {
    const sk = sanitize(key);
    const existing: string[] = ((await ecGet(sk)) as string[]) ?? [];
    const set = new Set(existing);
    let added = 0;
    for (const m of members) {
      if (!set.has(m)) { set.add(m); added++; }
    }
    await ecWrite({ [sk]: [...set] });
    return added;
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    const sk = sanitize(key);
    const existing: string[] = ((await ecGet(sk)) as string[]) ?? [];
    const set = new Set(existing);
    let removed = 0;
    for (const m of members) {
      if (set.has(m)) { set.delete(m); removed++; }
    }
    await ecWrite({ [sk]: [...set] });
    return removed;
  }

  async smembers(key: string): Promise<string[]> {
    const val = await ecGet(sanitize(key));
    if (Array.isArray(val)) return val as string[];
    return [];
  }

  async sismember(key: string, member: string): Promise<number> {
    const members = await this.smembers(key);
    return members.includes(member) ? 1 : 0;
  }

  // ── Hash operations ────────────────────────────────────────────────────────

  async hset(key: string, fields: Record<string, unknown>): Promise<number> {
    const sk = sanitize(key);
    const existing: Record<string, unknown> = ((await ecGet(sk)) as Record<string, unknown>) ?? {};
    const merged = { ...existing, ...fields };
    await ecWrite({ [sk]: merged });
    return Object.keys(fields).length;
  }

  async hgetall(key: string): Promise<Record<string, unknown> | null> {
    const val = await ecGet(sanitize(key));
    return (val && typeof val === "object" && !Array.isArray(val))
      ? (val as Record<string, unknown>)
      : null;
  }

  // ── Keys pattern scan ──────────────────────────────────────────────────────

  async keys(pattern: string): Promise<string[]> {
    const re = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    if (EDGE_CONFIG_ID) {
      try {
        const all = await getAll();
        return Object.keys(all ?? {}).filter((k) => re.test(k));
      } catch {}
    }
    return [...memStore.keys()].filter((k) => re.test(k));
  }
}

// ─── Export ──────────────────────────────────────────────────────────────────

export const db = new EdgeConfigDB();

const configured = Boolean(EDGE_CONFIG_ID && VERCEL_API_TOKEN);
if (!configured && process.env.NODE_ENV !== "test") {
  console.warn(
    "[db] Edge Config not fully configured (need EDGE_CONFIG_ID + VERCEL_API_TOKEN). " +
    "Using in-memory fallback — data will NOT persist between restarts."
  );
}
