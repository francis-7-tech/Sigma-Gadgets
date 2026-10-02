import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db/client";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { sendWelcomeEmail } from "@/lib/welcome";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [Google],
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      await sendWelcomeEmail(user);
    },
  },
});

export const getSession = cache(() => auth());

export { safeCallbackUrl } from "@/lib/safe-url";

export async function requireUser(returnTo: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(returnTo)}`);
  }
  return session.user;
}
