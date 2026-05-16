import { signTransaction } from "@stellar/freighter-api";
import * as Checkin from "checkin";

export const RPC_URL =
  import.meta.env.VITE_SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org";

export const CHECKIN_CONTRACT_ID = Checkin.networks.testnet.contractId;
export const NETWORK_PASSPHRASE = Checkin.networks.testnet.networkPassphrase;

export function createCheckinClient(publicKey?: string) {
  return new Checkin.Client({
    ...Checkin.networks.testnet,
    rpcUrl: RPC_URL,
    publicKey,
    signTransaction: (xdr, options) =>
      signTransaction(xdr, {
        ...options,
        address: publicKey,
        networkPassphrase: NETWORK_PASSPHRASE,
      }),
  });
}
