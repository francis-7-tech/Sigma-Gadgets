import { randomBytes } from "node:crypto";
import { and, eq, like, lt } from "drizzle-orm";
import { db } from "@/db/client";
import { sessions, users, verificationTokens } from "@/db/schema";
import { matchesChallenge, sha256Base64Url } from "@/lib/mobile-auth-schema";

const CODE_PREFIX = "mobile-code:";
const CODE_LIFETIME_MS = 60 * 1000;
const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

function codeIdentifier(code: string): string {
  return CODE_PREFIX + sha256Base64Url(code);
}

export async function createAuthorizationCode(userId: string, codeChallenge: string): Promise<string> {
  await db
    .delete(verificationTokens)
    .where(and(like(verificationTokens.identifier, `${CODE_PREFIX}%`), lt(verificationTokens.expires, new Date())));

  const code = randomBytes(32).toString("base64url");
  await db.insert(verificationTokens).values({
    identifier: codeIdentifier(code),
    token: `${userId}.${codeChallenge}`,
    expires: new Date(Date.now() + CODE_LIFETIME_MS),
  });
  return code;
}

export type MobileSession = {
  token: string;
  expiresAt: Date;
  user: { id: string; name: string | null; email: string | null; image: string | null };
};

export async function redeemAuthorizationCode(code: string, codeVerifier: string): Promise<MobileSession | null> {
  const [stored] = await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.identifier, codeIdentifier(code)))
    .returning({ token: verificationTokens.token, expires: verificationTokens.expires });
  if (!stored || stored.expires < new Date()) return null;

  const separator = stored.token.indexOf(".");
  const userId = stored.token.slice(0, separator);
  const codeChallenge = stored.token.slice(separator + 1);
  if (!matchesChallenge(codeVerifier, codeChallenge)) return null;

  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email, image: users.image })
    .from(users)
    .where(eq(users.id, userId));
  if (!user) return null;

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_LIFETIME_MS);
  await db.insert(sessions).values({ sessionToken: token, userId, expires: expiresAt });
  return { token, expiresAt, user };
}

export async function revokeSession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.sessionToken, token));
}
