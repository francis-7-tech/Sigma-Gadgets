import { apiError, apiJson, unauthorized } from "@/lib/api";
import { getApiUser } from "@/lib/api-auth";
import { authorizeCartChannel } from "@/lib/realtime";

async function readForm(request: Request): Promise<FormData | null> {
  try {
    return await request.formData();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();

  const form = await readForm(request);
  const socketId = form?.get("socket_id");
  const channelName = form?.get("channel_name");
  if (typeof socketId !== "string" || typeof channelName !== "string") {
    return apiError(400, "invalid_request", "socket_id and channel_name are required.");
  }

  const result = authorizeCartChannel(user.id, socketId, channelName);
  if (!result.ok) {
    return result.reason === "unavailable"
      ? apiError(503, "realtime_unavailable", "Live updates are not available right now.")
      : apiError(403, "forbidden", "You can only listen to your own cart.");
  }
  return apiJson({ auth: result.auth });
}
