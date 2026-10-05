import { apiJson, unauthorized } from "@/lib/api";
import { getApiUser } from "@/lib/api-auth";

export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();
  return apiJson({ user });
}
