import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db/client";
import { sessions, users } from "@/db/schema";
import { bearerToken } from "@/lib/api";
import { getSession } from "@/lib/auth";

export type ApiUser = { id: string; name: string | null; email: string | null; image: string | null };

async function findUserBySessionToken(token: string): Promise<ApiUser | null> {
  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email, image: users.image })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.sessionToken, token), gt(sessions.expires, new Date())));
  return user ?? null;
}

export async function getApiUser(request: Request): Promise<ApiUser | null> {
  const header = request.headers.get("authorization");
  if (header !== null) {
    const token = bearerToken(header);
    return token ? findUserBySessionToken(token) : null;
  }

  const session = await getSession();
  const user = session?.user;
  if (!user?.id) return null;
  return { id: user.id, name: user.name ?? null, email: user.email ?? null, image: user.image ?? null };
}
