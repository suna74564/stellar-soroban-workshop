import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit/sdk";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";
import { Networks } from "@creit.tech/stellar-wallets-kit/types";
import type { ISupportedWallet } from "@creit.tech/stellar-wallets-kit/types";
import { AppError } from "./errors";
import {
  HORIZON_TESTNET_URL,
  NETWORK_PASSPHRASE,
  RPC_URL,
} from "./network";
import type { NetworkDetails, WalletOption, WalletSession } from "../types";

let initialized = false;

export const TESTNET_DETAILS: NetworkDetails = {
  network: "TESTNET",
  networkUrl: HORIZON_TESTNET_URL,
  networkPassphrase: NETWORK_PASSPHRASE,
  sorobanRpcUrl: RPC_URL,
};

function mapWallet(wallet: ISupportedWallet): WalletOption {
  return {
    id: wallet.id,
    name: wallet.name,
    isAvailable: wallet.isAvailable,
    isPlatformWrapper: wallet.isPlatformWrapper,
    icon: wallet.icon,
    url: wallet.url,
  };
}

export function initWalletKit() {
  if (initialized || typeof window === "undefined") return;

  StellarWalletsKit.init({
    modules: defaultModules(),
    network: Networks.TESTNET,
    authModal: {
      showInstallLabel: true,
      hideUnsupportedWallets: false,
    },
  });

  initialized = true;
}

export async function loadWalletOptions(): Promise<WalletOption[]> {
  initWalletKit();
  const wallets = await StellarWalletsKit.refreshSupportedWallets();
  return wallets.map(mapWallet);
}

export async function connectWalletKit(): Promise<WalletSession> {
  initWalletKit();
  const { address } = await StellarWalletsKit.authModal();
  const selectedWallet = StellarWalletsKit.selectedModule;

  if (!address) {
    throw new AppError("wallet_rejected", "Cüzdan erişimi verilmedi.");
  }

  return {
    address,
    walletId: selectedWallet.productId,
    walletName: selectedWallet.productName,
  };
}

export async function disconnectWalletKit() {
  initWalletKit();
  await StellarWalletsKit.disconnect();
}

export async function getWalletNetworkDetails(): Promise<NetworkDetails> {
  initWalletKit();
  const network = await StellarWalletsKit.getNetwork();

  return {
    ...TESTNET_DETAILS,
    network: network.network || TESTNET_DETAILS.network,
    networkPassphrase:
      network.networkPassphrase || TESTNET_DETAILS.networkPassphrase,
  };
}

export async function assertWalletIsOnTestnet() {
  const network = await getWalletNetworkDetails();

  if (network.networkPassphrase !== NETWORK_PASSPHRASE) {
    throw new AppError(
      "wrong_network",
      "Cüzdan ağı Testnet değil. Lütfen Stellar Testnet ağına geçin.",
    );
  }

  return network;
}

export async function signWithSelectedWallet(xdr: string, address?: string) {
  initWalletKit();
  return StellarWalletsKit.signTransaction(xdr, {
    address,
    networkPassphrase: NETWORK_PASSPHRASE,
  });
}
