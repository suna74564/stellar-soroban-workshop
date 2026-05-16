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
