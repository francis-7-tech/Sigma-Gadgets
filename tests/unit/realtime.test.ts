import { beforeEach, describe, expect, it, vi } from "vitest";

const pusher = vi.hoisted(() => ({ constructed: vi.fn(), trigger: vi.fn() }));

vi.mock("pusher", () => ({
  default: class {
    constructor(options: unknown) {
      pusher.constructed(options);
    }
    trigger = pusher.trigger;
    authorizeChannel = (socketId: string, channel: string) => ({ auth: `key:signed(${socketId}:${channel})` });
  },
}));

async function loadWith(env: Record<string, string>) {
  vi.resetModules();
  for (const name of ["PUSHER_APP_ID", "PUSHER_KEY", "PUSHER_SECRET", "PUSHER_CLUSTER"]) {
    vi.stubEnv(name, env[name] ?? "");
  }
  return import("@/lib/realtime");
}

const keys = { PUSHER_APP_ID: "123456", PUSHER_KEY: "key", PUSHER_SECRET: "secret", PUSHER_CLUSTER: "eu" };

beforeEach(() => {
  pusher.constructed.mockReset();
  pusher.trigger.mockReset().mockResolvedValue({});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("notifyCartChanged", () => {
  it("sends an empty signal on the user's private channel", async () => {
    const { notifyCartChanged } = await loadWith(keys);

    await notifyCartChanged("user-1");

    expect(pusher.constructed).toHaveBeenCalledWith(expect.objectContaining({ appId: "123456", cluster: "eu", useTLS: true }));
    expect(pusher.trigger).toHaveBeenCalledExactlyOnceWith("private-cart-user-1", "cart-changed", {});
  });

  it("does nothing when Pusher isn't configured", async () => {
    const { notifyCartChanged } = await loadWith({ ...keys, PUSHER_SECRET: "" });

    await notifyCartChanged("user-1");

    expect(pusher.constructed).not.toHaveBeenCalled();
    expect(pusher.trigger).not.toHaveBeenCalled();
  });

  it("never throws when Pusher fails, so the cart change still succeeds", async () => {
    pusher.trigger.mockRejectedValue(new Error("Pusher is down"));
    const { notifyCartChanged } = await loadWith(keys);

    await expect(notifyCartChanged("user-1")).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  it("uses a different private channel for each user", async () => {
    const { cartChannel } = await loadWith(keys);

    expect(cartChannel("a")).toBe("private-cart-a");
    expect(cartChannel("a")).not.toBe(cartChannel("b"));
  });
});

describe("authorizeCartChannel", () => {
  it("signs a subscription to the user's own cart channel", async () => {
    const { authorizeCartChannel } = await loadWith(keys);

    expect(authorizeCartChannel("user-1", "1234.5678", "private-cart-user-1")).toEqual({
      ok: true,
      auth: "key:signed(1234.5678:private-cart-user-1)",
    });
  });

  it("refuses another user's channel, other channels and malformed socket ids", async () => {
    const { authorizeCartChannel } = await loadWith(keys);

    for (const [socketId, channel] of [
      ["1234.5678", "private-cart-user-2"],
      ["1234.5678", "private-orders-user-1"],
      ["1234.5678", "cart-user-1"],
      ["not-a-socket", "private-cart-user-1"],
    ]) {
      expect(authorizeCartChannel("user-1", socketId, channel), channel).toEqual({ ok: false, reason: "forbidden" });
    }
  });

  it("reports when Pusher isn't configured", async () => {
    const { authorizeCartChannel, getRealtimeConfig } = await loadWith({});

    expect(authorizeCartChannel("user-1", "1234.5678", "private-cart-user-1")).toEqual({ ok: false, reason: "unavailable" });
    expect(getRealtimeConfig("user-1")).toBeNull();
  });
});

describe("getRealtimeConfig", () => {
  it("gives the app the public key, cluster and its own channel, never the secret", async () => {
    const { getRealtimeConfig } = await loadWith(keys);

    expect(getRealtimeConfig("user-1")).toEqual({ key: "key", cluster: "eu", channel: "private-cart-user-1", event: "cart-changed" });
  });
});
