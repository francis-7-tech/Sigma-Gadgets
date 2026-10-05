import Pusher from "pusher";

export const CART_CHANGED_EVENT = "cart-changed";

let client: Pusher | null | undefined;

function getPusher(): Pusher | null {
  if (client !== undefined) return client;
  const { PUSHER_APP_ID: appId, PUSHER_KEY: key, PUSHER_SECRET: secret, PUSHER_CLUSTER: cluster } = process.env;
  client = appId && key && secret && cluster ? new Pusher({ appId, key, secret, cluster, useTLS: true, timeout: 3000 }) : null;
  return client;
}

export function cartChannel(userId: string): string {
  return `private-cart-${userId}`;
}

export type RealtimeConfig = { key: string; cluster: string; channel: string; event: string };

export function getRealtimeConfig(userId: string): RealtimeConfig | null {
  const { PUSHER_KEY: key, PUSHER_CLUSTER: cluster } = process.env;
  if (!getPusher() || !key || !cluster) return null;
  return { key, cluster, channel: cartChannel(userId), event: CART_CHANGED_EVENT };
}

export type ChannelAuthorization = { ok: true; auth: string } | { ok: false; reason: "unavailable" | "forbidden" };

export function authorizeCartChannel(userId: string, socketId: string, channelName: string): ChannelAuthorization {
  const pusher = getPusher();
  if (!pusher) return { ok: false, reason: "unavailable" };
  if (channelName !== cartChannel(userId) || !/^\d+\.\d+$/.test(socketId)) return { ok: false, reason: "forbidden" };
  return { ok: true, auth: pusher.authorizeChannel(socketId, channelName).auth };
}

export async function notifyCartChanged(userId: string): Promise<void> {
  const pusher = getPusher();
  if (!pusher) return;
  try {
    await pusher.trigger(cartChannel(userId), CART_CHANGED_EVENT, {});
  } catch (error) {
    console.error(`[realtime] Could not notify cart change for user ${userId}:`, error);
  }
}
