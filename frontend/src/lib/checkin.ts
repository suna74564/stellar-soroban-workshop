import * as Checkin from "checkin";
import { NETWORK_PASSPHRASE, RPC_URL } from "./network";
import { signWithSelectedWallet } from "./wallets";

export const CHECKIN_CONTRACT_ID = Checkin.networks.testnet.contractId;

export function createCheckinClient(publicKey?: string) {
  return new Checkin.Client({
    ...Checkin.networks.testnet,
    rpcUrl: RPC_URL,
    publicKey,
    signTransaction: (xdr) => signWithSelectedWallet(xdr, publicKey),
  });
}

export { NETWORK_PASSPHRASE, RPC_URL };
