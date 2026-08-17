export const DEFAULT_LEVEL_TARGET_WALLETS = 50;

export type ProofProgressInput = {
  activeWallets?: number;
  uniqueWallets?: number;
  analyticsWallets?: number;
  transactionCount?: number;
  targetWallets?: number;
  requirementMet?: boolean;
};

export type ProofProgress = {
  activeWallets: number;
  connectedWallets: number;
  transactionCount: number;
  targetWallets: number;
  remainingWallets: number;
  percentage: number;
  requirementMet: boolean;
  statusLabel: string;
};

function positiveNumber(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : 0;
}

export function createProofProgress(input: ProofProgressInput): ProofProgress {
  const targetWallets =
    positiveNumber(input.targetWallets) || DEFAULT_LEVEL_TARGET_WALLETS;
  const activeWallets = positiveNumber(input.activeWallets);
  const connectedWallets = Math.max(
    activeWallets,
    positiveNumber(input.uniqueWallets),
    positiveNumber(input.analyticsWallets),
  );
  const transactionCount = positiveNumber(input.transactionCount);
  const requirementMet =
    Boolean(input.requirementMet) || activeWallets >= targetWallets;
  const remainingWallets = Math.max(targetWallets - activeWallets, 0);
  const percentage = Math.min(
    100,
    Math.round((activeWallets / targetWallets) * 100),
  );

  return {
    activeWallets,
    connectedWallets,
    transactionCount,
    targetWallets,
    remainingWallets,
    percentage,
    requirementMet,
    statusLabel: requirementMet
      ? "Ready for Level 5"
      : `${remainingWallets} active wallets needed`,
  };
}
