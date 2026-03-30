import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { gsheet } from "@/lib/gsheet";
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { authConfig } from "./auth.config";
import { loginSchema, validateSchema } from "@/lib/validators";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // sha256:salt:hash  OR  bcrypt hash (legacy)
  role: "admin" | "superadmin";
  createdAt: string;
}

// ── Password helpers (no external deps) ───────────────────────────────────────
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(salt + password).digest("hex");
  return `sha256:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (stored.startsWith("sha256:")) {
    const [, salt, hash] = stored.split(":");
    const attempt = createHash("sha256").update(salt + password).digest("hex");
    try {
      return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(attempt, "hex"));
    } catch { return false; }
  }
  // Fallback: plain bcrypt-style stored — compare directly (not secure, migration path only)
  return false;
}

// ── DB helpers — Read from MongoDB, fallback to GSheet ────────────────────────
export async function getAdmins(): Promise<AdminUser[]> {
  try {
    const db = await getDb();
    const raw = await db.collection(COLLECTIONS.admins).find({}).toArray();
    if (raw.length > 0) {
      return raw.map(({ _id, ...rest }) => { void _id; return rest as unknown as AdminUser; });
    }
    // Fallback to GSheet if MongoDB has no admins yet
    const gsheetRaw = await gsheet.call("admin_list") as AdminUser[] | { error: string } | null;
    if (!gsheetRaw || !Array.isArray(gsheetRaw)) return [];
    return gsheetRaw;
  } catch {
    // If MongoDB fails, fallback to GSheet
    try {
      const gsheetRaw = await gsheet.call("admin_list") as AdminUser[] | { error: string } | null;
      if (!gsheetRaw || !Array.isArray(gsheetRaw)) return [];
      return gsheetRaw;
    } catch { return []; }
  }
}

export async function verifyAdmin(email: string, password: string): Promise<AdminUser | null> {
  // 1. Env-var fallback (always available)
  const envEmail = process.env.ADMIN_EMAIL ?? "";
  const envPass = process.env.ADMIN_PASSWORD ?? "";
  if (envEmail && envPass && email === envEmail && password === envPass) {
    return { id: "bunga", name: "Natasya Bunga Maureen", email: envEmail, passwordHash: "", role: "superadmin", createdAt: "" };
  }
  // 2. MongoDB (with GSheet fallback)
  const admins = await getAdmins();
  const admin = admins.find(a => a.email.toLowerCase() === email.toLowerCase());
  if (!admin) return null;
  return verifyPassword(password, admin.passwordHash) ? admin : null;
}

// ── NextAuth config ───────────────────────────────────────────────────────────
// signIn / signOut are exported for use by server actions and other modules
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = await validateSchema(loginSchema, {
          email: (credentials?.email as string) ?? "",
          password: (credentials?.password as string) ?? "",
        });
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const admin = await verifyAdmin(email, password);
        if (!admin) return null;

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        };
      },
    }),
  ],
});
