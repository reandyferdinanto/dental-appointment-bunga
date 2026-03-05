/**
 * lib/gsheet.ts — Google Sheets Database Client
 *
 * Strategy for speed:
 *  1. Stale-While-Revalidate (SWR) cache — read actions are cached in
 *     Node.js module memory (survives across requests in the same worker).
 *     Cache TTL = 30 s for lists/week, 60 s for settings.
 *  2. Request deduplication — if two requests for the same key arrive
 *     simultaneously, only ONE fetch goes to Apps Script; both await it.
 *  3. Write actions (create/update/delete/set/seed) automatically
 *     bust the relevant cache keys so the next read is fresh.
 *
 * Required env vars:
 *   GSHEET_API_URL  — Web App URL dari Apps Script deployment
 *   GSHEET_SECRET   — Token rahasia (sama dengan SECRET_TOKEN di Code.gs)
 */

const API_URL = process.env.GSHEET_API_URL ?? "";
const SECRET  = process.env.GSHEET_SECRET  ?? "";

// ── Cache store ───────────────────────────────────────────────────────────────
interface CacheEntry { data: unknown; expiresAt: number; }
const cache   = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();   // dedup in-flight

// TTL per action group (ms)
const TTL: Record<string, number> = {
  apt_list:       30_000,
  log_list:       30_000,
  sch_get_week:   30_000,
  sch_get:        30_000,
  settings_get:   60_000,
  admin_list:     60_000,
};

// Write actions that should invalidate related caches
const INVALIDATES: Record<string, string[]> = {
  apt_create:        ["apt_list"],
  apt_update_status: ["apt_list"],
  apt_delete:        ["apt_list"],
  log_create:        ["log_list"],
  log_delete:        ["log_list"],
  sch_set:           ["sch_get_week", "sch_get"],
  sch_remove_slot:   ["sch_get_week", "sch_get"],
  settings_set:      ["settings_get"],
  admin_create:      ["admin_list"],
  admin_update_password: ["admin_list"],
  admin_update:      ["admin_list"],
  admin_delete:      ["admin_list"],
  seed:              ["apt_list", "log_list", "sch_get_week", "sch_get", "settings_get"],
};

function cacheKey(action: string, body: Record<string, unknown>): string {
  // For week/date fetches, include the date so different weeks don't collide
  if (action === "sch_get_week") return `${action}:${body.koasId ?? ""}:${body.weekStart ?? ""}`;
  if (action === "sch_get")      return `${action}:${body.koasId ?? ""}:${body.date ?? ""}`;
  if (action === "log_list")     return `${action}:${body.koasId ?? ""}`;
  return action;
}

function bustCache(action: string) {
  const targets = INVALIDATES[action] ?? [];
  for (const [key] of cache) {
    if (targets.some(t => key === t || key.startsWith(t + ":"))) {
      cache.delete(key);
    }
  }
}

// ── HTTP fetch to Apps Script ──────────────────────────────────────────────────
async function fetchGSheet(action: string, body: Record<string, unknown>): Promise<unknown> {
  if (!API_URL) {
    console.warn("[gsheet] GSHEET_API_URL not set");
    return null;
  }
  const payload = JSON.stringify({ action, token: SECRET, ...body });
  const url = `${API_URL}?payload=${encodeURIComponent(payload)}`;
  const res = await fetch(url, { method: "GET", redirect: "follow" });
  if (!res.ok) throw new Error(`GSheet API error ${res.status}: ${await res.text()}`);
  return res.json();
}

// ── Main client ────────────────────────────────────────────────────────────────
class GSheetDB {
  async call(action: string, body: Record<string, unknown> = {}): Promise<unknown> {
    const ttl = TTL[action];

    // ── READ: use cache + deduplication ──────────────────────────────────────
    if (ttl !== undefined) {
      const key     = cacheKey(action, body);
      const cached  = cache.get(key);

      if (cached && Date.now() < cached.expiresAt) {
        return cached.data;                          // cache hit ✅
      }

      // Dedup: if another request for same key is already in-flight, await it
      if (inflight.has(key)) {
        return inflight.get(key)!;
      }

      const promise = fetchGSheet(action, body).then(data => {
        cache.set(key, { data, expiresAt: Date.now() + ttl });
        inflight.delete(key);
        return data;
      }).catch(err => {
        inflight.delete(key);
        // On error, return stale cache if available rather than crashing
        if (cached) return cached.data;
        throw err;
      });

      inflight.set(key, promise);
      return promise;
    }

    // ── WRITE: bust cache then fetch ─────────────────────────────────────────
    bustCache(action);
    return fetchGSheet(action, body);
  }

  /** Manually invalidate cache for a specific action prefix */
  invalidate(action: string) { bustCache(action); }
}

export const gsheet = new GSheetDB();

if (!API_URL && process.env.NODE_ENV !== "test") {
  console.warn("[gsheet] GSHEET_API_URL tidak di-set. Data tidak akan persist.");
}
