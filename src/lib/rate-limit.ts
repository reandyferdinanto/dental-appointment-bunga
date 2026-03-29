import { NextRequest } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const globalForRateLimit = globalThis as typeof globalThis & {
  __rateLimitStore?: Map<string, RateLimitEntry>;
};

const store = globalForRateLimit.__rateLimitStore ?? new Map<string, RateLimitEntry>();
globalForRateLimit.__rateLimitStore = store;

function cleanupExpired(now: number) {
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export function applyRateLimit(options: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  cleanupExpired(now);

  const entry = store.get(options.key);

  if (!entry || entry.resetAt <= now) {
    const resetAt = now + options.windowMs;
    store.set(options.key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: options.limit - 1,
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
    };
  }

  if (entry.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  entry.count += 1;
  store.set(options.key, entry);

  return {
    allowed: true,
    remaining: Math.max(0, options.limit - entry.count),
    retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
  };
}
