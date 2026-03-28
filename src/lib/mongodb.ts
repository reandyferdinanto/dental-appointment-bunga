/**
 * lib/mongodb.ts — MongoDB Connection Client
 *
 * Singleton pattern: reuses the same MongoClient across hot-reloads in dev.
 * Collections:
 *   - appointments
 *   - logbook
 *   - schedules
 *   - settings
 *   - admins
 */

import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI ?? "";

if (!MONGODB_URI && process.env.NODE_ENV !== "test") {
  console.warn("[mongodb] MONGODB_URI tidak di-set. MongoDB tidak akan tersedia.");
}

// Module-level cache for dev hot-reload
const globalForMongo = globalThis as unknown as {
  _mongoClient?: MongoClient;
  _mongoClientPromise?: Promise<MongoClient>;
};

function getClientPromise(): Promise<MongoClient> {
  if (!MONGODB_URI) {
    return Promise.reject(new Error("MONGODB_URI is not set"));
  }

  if (globalForMongo._mongoClientPromise) {
    return globalForMongo._mongoClientPromise;
  }

  const client = new MongoClient(MONGODB_URI);
  globalForMongo._mongoClientPromise = client.connect();
  globalForMongo._mongoClient = client;

  return globalForMongo._mongoClientPromise;
}

export const clientPromise = MONGODB_URI ? getClientPromise() : null;

export async function getDb(): Promise<Db> {
  if (!clientPromise) {
    throw new Error("MONGODB_URI is not configured");
  }
  const client = await clientPromise;
  return client.db(); // uses the database name from the URI (dentistBunga)
}

// Collection names
export const COLLECTIONS = {
  appointments: "appointments",
  logbook: "logbook",
  schedules: "schedules",
  settings: "settings",
  admins: "admins",
} as const;
