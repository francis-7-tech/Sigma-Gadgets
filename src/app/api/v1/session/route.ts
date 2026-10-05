import { apiJson, bearerToken, unauthorized } from "@/lib/api";
import { revokeSession } from "@/lib/mobile-auth";

export async function DELETE(request: Request) {
  const token = bearerToken(request.headers.get("authorization"));
  if (!token) return unauthorized();

  await revokeSession(token);
  return apiJson({ signedOut: true });
}
