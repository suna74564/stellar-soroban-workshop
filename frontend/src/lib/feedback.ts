import { API_URL } from "./api";

export type FeedbackPayload = {
  address?: string;
  category: string;
  rating: number;
  message: string;
  txHash?: string;
};

export async function submitFeedback(payload: FeedbackPayload) {
  const response = await fetch(`${API_URL}/api/feedback`, {
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error ?? "Feedback could not be saved.");
  }

  return result;
}
