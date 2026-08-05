import { describe, expect, it } from "vitest";
import {
  badgeTier,
  mergeCheckinEvents,
  nextTierProgress,
} from "./reputation";
import type { CheckinEvent } from "../types";

function event(id: string, ledger: number): CheckinEvent {
  return {
    id,
    ledger,
    closedAt: "2026-08-05T00:00:00Z",
    txHash: `hash-${id}`,
    user: `G${id}`,
    userCount: ledger,
    totalCount: ledger,
    badgeScore: ledger,
  };
}

describe("reputation helpers", () => {
  it("maps badge score to production tiers", () => {
    expect(badgeTier(0)).toBe("Unstamped");
    expect(badgeTier(10)).toBe("Starter");
    expect(badgeTier(20)).toBe("Scout");
    expect(badgeTier(50)).toBe("Builder");
    expect(badgeTier(80)).toBe("Oracle");
  });

  it("calculates progress toward the next tier", () => {
    expect(nextTierProgress(0)).toBe(0);
    expect(nextTierProgress(10)).toBe(50);
    expect(nextTierProgress(35)).toBe(50);
    expect(nextTierProgress(65)).toBe(50);
    expect(nextTierProgress(100)).toBe(100);
  });

  it("merges live events by id and sorts newest ledgers first", () => {
    const merged = mergeCheckinEvents(
      [event("old", 1), event("dupe", 2)],
      [event("new", 5), event("dupe", 3)],
    );

    expect(merged.map((item) => item.id)).toEqual(["new", "dupe", "old"]);
    expect(merged).toHaveLength(3);
  });

  it("keeps the event tape bounded", () => {
    const incoming = Array.from({ length: 12 }, (_, index) =>
      event(`event-${index}`, index),
    );

    expect(mergeCheckinEvents([], incoming)).toHaveLength(8);
  });
});
