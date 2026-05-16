import {
  BadgeCheck,
  ExternalLink,
  Loader2,
  LogOut,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  getAddress,
  getNetworkDetails,
  isConnected,
  requestAccess,
} from "@stellar/freighter-api";
import { fetchAccount } from "./lib/account";
import {
  CHECKIN_CONTRACT_ID,
  NETWORK_PASSPHRASE,
  createCheckinClient,
} from "./lib/checkin";
import type { AccountDetails, ContractStats, NetworkDetails } from "./types";

const explorerUrl = `https://stellar.expert/explorer/testnet/contract/${CHECKIN_CONTRACT_ID}`;
const labUrl = `https://lab.stellar.org/r/testnet/contract/${CHECKIN_CONTRACT_ID}`;

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

function readError(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Beklenmeyen bir hata oluştu.";
}

export default function App() {
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState<NetworkDetails | null>(null);
  const [account, setAccount] = useState<AccountDetails | null>(null);
  const [stats, setStats] = useState<ContractStats>({
    walletCount: 0,
    totalCount: 0,
  });
  const [status, setStatus] = useState("Freighter bekleniyor");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const connected = Boolean(address);

  const client = useMemo(() => createCheckinClient(address), [address]);

  const refreshContract = useCallback(
    async (walletAddress: string) => {
      const readClient = createCheckinClient(walletAddress);
      const [walletTx, totalTx] = await Promise.all([
        readClient.get_count({ user: walletAddress }),
        readClient.total(),
      ]);

      setStats({
        walletCount: Number(walletTx.result),
        totalCount: Number(totalTx.result),
      });
    },
    [],
  );

  const refreshAccount = useCallback(
    async (walletAddress = address) => {
      if (!walletAddress) return;

      setIsBusy(true);
      setError("");
      try {
        const [nextAccount, nextNetwork] = await Promise.all([
          fetchAccount(walletAddress),
          getNetworkDetails(),
          refreshContract(walletAddress),
        ]);

        if ("error" in nextNetwork && nextNetwork.error) {
          throw new Error(String(nextNetwork.error));
        }

        setAccount(nextAccount);
        setNetwork(nextNetwork as NetworkDetails);
        setStatus("Testnet verileri güncellendi");
      } catch (nextError) {
        setError(readError(nextError));
      } finally {
        setIsBusy(false);
      }
    },
    [address, refreshContract],
  );

  async function connectWallet() {
    setIsBusy(true);
    setError("");

    try {
      const freighter = await isConnected();
      if ("error" in freighter && freighter.error) {
        throw new Error(String(freighter.error));
      }
      if (!freighter.isConnected) {
        throw new Error("Freighter extension bulunamadı.");
      }

      const access = await requestAccess();
      if ("error" in access && access.error) {
        throw new Error(String(access.error));
      }
      if (!access.address) {
        const current = await getAddress();
        if ("error" in current && current.error) {
          throw new Error(String(current.error));
        }
        if (!current.address) throw new Error("Cüzdan erişimi verilmedi.");
        setAddress(current.address);
        await refreshAccount(current.address);
      } else {
        setAddress(access.address);
        await refreshAccount(access.address);
      }
    } catch (nextError) {
      setError(readError(nextError));
    } finally {
      setIsBusy(false);
    }
  }

  function disconnectWallet() {
    setAddress("");
    setNetwork(null);
    setAccount(null);
    setStats({ walletCount: 0, totalCount: 0 });
    setError("");
    setStatus("Cüzdan bağlantısı kesildi");
  }

  async function checkIn() {
    if (!address) return;

    setIsBusy(true);
    setError("");
    setStatus("Freighter imzası bekleniyor");

    try {
      const tx = await client.check_in({ user: address });
      const sent = await tx.signAndSend();

      setStatus(`Check-in işlendi: ${sent.result}`);
      await refreshAccount(address);
    } catch (nextError) {
      setError(readError(nextError));
      setStatus("Check-in tamamlanamadı");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <main className="shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Stellar Hackathon Starter</p>
          <h1>Proof of Build</h1>
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
                onClick={disconnectWallet}
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
              Connect Freighter
            </button>
          )}
        </div>
      </section>

      {error && <div className="error">{error}</div>}

      <section className="dashboard">
        <article className="panel wallet-panel">
          <div className="panel-header">
            <p>Wallet</p>
            {connected && <BadgeCheck size={18} />}
          </div>
          <strong>{connected ? shortAddress(address) : "Not connected"}</strong>
          <span>{network?.network ?? "TESTNET"}</span>
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
          </div>
          <strong>{stats.totalCount}</strong>
          <span>Contract state</span>
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
              <dd>{network?.networkPassphrase ?? NETWORK_PASSPHRASE}</dd>
            </div>
          </dl>
        </article>

        <article className="panel wide">
          <div className="panel-header">
            <p>Balances</p>
          </div>
          <div className="balance-list">
            {(account?.balances ?? []).map((balance) => (
              <div key={`${balance.asset_type}-${balance.asset_code ?? "XLM"}`}>
                <span>{balance.asset_code ?? "XLM"}</span>
                <strong>{balance.balance}</strong>
              </div>
            ))}
            {!account?.balances?.length && <span>No balances loaded</span>}
          </div>
        </article>
      </section>
    </main>
  );
}
