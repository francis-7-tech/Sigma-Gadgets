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

export async function notifyCartChanged(userId: string): Promise<void> {
  const pusher = getPusher();
  if (!pusher) return;
  try {
    await pusher.trigger(cartChannel(userId), CART_CHANGED_EVENT, {});
  } catch (error) {
    console.error(`[realtime] Could not notify cart change for user ${userId}:`, error);
  }
}
