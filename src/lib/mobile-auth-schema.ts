import { createHash } from "node:crypto";
import { z } from "zod";

const ALLOWED_REDIRECT_SCHEMES = ["sigmagadgets:", "exp:"];

export function isAllowedRedirectUri(value: string): boolean {
  if (value.length > 500) return false;
  try {
    return ALLOWED_REDIRECT_SCHEMES.includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export const authorizeParamsSchema = z.object({
  redirect_uri: z.string().refine(isAllowedRedirectUri, "This app is not allowed to sign in here."),
  code_challenge: z.string().regex(/^[A-Za-z0-9_-]{43}$/, "Invalid sign-in request."),
  state: z.string().regex(/^[A-Za-z0-9._~-]{1,200}$/, "Invalid sign-in request.").optional(),
});

export type AuthorizeParams = z.infer<typeof authorizeParamsSchema>;

export const tokenBodySchema = z.object({
  code: z.string().regex(/^[A-Za-z0-9_-]{20,200}$/, "Invalid code"),
  codeVerifier: z.string().regex(/^[A-Za-z0-9._~-]{43,128}$/, "Invalid code verifier"),
});

export function sha256Base64Url(value: string): string {
  return createHash("sha256").update(value).digest("base64url");
}

export function matchesChallenge(codeVerifier: string, codeChallenge: string): boolean {
  return sha256Base64Url(codeVerifier) === codeChallenge;
}

export function buildAppRedirect(redirectUri: string, code: string, state?: string): string {
  const url = new URL(redirectUri);
  url.searchParams.set("code", code);
  if (state) url.searchParams.set("state", state);
  return url.toString();
}
