import { apiError, apiJson, readJsonBody, validationError } from "@/lib/api";
import { redeemAuthorizationCode } from "@/lib/mobile-auth";
import { tokenBodySchema } from "@/lib/mobile-auth-schema";

export async function POST(request: Request) {
  const parsed = tokenBodySchema.safeParse(await readJsonBody(request));
  if (!parsed.success) return validationError(parsed.error);

  const session = await redeemAuthorizationCode(parsed.data.code, parsed.data.codeVerifier);
  if (!session) {
    return apiError(400, "invalid_grant", "This sign-in code is invalid or has expired. Please sign in again.");
  }

  return apiJson({ token: session.token, expiresAt: session.expiresAt.toISOString(), user: session.user });
}
