import type { NextAuthConfig } from "next-auth";

const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

function getNextJakartaMidnightMs(fromMs: number = Date.now()): number {
    const jakartaNow = new Date(fromMs + JAKARTA_OFFSET_MS);
    return Date.UTC(
        jakartaNow.getUTCFullYear(),
        jakartaNow.getUTCMonth(),
        jakartaNow.getUTCDate() + 1,
        0,
        0,
        0,
        0
    ) - JAKARTA_OFFSET_MS;
}

export const authConfig = {
    pages: { signIn: "/login" },
    callbacks: {
        async jwt({ token, user, trigger }) {
            if (user) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.role = (user as any).role;
                token.id = user.id;
                token.loginTime = Date.now();
                token.sessionExpiresAt = getNextJakartaMidnightMs();
            }

            if (
                token.sessionExpiresAt &&
                Date.now() >= (token.sessionExpiresAt as number)
            ) {
                return {};
            }

            if (trigger === "update" && token.loginTime) {
                // allow session refresh without resetting loginTime / expiry
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
                (session.user as any).role = token.role;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).id = token.id;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).loginTime = token.loginTime;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).sessionExpiresAt = token.sessionExpiresAt;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET,
    providers: [],
} satisfies NextAuthConfig;
