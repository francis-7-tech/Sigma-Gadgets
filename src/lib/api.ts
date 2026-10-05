import type { ZodError } from "zod";

const NO_STORE = { "Cache-Control": "no-store" };

export function apiJson(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: NO_STORE });
}

export function apiError(status: number, code: string, message: string, fields?: Record<string, string>): Response {
  return apiJson({ error: { code, message, ...(fields ? { fields } : {}) } }, status);
}

export function unauthorized(): Response {
  return apiError(401, "unauthorized", "Sign in to continue.");
}

export function validationError(error: ZodError): Response {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    fields[String(issue.path[0] ?? "body")] ??= issue.message;
  }
  return apiError(400, "invalid_request", "Some values are missing or invalid.", fields);
}

export function bearerToken(header: string | null): string | null {
  const match = /^Bearer ([A-Za-z0-9._~+/=-]{16,512})$/.exec(header ?? "");
  return match ? match[1] : null;
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
