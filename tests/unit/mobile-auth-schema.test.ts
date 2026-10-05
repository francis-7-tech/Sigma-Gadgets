import { createHash, randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { authorizeParamsSchema, buildAppRedirect, isAllowedRedirectUri, matchesChallenge, sha256Base64Url, tokenBodySchema } from "@/lib/mobile-auth-schema";

const verifier = randomBytes(32).toString("base64url");
const challenge = createHash("sha256").update(verifier).digest("base64url");

describe("isAllowedRedirectUri", () => {
  it("allows the app's own link and Expo Go links", () => {
    expect(isAllowedRedirectUri("sigmagadgets://auth")).toBe(true);
    expect(isAllowedRedirectUri("exp://192.168.1.20:8081/--/auth")).toBe(true);
  });

  it("refuses websites, other apps and junk", () => {
    for (const uri of ["https://evil.com/auth", "http://localhost:3000", "otherapp://auth", "javascript:alert(1)", "sigmagadgets", "", `sigmagadgets://auth?x=${"a".repeat(500)}`]) {
      expect(isAllowedRedirectUri(uri), uri.slice(0, 40)).toBe(false);
    }
  });
});

describe("authorizeParamsSchema", () => {
  it("accepts a valid sign-in request", () => {
    expect(authorizeParamsSchema.safeParse({ redirect_uri: "sigmagadgets://auth", code_challenge: challenge, state: "abc-123" }).success).toBe(true);
    expect(authorizeParamsSchema.safeParse({ redirect_uri: "sigmagadgets://auth", code_challenge: challenge }).success).toBe(true);
  });

  it("refuses a bad redirect, a malformed challenge or repeated values", () => {
    for (const params of [
      { redirect_uri: "https://evil.com", code_challenge: challenge },
      { redirect_uri: "sigmagadgets://auth", code_challenge: "too-short" },
      { redirect_uri: "sigmagadgets://auth" },
      { redirect_uri: ["sigmagadgets://auth", "https://evil.com"], code_challenge: challenge },
      { redirect_uri: "sigmagadgets://auth", code_challenge: challenge, state: "has spaces" },
    ]) {
      expect(authorizeParamsSchema.safeParse(params).success, JSON.stringify(params)).toBe(false);
    }
  });
});

describe("PKCE", () => {
  it("matches a verifier with its own challenge only", () => {
    expect(sha256Base64Url(verifier)).toBe(challenge);
    expect(matchesChallenge(verifier, challenge)).toBe(true);
    expect(matchesChallenge(randomBytes(32).toString("base64url"), challenge)).toBe(false);
  });
});

describe("tokenBodySchema", () => {
  it("accepts a code with its verifier", () => {
    expect(tokenBodySchema.safeParse({ code: randomBytes(32).toString("base64url"), codeVerifier: verifier }).success).toBe(true);
  });

  it("refuses missing or malformed values", () => {
    for (const body of [{}, { code: "short", codeVerifier: verifier }, { code: randomBytes(32).toString("base64url"), codeVerifier: "short" }, undefined]) {
      expect(tokenBodySchema.safeParse(body).success, JSON.stringify(body)).toBe(false);
    }
  });
});

describe("buildAppRedirect", () => {
  it("adds the code and state to the app link", () => {
    expect(buildAppRedirect("sigmagadgets://auth", "CODE", "abc")).toBe("sigmagadgets://auth?code=CODE&state=abc");
    expect(buildAppRedirect("exp://192.168.1.20:8081/--/auth", "CODE")).toBe("exp://192.168.1.20:8081/--/auth?code=CODE");
  });
});
