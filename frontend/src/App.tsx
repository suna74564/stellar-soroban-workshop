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
import {
  CHECKIN_CONTRACT_ID,
  NETWORK_PASSPHRASE,
  createCheckinClient,
} from "./lib/checkin";
import { classifyError, ensureSpendableTestnetBalance } from "./lib/errors";
import { fetchCheckinEvents } from "./lib/events";
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

function mergeEvents(current: CheckinEvent[], incoming: CheckinEvent[]) {
  const byId = new Map<string, CheckinEvent>();

  for (const event of [...incoming, ...current]) {
    byId.set(event.id, event);
  }

  return Array.from(byId.values())
    .sort((a, b) => b.ledger - a.ledger || b.id.localeCompare(a.id))
    .slice(0, 8);
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

  const refreshEvents = useCallback(async (quiet = true) => {
    setIsEventSyncing(true);

    try {
      const nextEvents = await fetchCheckinEvents(eventCursor.current || undefined);
      eventCursor.current = nextEvents.cursor || eventCursor.current;
      setLatestLedger(nextEvents.latestLedger);

      if (nextEvents.events.length > 0) {
        setEvents((current) => mergeEvents(current, nextEvents.events));
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
    [address, refreshContract],
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
    <main className="shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Level 2 Yellow Belt</p>
          <h1>ProofBull Live Check-in</h1>
        </div>

        <div className="actions">
          {connected ? (
            <>
              <button
                className="icon-button"
                onClick={() => refreshAccount()}
                disabled={isBusy}
                title="Refresh account"
                type="button"
              >
                <RefreshCw size={18} />
              </button>
              <button
                className="secondary-button"
                onClick={() => void disconnectWallet()}
                type="button"
              >
                <LogOut size={18} />
                Disconnect
              </button>
            </>
          ) : (
            <button
              className="primary-button"
              onClick={connectWallet}
              disabled={isBusy}
              type="button"
            >
              <Wallet size={18} />
              Choose Wallet
            </button>
          )}
        </div>
      </section>

      {error && (
        <div className="error">
          <ShieldAlert size={18} />
          <div>
            <strong>{errorTitles[error.type]}</strong>
            <span>{error.message}</span>
          </div>
        </div>
      )}

      <section className="wallet-options" aria-label="Wallet options">
        {walletOptions.slice(0, 10).map((option) => (
          <a
            className={`wallet-option ${option.isAvailable ? "available" : ""}`}
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

      <section className="dashboard">
        <article className="panel wallet-panel">
          <div className="panel-header">
            <p>Wallet</p>
            {connected && <BadgeCheck size={18} />}
          </div>
          <strong>{connected ? shortAddress(address) : "Not connected"}</strong>
          <span>{wallet?.walletName ?? "StellarWalletsKit"}</span>
        </article>

        <article className="panel">
          <div className="panel-header">
            <p>XLM Balance</p>
          </div>
          <strong>{account?.xlmBalance ?? "0.0000000"}</strong>
          <span>Horizon Testnet</span>
        </article>

        <article className="panel">
          <div className="panel-header">
            <p>Your Check-ins</p>
          </div>
          <strong>{stats.walletCount}</strong>
          <span>Stored on Soroban</span>
        </article>

        <article className="panel">
          <div className="panel-header">
            <p>Total Check-ins</p>
            {isEventSyncing ? <Loader2 className="spin" size={18} /> : <Wifi size={18} />}
          </div>
          <strong>{stats.totalCount}</strong>
          <span>{latestLedger ? `Latest ledger ${latestLedger}` : "Live sync"}</span>
        </article>
      </section>

      <section className="workspace">
        <div className="contract-zone">
          <div>
            <p className="eyebrow">Soroban Contract</p>
            <h2>Wallet Check-in</h2>
            <p className="contract-id">{CHECKIN_CONTRACT_ID}</p>
          </div>

          <button
            className="primary-button"
            onClick={checkIn}
            disabled={!connected || isBusy}
            type="button"
          >
            {isBusy ? <Loader2 className="spin" size={18} /> : <BadgeCheck size={18} />}
            Check in on-chain
          </button>
        </div>

        <div className="status-row">
          <span>{status}</span>
          <a href={explorerUrl} target="_blank" rel="noreferrer">
            Explorer <ExternalLink size={14} />
          </a>
          <a href={labUrl} target="_blank" rel="noreferrer">
            Stellar Lab <ExternalLink size={14} />
          </a>
        </div>
      </section>

      <section className="transaction-strip">
        <div className={`tx-state ${transaction.phase}`}>
          <Clock3 size={18} />
          <div>
            <p>Transaction Status</p>
            <strong>{transaction.label}</strong>
          </div>
        </div>
        {transaction.hash && (
          <a href={transactionUrl(transaction.hash)} target="_blank" rel="noreferrer">
            {shortAddress(transaction.hash)}
            <ExternalLink size={14} />
          </a>
        )}
      </section>

      <section className="details">
        <article className="panel wide">
          <div className="panel-header">
            <p>Account Details</p>
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
              <dt>Last Ledger</dt>
              <dd>{account?.lastModifiedLedger ?? "-"}</dd>
            </div>
            <div>
              <dt>Network Passphrase</dt>
              <dd>{network.networkPassphrase ?? NETWORK_PASSPHRASE}</dd>
            </div>
          </dl>
        </article>

        <article className="panel wide feed-panel">
          <div className="panel-header">
            <p>Live Contract Events</p>
            <button
              className="icon-button compact"
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
          <div className="event-list">
            {events.map((event) => (
              <a
                className="event-row"
                href={transactionUrl(event.txHash)}
                key={event.id}
                rel="noreferrer"
                target="_blank"
              >
                <div>
                  <strong>{shortAddress(event.user)}</strong>
                  <span>
                    #{event.userCount} wallet, #{event.totalCount} total
                  </span>
                </div>
                <span>Ledger {event.ledger}</span>
              </a>
            ))}
            {!events.length && <span className="empty">No check-in events loaded</span>}
          </div>
        </article>
      </section>
    </main>
  );
}
