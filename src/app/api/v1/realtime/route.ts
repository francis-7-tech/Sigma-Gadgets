import { apiJson, unauthorized } from "@/lib/api";
import { getApiUser } from "@/lib/api-auth";
import { getRealtimeConfig } from "@/lib/realtime";

export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();
  return apiJson({ realtime: getRealtimeConfig(user.id) });
}
