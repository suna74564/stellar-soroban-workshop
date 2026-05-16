import type { AccountDetails } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export async function fetchAccount(address: string): Promise<AccountDetails> {
  const response = await fetch(`${API_URL}/api/account/${address}`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? "Account details could not be loaded.");
  }

  return payload;
}
