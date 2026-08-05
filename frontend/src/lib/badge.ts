import * as Badge from "badge";
import { RPC_URL } from "./network";

export const BADGE_CONTRACT_ID = Badge.networks.testnet.contractId;

export function createBadgeClient(publicKey?: string) {
  return new Badge.Client({
    ...Badge.networks.testnet,
    rpcUrl: RPC_URL,
    publicKey,
  });
}
