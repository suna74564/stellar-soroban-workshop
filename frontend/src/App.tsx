import {
  Activity,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock3,
  ClipboardCheck,
  ExternalLink,
  HeartPulse,
  Loader2,
  LogOut,
  MessageSquare,
  RefreshCw,
  Send,
  ShieldAlert,
  Star,
  UsersRound,
  Wallet,
  Wifi,
} from "lucide-react";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { fetchAccount } from "./lib/account";
import { trackEvent, trackPerformance } from "./lib/analytics";
import { BADGE_CONTRACT_ID, createBadgeClient } from "./lib/badge";
import {
  CHECKIN_CONTRACT_ID,
  NETWORK_PASSPHRASE,
  createCheckinClient,
} from "./lib/checkin";
import { classifyError, ensureSpendableTestnetBalance } from "./lib/errors";
import { fetchCheckinEvents } from "./lib/events";
import { submitFeedback } from "./lib/feedback";
import {
  fetchMonitoringSummary,
  type MonitoringSummary,
} from "./lib/monitoring";
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
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState("usability");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<
    "idle" | "submitting" | "sent" | "failed"
  >("idle");
  const [monitoring, setMonitoring] = useState<MonitoringSummary | null>(null);
  const [monitoringStatus, setMonitoringStatus] = useState<
    "loading" | "online" | "offline"
  >("loading");
  const [isMonitoringRefreshing, setIsMonitoringRefreshing] = useState(false);
  const [error, setError] = useState<ReturnType<typeof classifyError> | null>(
    null,
  );
  const [isBusy, setIsBusy] = useState(false);
  const [isEventSyncing, setIsEventSyncing] = useState(false);
  const eventCursor = useRef("");
  const trackedWalletOptions = useRef(false);

  const address = wallet?.address ?? "";
  const connected = Boolean(wallet);
  const client = useMemo(() => createCheckinClient(address), [address]);
  const currentTier = badgeTier(badgeStats.score);
  const tierProgress = nextTierProgress(badgeStats.score);
  const hasSpendableBalance = Number(account?.xlmBalance ?? 0) >= 1;
  const hasOnChainProof =
    stats.walletCount > 0 || transaction.phase === "success";
  const onboardingSteps = [
    {
      label: "Wallet",
      detail: connected ? shortAddress(address) : "Connect",
      complete: connected,
    },
    {
      label: "Testnet XLM",
      detail: hasSpendableBalance ? "Ready" : "Fund",
      complete: hasSpendableBalance,
    },
    {
      label: "On-chain proof",
      detail: hasOnChainProof ? `${stats.walletCount} check-ins` : "Pending",
      complete: hasOnChainProof,
    },
    {
      label: "Feedback",
      detail: feedbackStatus === "sent" ? "Saved" : "Open",
      complete: feedbackStatus === "sent",
    },
  ];
  const completedOnboarding = onboardingSteps.filter((step) => step.complete).length;
  const proofWallets =
    monitoring?.interactions.uniqueWallets ?? monitoring?.analytics.uniqueWallets ?? 0;
  const proofRequirementMet = monitoring?.interactions.requirementMet ?? false;

  const refreshWalletOptions = useCallback(async () => {
    try {
      const nextOptions = await loadWalletOptions();
      setWalletOptions(nextOptions);

      if (!trackedWalletOptions.current) {
        trackedWalletOptions.current = true;
        trackEvent({
          eventName: "wallet_options_loaded",
          metadata: {
            availableWallets: nextOptions.filter((option) => option.isAvailable)
              .length,
            totalWallets: nextOptions.length,
          },
        });
      }
    } catch (nextError) {
      const appError = classifyError(nextError);
      setError(appError);
      trackEvent({
        eventName: "app_error",
        metadata: {
          source: "wallet_options",
          type: appError.type,
          message: appError.message.slice(0, 140),
        },
      });
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
          trackEvent({
            eventName: "contract_events_synced",
            metadata: {
              eventCount: nextEvents.events.length,
              latestLedger: nextEvents.latestLedger,
            },
          });
        }
        if (!quiet) {
          setStatus(`${nextEvents.events.length} contract event synced`);
        }
      } else if (!quiet) {
        setStatus("No new contract events");
      }
    } catch (nextError) {
      if (!quiet) {
        const appError = classifyError(nextError);
        setError(appError);
        trackEvent({
          eventName: "app_error",
          address,
          walletName: wallet?.walletName,
          metadata: {
            source: "event_sync",
            type: appError.type,
            message: appError.message.slice(0, 140),
          },
        });
      }
    } finally {
      setIsEventSyncing(false);
    }
  }, [address, wallet?.walletName]);

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
        const appError = classifyError(nextError);
        setError(appError);
        trackEvent({
          eventName: "app_error",
          address: walletAddress,
          walletName: wallet?.walletName,
          metadata: {
            source: "account_refresh",
            type: appError.type,
            message: appError.message.slice(0, 140),
          },
        });
      } finally {
        setIsBusy(false);
      }
    },
    [address, refreshBadge, refreshContract, wallet?.walletName],
  );

  const refreshMonitoring = useCallback(async () => {
    setIsMonitoringRefreshing(true);

    try {
      const summary = await fetchMonitoringSummary();
      setMonitoring(summary);
      setMonitoringStatus("online");
    } catch {
      setMonitoringStatus("offline");
    } finally {
      setIsMonitoringRefreshing(false);
    }
  }, []);

  useEffect(() => {
    initWalletKit();
    trackEvent({ eventName: "app_opened" });

    const performanceTimer = window.setTimeout(() => {
      trackPerformance();
    }, 1200);

    void refreshWalletOptions();

    const timer = window.setInterval(() => {
      void refreshWalletOptions();
    }, 20000);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(performanceTimer);
    };
  }, [refreshWalletOptions]);

  useEffect(() => {
    void refreshEvents(false);

    const timer = window.setInterval(() => {
      void refreshEvents(true);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [refreshEvents]);

  useEffect(() => {
    void refreshMonitoring();

    const timer = window.setInterval(() => {
      void refreshMonitoring();
    }, 30000);

    return () => window.clearInterval(timer);
  }, [refreshMonitoring]);

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
      trackEvent({
        eventName: "wallet_connected",
        address: nextWallet.address,
        walletName: nextWallet.walletName,
        metadata: {
          network: walletNetwork.network,
        },
      });
      await refreshAccount(nextWallet.address);
    } catch (nextError) {
      const appError = classifyError(nextError);
      setError(appError);
      setStatus("Wallet connection failed");
      trackEvent({
        eventName: "app_error",
        metadata: {
          source: "wallet_connect",
          type: appError.type,
          message: appError.message.slice(0, 140),
        },
      });
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
    trackEvent({
      eventName: "wallet_disconnected",
      address,
      walletName: wallet?.walletName,
    });
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
      trackEvent({
        eventName: "checkin_success",
        address,
        walletName: wallet?.walletName,
        txHash: hash,
        metadata: {
          walletCheckins: Number(sent.result),
        },
      });
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
      trackEvent({
        eventName: "app_error",
        address,
        walletName: wallet?.walletName,
        metadata: {
          source: "check_in",
          type: appError.type,
          message: appError.message.slice(0, 140),
        },
      });
    } finally {
      setIsBusy(false);
    }
  }

  async function handleFeedbackSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFeedbackStatus("submitting");
    setError(null);

    try {
      await submitFeedback({
        address,
        category: feedbackCategory,
        rating: feedbackRating,
        message: feedbackMessage,
        txHash: transaction.hash,
      });
      setFeedbackStatus("sent");
      setFeedbackMessage("");
      setStatus("Feedback saved");
      trackEvent({
        eventName: "feedback_submitted",
        address,
        walletName: wallet?.walletName,
        metadata: {
          category: feedbackCategory,
          rating: feedbackRating,
        },
      });
    } catch (nextError) {
      const appError = classifyError(nextError);
      setError(appError);
      setFeedbackStatus("failed");
      trackEvent({
        eventName: "app_error",
        address,
        walletName: wallet?.walletName,
        metadata: {
          source: "feedback",
          type: appError.type,
          message: appError.message.slice(0, 140),
        },
      });
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
          <span>Orange Belt // Level 3</span>
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

        <section className="activation-panel">
          <article className="onboarding-card">
            <div className="section-title">
              <span>Real user activation</span>
              <ClipboardCheck size={16} />
            </div>
            <div className="activation-score">
              <strong>
                {completedOnboarding}/{onboardingSteps.length}
              </strong>
              <span>Level 4 readiness</span>
            </div>
            <div className="onboarding-steps">
              {onboardingSteps.map((step) => (
                <div
                  className={`onboarding-step ${step.complete ? "complete" : ""}`}
                  key={step.label}
                >
                  <CheckCircle2 size={18} />
                  <span>{step.label}</span>
                  <strong>{step.detail}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="feedback-card">
            <div className="section-title">
              <span>User feedback</span>
              <MessageSquare size={16} />
            </div>
            <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
              <div className="rating-row" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    aria-label={`${rating} star rating`}
                    className={rating <= feedbackRating ? "active" : ""}
                    key={rating}
                    onClick={() => setFeedbackRating(rating)}
                    type="button"
                  >
                    <Star size={18} />
                  </button>
                ))}
              </div>
              <label>
                <span>Category</span>
                <select
                  onChange={(event) => setFeedbackCategory(event.target.value)}
                  value={feedbackCategory}
                >
                  <option value="usability">Usability</option>
                  <option value="wallet">Wallet flow</option>
                  <option value="trust">Trust signal</option>
                  <option value="performance">Performance</option>
                </select>
              </label>
              <label>
                <span>Feedback</span>
                <textarea
                  minLength={3}
                  onChange={(event) => {
                    setFeedbackMessage(event.target.value);
                    setFeedbackStatus("idle");
                  }}
                  placeholder="What would make ProofBull more useful?"
                  required
                  rows={3}
                  value={feedbackMessage}
                />
              </label>
              <button
                className="submit-feedback"
                disabled={feedbackStatus === "submitting"}
                type="submit"
              >
                {feedbackStatus === "submitting" ? (
                  <Loader2 className="spin" size={18} />
                ) : (
                  <Send size={18} />
                )}
                {feedbackStatus === "sent" ? "Saved" : "Send feedback"}
              </button>
              {feedbackStatus === "failed" && (
                <small className="feedback-note">Feedback was not saved.</small>
              )}
            </form>
          </article>
        </section>

        <section className="monitoring-strip" aria-label="Monitoring and analytics">
          <article className={`monitor-tile ${monitoringStatus}`}>
            <HeartPulse size={20} />
            <span>Backend</span>
            <strong>{monitoringStatus === "online" ? "Online" : "Offline"}</strong>
            <small>
              {monitoring?.health.uptimeSeconds
                ? `${monitoring.health.uptimeSeconds}s uptime`
                : "Awaiting API"}
            </small>
          </article>
          <article className={proofRequirementMet ? "monitor-tile success" : "monitor-tile"}>
            <UsersRound size={20} />
            <span>Wallet proof</span>
            <strong>
              {proofWallets}/{monitoring?.interactions.minimumRequiredWallets ?? 10}
            </strong>
            <small>{proofRequirementMet ? "Ready" : "Collecting"}</small>
          </article>
          <article className="monitor-tile">
            <BarChart3 size={20} />
            <span>Check-ins</span>
            <strong>{monitoring?.analytics.checkIns ?? stats.totalCount}</strong>
            <small>{monitoring?.analytics.totalEvents ?? 0} events</small>
          </article>
          <article className="monitor-tile">
            <MessageSquare size={20} />
            <span>Feedback</span>
            <strong>
              {monitoring?.feedback.averageRating
                ? `${monitoring.feedback.averageRating}/5`
                : "-"}
            </strong>
            <small>{monitoring?.feedback.totalFeedback ?? 0} responses</small>
          </article>
          <article className="monitor-tile">
            <ShieldAlert size={20} />
            <span>Errors</span>
            <strong>{monitoring?.analytics.errors ?? 0}</strong>
            <small>
              {isMonitoringRefreshing ? "Refreshing" : monitoring?.analytics.lastEventAt ?? "-"}
            </small>
          </article>
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
