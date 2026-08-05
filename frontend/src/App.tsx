import {
  Activity,
  BadgeCheck,
  Clock3,
  ExternalLink,
  Loader2,
  LogOut,
  RefreshCw,
  ShieldAlert,
  Wallet,
  Wifi,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchAccount } from "./lib/account";
import { BADGE_CONTRACT_ID, createBadgeClient } from "./lib/badge";
import {
  CHECKIN_CONTRACT_ID,
  NETWORK_PASSPHRASE,
  createCheckinClient,
} from "./lib/checkin";
import { classifyError, ensureSpendableTestnetBalance } from "./lib/errors";
import { fetchCheckinEvents } from "./lib/events";
import { badgeTier, mergeCheckinEvents, nextTierProgress } from "./lib/reputation";
import {
  assertWalletIsOnTestnet,
  connectWalletKit,
  disconnectWalletKit,
  getWalletNetworkDetails,
  initWalletKit,
  loadWalletOptions,
  TESTNET_DETAILS,
} from "./lib/wallets";
import type {
  AccountDetails,
  AppErrorType,
  BadgeStats,
  CheckinEvent,
  ContractStats,
  NetworkDetails,
  TransactionState,
  WalletOption,
  WalletSession,
} from "./types";

const explorerUrl = `https://stellar.expert/explorer/testnet/contract/${CHECKIN_CONTRACT_ID}`;
const labUrl = `https://lab.stellar.org/r/testnet/contract/${CHECKIN_CONTRACT_ID}`;
const initialTransaction: TransactionState = {
  phase: "idle",
  label: "No transaction yet",
};

const errorTitles: Record<AppErrorType, string> = {
  wallet_not_found: "Wallet not found",
  wallet_rejected: "Signature rejected",
  insufficient_balance: "Insufficient balance",
  wrong_network: "Wrong network",
  contract: "Contract error",
  network: "Network error",
  unknown: "Unexpected error",
};

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

function transactionUrl(hash?: string) {
  if (!hash) return "";
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}

export default function App() {
  const [wallet, setWallet] = useState<WalletSession | null>(null);
  const [walletOptions, setWalletOptions] = useState<WalletOption[]>([]);
  const [network, setNetwork] = useState<NetworkDetails>(TESTNET_DETAILS);
  const [account, setAccount] = useState<AccountDetails | null>(null);
  const [stats, setStats] = useState<ContractStats>({
    walletCount: 0,
    totalCount: 0,
  });
  const [badgeStats, setBadgeStats] = useState<BadgeStats>({
    score: 0,
    totalBadges: 0,
  });
  const [events, setEvents] = useState<CheckinEvent[]>([]);
  const [latestLedger, setLatestLedger] = useState<number | null>(null);
  const [transaction, setTransaction] =
    useState<TransactionState>(initialTransaction);
  const [status, setStatus] = useState("Ready for Testnet");
  const [error, setError] = useState<ReturnType<typeof classifyError> | null>(
    null,
  );
  const [isBusy, setIsBusy] = useState(false);
  const [isEventSyncing, setIsEventSyncing] = useState(false);
  const eventCursor = useRef("");

  const address = wallet?.address ?? "";
  const connected = Boolean(wallet);
  const client = useMemo(() => createCheckinClient(address), [address]);
  const currentTier = badgeTier(badgeStats.score);
  const tierProgress = nextTierProgress(badgeStats.score);

  const refreshWalletOptions = useCallback(async () => {
    try {
      setWalletOptions(await loadWalletOptions());
    } catch (nextError) {
      setError(classifyError(nextError));
    }
  }, []);

  const refreshContract = useCallback(async (walletAddress: string) => {
    const readClient = createCheckinClient(walletAddress);
    const [walletTx, totalTx] = await Promise.all([
      readClient.get_count({ user: walletAddress }),
      readClient.total(),
    ]);

    setStats({
      walletCount: Number(walletTx.result),
      totalCount: Number(totalTx.result),
    });
  }, []);

  const refreshBadge = useCallback(async (walletAddress: string) => {
    const readClient = createBadgeClient(walletAddress);
    const [scoreTx, totalBadgesTx] = await Promise.all([
      readClient.score({ user: walletAddress }),
      readClient.total_badges(),
    ]);

    setBadgeStats({
      score: Number(scoreTx.result),
      totalBadges: Number(totalBadgesTx.result),
    });
  }, []);

  const refreshEvents = useCallback(async (quiet = true) => {
    setIsEventSyncing(true);

    try {
      const nextEvents = await fetchCheckinEvents(eventCursor.current || undefined);
      eventCursor.current = nextEvents.cursor || eventCursor.current;
      setLatestLedger(nextEvents.latestLedger);

      if (nextEvents.events.length > 0) {
        setEvents((current) => mergeCheckinEvents(current, nextEvents.events));
        if (!quiet) {
          setStatus(`${nextEvents.events.length} contract event synced`);
        }
      } else if (!quiet) {
        setStatus("No new contract events");
      }
    } catch (nextError) {
      if (!quiet) setError(classifyError(nextError));
    } finally {
      setIsEventSyncing(false);
    }
  }, []);

  const refreshAccount = useCallback(
    async (walletAddress = address) => {
      if (!walletAddress) return;

      setIsBusy(true);
      setError(null);

      try {
        const [nextAccount, nextNetwork] = await Promise.all([
          fetchAccount(walletAddress),
          getWalletNetworkDetails().catch(() => TESTNET_DETAILS),
          refreshContract(walletAddress),
          refreshBadge(walletAddress),
        ]);

        setAccount(nextAccount);
        setNetwork(nextNetwork);
        setStatus("Testnet state refreshed");
      } catch (nextError) {
        setError(classifyError(nextError));
      } finally {
        setIsBusy(false);
      }
    },
    [address, refreshBadge, refreshContract],
  );

  useEffect(() => {
    initWalletKit();
    void refreshWalletOptions();

    const timer = window.setInterval(() => {
      void refreshWalletOptions();
    }, 20000);

    return () => window.clearInterval(timer);
  }, [refreshWalletOptions]);

  useEffect(() => {
    void refreshEvents(false);

    const timer = window.setInterval(() => {
      void refreshEvents(true);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [refreshEvents]);

  async function connectWallet() {
    setIsBusy(true);
    setError(null);
    setStatus("Opening wallet selector");

    try {
      const nextWallet = await connectWalletKit();
      const walletNetwork = await assertWalletIsOnTestnet();

      setWallet(nextWallet);
      setNetwork(walletNetwork);
      setStatus(`${nextWallet.walletName} connected`);
      await refreshAccount(nextWallet.address);
    } catch (nextError) {
      setError(classifyError(nextError));
      setStatus("Wallet connection failed");
    } finally {
      setIsBusy(false);
    }
  }

  async function disconnectWallet() {
    await disconnectWalletKit().catch(() => undefined);
    setWallet(null);
    setNetwork(TESTNET_DETAILS);
    setAccount(null);
    setStats({ walletCount: 0, totalCount: 0 });
    setBadgeStats({ score: 0, totalBadges: 0 });
    setTransaction(initialTransaction);
    setError(null);
    setStatus("Wallet disconnected");
  }

  async function checkIn() {
    if (!address) return;

    setIsBusy(true);
    setError(null);
    setStatus("Preparing contract call");
    setTransaction({
      phase: "signature",
      label: "Preparing transaction for wallet signature",
    });

    try {
      await assertWalletIsOnTestnet();
      ensureSpendableTestnetBalance(account);

      const tx = await client.check_in({ user: address });
      let pendingHash = "";

      setTransaction({
        phase: "signature",
        label: "Review and sign in your wallet",
      });

      const sent = await tx.signAndSend({
        watcher: {
          onSubmitted(response) {
            pendingHash = response?.hash ?? pendingHash;
            setTransaction({
              phase: "pending",
              label: "Submitted to Stellar Testnet",
              hash: pendingHash,
            });
          },
          onProgress(response) {
            pendingHash = response?.txHash ?? pendingHash;
            setTransaction({
              phase: "pending",
              label: `Ledger confirmation: ${response?.status ?? "PENDING"}`,
              hash: pendingHash,
            });
          },
        },
      });

      const hash =
        sent.getTransactionResponse?.txHash ??
        sent.sendTransactionResponse?.hash ??
        pendingHash;

      setTransaction({
        phase: "success",
        label: `Success. Your check-in count is ${sent.result}`,
        hash,
      });
      setStatus("Contract call confirmed");
      await refreshAccount(address);
      await refreshEvents(false);
    } catch (nextError) {
      const appError = classifyError(nextError);
      setError(appError);
      setTransaction({
        phase: "failed",
        label: appError.message,
      });
      setStatus("Contract call failed");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <main className="app-frame">
      {error && (
        <div className="toast-error">
          <ShieldAlert size={18} />
          <div>
            <strong>{errorTitles[error.type]}</strong>
            <span>{error.message}</span>
          </div>
        </div>
      )}

      <aside className="identity-rail">
        <div className="brand-lockup">
          <span>Yellow Belt // Level 2</span>
          <h1>ProofBull</h1>
          <p>Live Soroban checkpoint</p>
        </div>

        <div className="passport-stamp">
          <span>PB</span>
          <small>{connected ? "Verified wallet" : "Awaiting wallet"}</small>
        </div>

        <div className="rail-metrics">
          <div>
            <span>Wallet</span>
            <strong>{connected ? shortAddress(address) : "Not connected"}</strong>
            <small>{wallet?.walletName ?? "StellarWalletsKit"}</small>
          </div>
          <div>
            <span>XLM</span>
            <strong>{account?.xlmBalance ?? "0.0000000"}</strong>
            <small>Horizon Testnet</small>
          </div>
          <div>
            <span>Personal proof</span>
            <strong>{stats.walletCount}</strong>
            <small>check-ins</small>
          </div>
          <div>
            <span>Reputation</span>
            <strong>{badgeStats.score}</strong>
            <small>{currentTier}</small>
          </div>
        </div>

        <div className="rail-actions">
          {connected ? (
            <>
              <button
                className="ghost-button"
                onClick={() => refreshAccount()}
                disabled={isBusy}
                type="button"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
              <button
                className="ghost-button"
                onClick={() => void disconnectWallet()}
                type="button"
              >
                <LogOut size={18} />
                Disconnect
              </button>
            </>
          ) : (
            <button
              className="wallet-button"
              onClick={connectWallet}
              disabled={isBusy}
              type="button"
            >
              <Wallet size={18} />
              Choose Wallet
            </button>
          )}
        </div>
      </aside>

      <section className="operations-deck">
        <header className="deck-header">
          <div>
            <span className="deck-kicker">Multi-wallet event terminal</span>
            <h2>Check in, watch the ledger move.</h2>
          </div>
          <div className="sync-pill">
            {isEventSyncing ? <Loader2 className="spin" size={16} /> : <Wifi size={16} />}
            {latestLedger ? `Ledger ${latestLedger}` : "Live sync"}
          </div>
        </header>

        <section className="wallet-dock" aria-label="Wallet options">
          {walletOptions.slice(0, 10).map((option) => (
            <a
              className={`wallet-chip ${option.isAvailable ? "available" : ""}`}
              href={option.url}
              key={option.id}
              rel="noreferrer"
              target="_blank"
              title={option.isAvailable ? "Available" : "Install or open wallet"}
            >
              {option.icon && <img alt="" src={option.icon} />}
              <span>{option.name}</span>
            </a>
          ))}
        </section>

        <section className="checkin-terminal">
          <div className="terminal-copy">
            <span className="terminal-label">Soroban contract</span>
            <strong>Wallet Check-in</strong>
            <code>{CHECKIN_CONTRACT_ID}</code>
            <span className="terminal-label badge-label">Badge contract</span>
            <code>{BADGE_CONTRACT_ID}</code>
          </div>

          <div className="terminal-action">
            <button
              className="launch-button"
              onClick={checkIn}
              disabled={!connected || isBusy}
              type="button"
            >
              {isBusy ? (
                <Loader2 className="spin" size={20} />
              ) : (
                <BadgeCheck size={20} />
              )}
              Check in on-chain
            </button>
            <div className="terminal-links">
              <a href={explorerUrl} target="_blank" rel="noreferrer">
                Explorer <ExternalLink size={14} />
              </a>
              <a href={labUrl} target="_blank" rel="noreferrer">
                Stellar Lab <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </section>

        <section className="status-board">
          <article className={`status-ticket ${transaction.phase}`}>
            <Clock3 size={20} />
            <div>
              <span>Transaction</span>
              <strong>{transaction.label}</strong>
              <small>{status}</small>
              {transaction.hash && (
                <a href={transactionUrl(transaction.hash)} target="_blank" rel="noreferrer">
                  {shortAddress(transaction.hash)}
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </article>

          <article className="total-proof">
            <span>Badge holders</span>
            <strong>{badgeStats.totalBadges}</strong>
            <small>
              {stats.totalCount} total proofs / {tierProgress}% tier progress
            </small>
          </article>
        </section>

        <section className="lower-deck">
          <article className="account-sheet">
            <div className="section-title">
              <span>Account telemetry</span>
              <BadgeCheck size={16} />
            </div>
            <dl>
              <div>
                <dt>Sequence</dt>
                <dd>{account?.sequence ?? "-"}</dd>
              </div>
              <div>
                <dt>Subentries</dt>
                <dd>{account?.subentryCount ?? "-"}</dd>
              </div>
              <div>
                <dt>Last ledger</dt>
                <dd>{account?.lastModifiedLedger ?? "-"}</dd>
              </div>
              <div>
                <dt>Network passphrase</dt>
                <dd>{network.networkPassphrase ?? NETWORK_PASSPHRASE}</dd>
              </div>
            </dl>
          </article>

          <article className="event-tape">
            <div className="section-title">
              <span>Contract event tape</span>
              <button
                className="mini-button"
                onClick={() => refreshEvents(false)}
                title="Refresh events"
                type="button"
              >
                {isEventSyncing ? (
                  <Loader2 className="spin" size={16} />
                ) : (
                  <Activity size={16} />
                )}
              </button>
            </div>
            <div className="event-stack">
              {events.map((event) => (
                <a
                  className="event-ticket"
                  href={transactionUrl(event.txHash)}
                  key={event.id}
                  rel="noreferrer"
                  target="_blank"
                >
                  <span>{shortAddress(event.user)}</span>
                  <strong>
                    #{event.userCount} wallet / score {event.badgeScore}
                  </strong>
                  <small>Ledger {event.ledger}</small>
                </a>
              ))}
              {!events.length && <span className="empty">No check-in events loaded</span>}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
