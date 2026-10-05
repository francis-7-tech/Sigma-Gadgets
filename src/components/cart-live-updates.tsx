"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type CartLiveUpdatesProps = { pusherKey: string; cluster: string; channel: string; event: string };

export function CartLiveUpdates({ pusherKey, cluster, channel, event }: CartLiveUpdatesProps) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    let disconnect: (() => void) | undefined;

    import("pusher-js").then(({ default: Pusher }) => {
      if (cancelled) return;
      const pusher = new Pusher(pusherKey, {
        cluster,
        channelAuthorization: { endpoint: "/api/v1/realtime/auth", transport: "ajax" },
      });
      pusher.subscribe(channel).bind(event, () => router.refresh());
      disconnect = () => pusher.disconnect();
    });

    return () => {
      cancelled = true;
      disconnect?.();
    };
  }, [pusherKey, cluster, channel, event, router]);

  return null;
}
