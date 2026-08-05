import type { AccountDetails, AppErrorType } from "../types";

export class AppError extends Error {
  constructor(
    public readonly type: AppErrorType,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function classifyError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  const fallback =
    error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu.";
  const normalized = fallback.toLowerCase();

  if (normalized.includes("account not found") || normalized.includes("friendbot")) {
    return new AppError(
      "insufficient_balance",
      "Testnet hesabı henüz fonlanmamış. Friendbot ile XLM ekleyip tekrar deneyin.",
    );
  }

  if (
    normalized.includes("not installed") ||
    normalized.includes("not found") ||
    normalized.includes("not available") ||
    normalized.includes("extension bulunamad") ||
    normalized.includes("cüzdan bulunamad")
  ) {
    return new AppError(
      "wallet_not_found",
      "Seçilen cüzdan bulunamadı. Bir Stellar cüzdanı kurup tekrar deneyin.",
    );
  }

  if (
    normalized.includes("reject") ||
    normalized.includes("denied") ||
    normalized.includes("declined") ||
    normalized.includes("cancel") ||
    normalized.includes("user closed") ||
    normalized.includes("kullanıcı")
  ) {
    return new AppError(
      "wallet_rejected",
      "İşlem cüzdanda reddedildi veya imza penceresi kapatıldı.",
    );
  }

  if (
    normalized.includes("insufficient") ||
    normalized.includes("underfunded") ||
    normalized.includes("balance") ||
    normalized.includes("bakiye")
  ) {
    return new AppError(
      "insufficient_balance",
      "Yetersiz Testnet XLM bakiyesi. Friendbot ile cüzdanı fonlayıp tekrar deneyin.",
    );
  }

  if (
    normalized.includes("wrong network") ||
    normalized.includes("passphrase") ||
    normalized.includes("testnet değil") ||
    normalized.includes("public global stellar network")
  ) {
    return new AppError(
      "wrong_network",
      "Cüzdan ağı Testnet değil. Cüzdanınızı Stellar Testnet ağına alın.",
    );
  }

  if (
    normalized.includes("rpc") ||
    normalized.includes("horizon") ||
    normalized.includes("fetch")
  ) {
    return new AppError(
      "network",
      "Testnet verisi alınamadı. Backend veya RPC bağlantısını kontrol edin.",
    );
  }

  if (
    normalized.includes("contract") ||
    normalized.includes("soroban") ||
    normalized.includes("transaction")
  ) {
    return new AppError("contract", fallback);
  }

  return new AppError("unknown", fallback);
}

export function ensureSpendableTestnetBalance(account: AccountDetails | null) {
  const xlmBalance = Number(account?.xlmBalance ?? 0);

  if (!Number.isFinite(xlmBalance) || xlmBalance < 1) {
    throw new AppError(
      "insufficient_balance",
      "Yetersiz Testnet XLM bakiyesi. En az 1 XLM olacak şekilde Friendbot ile fonlayın.",
    );
  }
}
