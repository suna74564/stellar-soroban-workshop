import type { CheckinEvent } from "../types";

export function badgeTier(score: number) {
  if (score >= 80) return "Oracle";
  if (score >= 50) return "Builder";
  if (score >= 20) return "Scout";
  if (score > 0) return "Starter";
  return "Unstamped";
}

export function nextTierProgress(score: number) {
  if (score >= 80) return 100;
  if (score >= 50) return Math.round(((score - 50) / 30) * 100);
  if (score >= 20) return Math.round(((score - 20) / 30) * 100);
  if (score > 0) return Math.round((score / 20) * 100);
  return 0;
}

export function mergeCheckinEvents(
  current: CheckinEvent[],
  incoming: CheckinEvent[],
) {
  const byId = new Map<string, CheckinEvent>();

  for (const event of [...incoming, ...current]) {
    byId.set(event.id, event);
  }

  return Array.from(byId.values())
    .sort((a, b) => b.ledger - a.ledger || b.id.localeCompare(a.id))
    .slice(0, 8);
}
