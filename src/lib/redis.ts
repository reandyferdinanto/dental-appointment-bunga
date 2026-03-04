import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Fallback in-memory store for development without Redis
const memoryStore = new Map<string, string>();

class MemoryRedis {
  async get(key: string) {
    const val = memoryStore.get(key);
    if (!val) return null;
    try { return JSON.parse(val); } catch { return val; }
  }

  async set(key: string, value: unknown) {
    memoryStore.set(key, JSON.stringify(value));
    return "OK";
  }

  async del(key: string) {
    memoryStore.delete(key);
    return 1;
  }

  async sadd(key: string, ...members: string[]) {
    const existing = memoryStore.get(key);
    const set: Set<string> = existing ? new Set(JSON.parse(existing)) : new Set();
    members.forEach((m) => set.add(m));
    memoryStore.set(key, JSON.stringify([...set]));
    return members.length;
  }

  async smembers(key: string): Promise<string[]> {
    const val = memoryStore.get(key);
    if (!val) return [];
    return JSON.parse(val);
  }

  async srem(key: string, ...members: string[]) {
    const existing = memoryStore.get(key);
    if (!existing) return 0;
    const set: Set<string> = new Set(JSON.parse(existing));
    let removed = 0;
    members.forEach((m) => { if (set.delete(m)) removed++; });
    memoryStore.set(key, JSON.stringify([...set]));
    return removed;
  }

  async sismember(key: string, member: string) {
    const existing = memoryStore.get(key);
    if (!existing) return 0;
    const set: Set<string> = new Set(JSON.parse(existing));
    return set.has(member) ? 1 : 0;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    return [...memoryStore.keys()].filter((k) => regex.test(k));
  }

  async hset(key: string, field: Record<string, unknown>) {
    const existing = memoryStore.get(key);
    const hash: Record<string, unknown> = existing ? JSON.parse(existing) : {};
    Object.assign(hash, field);
    memoryStore.set(key, JSON.stringify(hash));
    return Object.keys(field).length;
  }

  async hgetall(key: string) {
    const val = memoryStore.get(key);
    if (!val) return null;
    return JSON.parse(val);
  }

  async exists(key: string) {
    return memoryStore.has(key) ? 1 : 0;
  }
}

const hasRedisConfig = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  && process.env.UPSTASH_REDIS_REST_URL !== "https://your-redis-url.upstash.io";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db: any = hasRedisConfig ? redis : new MemoryRedis();

