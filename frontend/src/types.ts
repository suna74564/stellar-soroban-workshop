export type NetworkDetails = {
  network: string;
  networkUrl: string;
  networkPassphrase: string;
  sorobanRpcUrl?: string;
};

export type Balance = {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  balance: string;
};

export type AccountDetails = {
  address: string;
  network: "testnet";
  horizonUrl: string;
  sequence: string;
  subentryCount: number;
  lastModifiedLedger: number;
  xlmBalance: string;
  balances: Balance[];
};

export type ContractStats = {
  walletCount: number;
  totalCount: number;
};

export type WalletOption = {
  id: string;
  name: string;
  isAvailable: boolean;
  isPlatformWrapper: boolean;
  icon: string;
  url: string;
};

export type WalletSession = {
  address: string;
  walletId: string;
  walletName: string;
};

export type AppErrorType =
  | "wallet_not_found"
  | "wallet_rejected"
  | "insufficient_balance"
  | "wrong_network"
  | "contract"
  | "network"
  | "unknown";

export type TransactionPhase =
  | "idle"
  | "signature"
  | "pending"
  | "success"
  | "failed";

export type TransactionState = {
  phase: TransactionPhase;
  label: string;
  hash?: string;
};

export type CheckinEvent = {
  id: string;
  ledger: number;
  closedAt: string;
  txHash: string;
  user: string;
  userCount: number;
  totalCount: number;
};
