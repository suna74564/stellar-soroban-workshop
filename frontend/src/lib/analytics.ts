import { API_URL } from "./api";

type AnalyticsMetadata = Record<string, string | number | boolean | null | undefined>;

type AnalyticsPayload = {
  eventName: string;
  address?: string;
  walletName?: string;
  txHash?: string;
  metadata?: AnalyticsMetadata;
};

export type LocalAnalyticsEvent = AnalyticsPayload & {
  sessionId: string;
  createdAt: string;
};

const STORAGE_KEY = "proofbull.analytics.events";
const SESSION_KEY = "proofbull.analytics.session";
const MAX_LOCAL_EVENTS = 80;

function storageAvailable() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getSessionId() {
  if (!storageAvailable()) return createId();

  const existingSession = window.localStorage.getItem(SESSION_KEY);
  if (existingSession) return existingSession;

  const nextSession = createId();
  window.localStorage.setItem(SESSION_KEY, nextSession);
  return nextSession;
}

export function readLocalAnalytics(): LocalAnalyticsEvent[] {
  if (!storageAvailable()) return [];

  try {
    const rawEvents = window.localStorage.getItem(STORAGE_KEY);
    return rawEvents ? JSON.parse(rawEvents) : [];
  } catch {
    return [];
  }
}

function writeLocalAnalytics(event: LocalAnalyticsEvent) {
  if (!storageAvailable()) return;

  const nextEvents = [event, ...readLocalAnalytics()].slice(0, MAX_LOCAL_EVENTS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEvents));
}

function sendAnalytics(event: LocalAnalyticsEvent) {
  const body = JSON.stringify(event);

  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon(`${API_URL}/api/analytics`, blob)) return;
  }

  void fetch(`${API_URL}/api/analytics`, {
    body,
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    method: "POST",
  }).catch(() => undefined);
}

export function trackEvent(payload: AnalyticsPayload) {
  const event = {
    ...payload,
    sessionId: getSessionId(),
    createdAt: new Date().toISOString(),
  };

  writeLocalAnalytics(event);
  sendAnalytics(event);

  return event;
}

export function trackPerformance(address?: string) {
  if (typeof performance === "undefined") return;

  const navigation = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  if (!navigation) return;

  trackEvent({
    eventName: "performance_navigation",
    address,
    metadata: {
      durationMs: Math.round(navigation.duration),
      transferSize: Math.round(navigation.transferSize ?? 0),
    },
  });
}
