import { API_URL } from "./api";

export type MonitoringSummary = {
  health: {
    ok: boolean;
    network: string;
    uptimeSeconds: number;
    timestamp: string;
  };
  analytics: {
    totalEvents: number;
    uniqueWallets: number;
    walletConnections: number;
    checkIns: number;
    errors: number;
    lastEventAt: string | null;
  };
  interactions: {
    minimumRequiredWallets: number;
    uniqueWallets: number;
    requirementMet: boolean;
    checkIns: number;
  };
  feedback: {
    totalFeedback: number;
    averageRating: number | null;
  };
};

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }

  return response.json();
}

export async function fetchMonitoringSummary(): Promise<MonitoringSummary> {
  const [health, analytics, interactions, feedback] = await Promise.all([
    fetchJson<MonitoringSummary["health"]>("/api/health"),
    fetchJson<MonitoringSummary["analytics"]>("/api/analytics/summary"),
    fetchJson<MonitoringSummary["interactions"]>("/api/interactions/proof"),
    fetchJson<MonitoringSummary["feedback"]>("/api/feedback/summary"),
  ]);

  return {
    health,
    analytics,
    interactions,
    feedback,
  };
}
