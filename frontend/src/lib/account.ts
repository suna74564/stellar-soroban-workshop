import type { AccountDetails } from "../types";
import { API_URL } from "./api";

export async function fetchAccount(address: string): Promise<AccountDetails> {
  const response = await fetch(`${API_URL}/api/account/${address}`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? "Account details could not be loaded.");
  }

  return payload;
}
