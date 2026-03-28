import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: { signIn: "/login" },
    callbacks: {
        async jwt({ token, user, trigger }) {
            if (user) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.role = (user as any).role;
                token.id = user.id;
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
                (session.user as any).role = token.role;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).id = token.id;
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
    providers: [],
} satisfies NextAuthConfig;
