import { getSession } from "@/lib/auth";
import { createAuthorizationCode } from "@/lib/mobile-auth";
import { authorizeParamsSchema, buildAppRedirect } from "@/lib/mobile-auth-schema";

function seeOther(location: string): Response {
  return new Response(null, { status: 303, headers: { Location: location, "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const parsed = authorizeParamsSchema.safeParse({
    redirect_uri: form?.get("redirect_uri") ?? undefined,
    code_challenge: form?.get("code_challenge") ?? undefined,
    state: form?.get("state") || undefined,
  });
  if (!parsed.success) return new Response("Invalid sign-in request.", { status: 400 });
  const { redirect_uri: redirectUri, code_challenge: codeChallenge, state } = parsed.data;

  const session = await getSession();
  if (!session?.user?.id) {
    const query = new URLSearchParams({ redirect_uri: redirectUri, code_challenge: codeChallenge, ...(state ? { state } : {}) });
    return seeOther(`/login?callbackUrl=${encodeURIComponent(`/mobile/authorize?${query}`)}`);
  }

  const code = await createAuthorizationCode(session.user.id, codeChallenge);
  return seeOther(buildAppRedirect(redirectUri, code, state));
}
