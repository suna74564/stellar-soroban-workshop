import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSessionId, readLocalAnalytics, trackEvent } from "./analytics";

function createStorage() {
  const store = new Map<string, string>();

  return {
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    removeItem: (key: string) => store.delete(key),
    setItem: (key: string, value: string) => store.set(key, value),
  };
}

describe("analytics helpers", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.stubGlobal("window", {
      localStorage: createStorage(),
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response(JSON.stringify({ ok: true })))),
    );
  });

  it("keeps a stable session id in local storage", () => {
    const sessionId = getSessionId();

    expect(getSessionId()).toBe(sessionId);
    expect(sessionId.length).toBeGreaterThan(10);
  });

  it("stores a local analytics fallback before sending", () => {
    const event = trackEvent({
      eventName: "wallet_connected",
      address: "GABC",
      metadata: { availableWallets: 2 },
    });

    expect(readLocalAnalytics()[0]).toMatchObject({
      eventName: "wallet_connected",
      sessionId: event.sessionId,
    });
    expect(fetch).toHaveBeenCalledOnce();
  });
});
