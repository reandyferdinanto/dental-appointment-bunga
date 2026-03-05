import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { gsheet } from "@/lib/gsheet";
import { createHash, randomBytes, timingSafeEqual } from "crypto";

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

// ── DB helpers ────────────────────────────────────────────────────────────────
export async function getAdmins(): Promise<AdminUser[]> {
  try {
    const raw = await gsheet.call("admin_list") as AdminUser[] | { error: string } | null;
    if (!raw || !Array.isArray(raw)) return [];
    return raw;
  } catch { return []; }
}

export async function verifyAdmin(email: string, password: string): Promise<AdminUser | null> {
  // 1. Env-var fallback (always available)
  const envEmail = process.env.ADMIN_EMAIL ?? "";
  const envPass  = process.env.ADMIN_PASSWORD ?? "";
  if (envEmail && envPass && email === envEmail && password === envPass) {
    return { id: "bunga", name: "Natasya Bunga Maureen", email: envEmail, passwordHash: "", role: "superadmin", createdAt: "" };
  }
  // 2. GSheet admins
  const admins = await getAdmins();
  const admin = admins.find(a => a.email.toLowerCase() === email.toLowerCase());
  if (!admin) return null;
  return verifyPassword(password, admin.passwordHash) ? admin : null;
}

// ── NextAuth config ───────────────────────────────────────────────────────────
// signIn / signOut are exported for use by server actions and other modules
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email    = (credentials?.email    as string) ?? "";
        const password = (credentials?.password as string) ?? "";
        if (!email || !password) return null;

        const admin = await verifyAdmin(email, password);
        if (!admin) return null;

        return {
          id:    admin.id,
          email: admin.email,
          name:  admin.name,
          role:  admin.role,
        };
      },
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role      = (user as any).role;
        token.id        = user.id;
        token.loginTime = Date.now();          // record login timestamp
      }
      // Re-check expiry on every token refresh (trigger = "update" or undefined)
      const SIX_HOURS = 6 * 60 * 60 * 1000;
      if (token.loginTime && Date.now() - (token.loginTime as number) > SIX_HOURS) {
        // Force sign-out by returning empty token
        return {};
      }
      if (trigger === "update" && token.loginTime) {
        // allow session refresh without resetting loginTime
      }
      return token;
    },
    async session({ session, token }) {
      // If token was cleared (expired), clear session user
      if (!token.id) {
        session.user = {} as typeof session.user;
        return session;
      }
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role      = token.role;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id        = token.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).loginTime = token.loginTime;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 6 * 60 * 60, // 6 hours in seconds
  },
  secret: process.env.NEXTAUTH_SECRET,
});



