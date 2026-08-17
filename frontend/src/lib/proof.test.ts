import { describe, expect, it } from "vitest";
import {
  DEFAULT_LEVEL_TARGET_WALLETS,
  createProofProgress,
} from "./proof";

describe("Level 5 proof progress", () => {
  it("defaults to the Blue Belt 50-wallet target", () => {
    const progress = createProofProgress({ activeWallets: 12 });

    expect(progress.targetWallets).toBe(DEFAULT_LEVEL_TARGET_WALLETS);
    expect(progress.remainingWallets).toBe(38);
    expect(progress.percentage).toBe(24);
  });

  it("uses active transaction wallets for completion", () => {
    const progress = createProofProgress({
      activeWallets: 8,
      uniqueWallets: 50,
      targetWallets: 50,
    });

    expect(progress.connectedWallets).toBe(50);
    expect(progress.requirementMet).toBe(false);
    expect(progress.statusLabel).toBe("42 active wallets needed");
  });

  it("caps completed progress at one hundred percent", () => {
    const progress = createProofProgress({
      activeWallets: 55,
      targetWallets: 50,
      transactionCount: 60,
    });

    expect(progress.remainingWallets).toBe(0);
    expect(progress.percentage).toBe(100);
    expect(progress.requirementMet).toBe(true);
    expect(progress.statusLabel).toBe("Ready for Level 5");
  });
});
