import cors from "cors";
import express from "express";
import { StrKey } from "@stellar/stellar-sdk";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, appendFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.PORT ?? 3001);
const HORIZON_URL =
  process.env.HORIZON_URL ?? "https://horizon-testnet.stellar.org";
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";
const DATA_DIR =
  process.env.DATA_DIR ??
  join(dirname(fileURLToPath(import.meta.url)), "..", "data");
const ANALYTICS_FILE = join(DATA_DIR, "analytics.jsonl");
const FEEDBACK_FILE = join(DATA_DIR, "feedback.jsonl");
const MAX_EVENT_NAME_LENGTH = 64;
const MAX_FEEDBACK_LENGTH = 1200;
const LEVEL_TARGET_WALLETS = Number(process.env.LEVEL_TARGET_WALLETS ?? 50);
const STELLAR_TX_HASH_PATTERN = /^[a-f0-9]{64}$/i;

function isValidEventName(value) {
  return (
    typeof value === "string" &&
    value.length > 1 &&
    value.length <= MAX_EVENT_NAME_LENGTH &&
    /^[a-z0-9_.:-]+$/i.test(value)
  );
}

function normalizeAddress(value) {
  if (typeof value !== "string" || !StrKey.isValidEd25519PublicKey(value)) {
    return null;
  }

  return value;
}

function normalizeTransactionHash(value) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return STELLAR_TX_HASH_PATTERN.test(trimmed) ? trimmed.toLowerCase() : null;
}

function cleanMetadata(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => ["string", "number", "boolean"].includes(typeof entry))
      .slice(0, 20),
  );
}

async function appendJsonLine(filePath, payload) {
  await mkdir(dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify(payload)}\n`, "utf8");
}

async function readJsonLines(filePath) {
  try {
    const content = await readFile(filePath, "utf8");
    return content
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

function summarizeFeedback(feedback) {
  const ratings = feedback
    .map((item) => item.rating)
    .filter((rating) => typeof rating === "number");
  const averageRating =
    ratings.length === 0
      ? null
      : Number(
          (ratings.reduce((total, rating) => total + rating, 0) / ratings.length).toFixed(1),
        );
  const categories = feedback.reduce((summary, item) => {
    summary[item.category] = (summary[item.category] ?? 0) + 1;
    return summary;
  }, {});

  return {
    totalFeedback: feedback.length,
    averageRating,
    categories,
    latestFeedback: feedback.slice(-5).reverse(),
  };
}

function csvCell(value) {
  if (value === null || value === undefined) return "";

  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(rows, columns) {
  const header = columns.map((column) => csvCell(column.label)).join(",");
  const body = rows.map((row) =>
    columns.map((column) => csvCell(column.value(row))).join(","),
  );

  return [header, ...body].join("\n");
}

function summarizeInteractionProof(analytics) {
  const interactions = analytics.filter(
    (event) =>
      event.address &&
      ["wallet_connected", "checkin_success"].includes(event.eventName),
  );
  const transactionInteractions = interactions.filter(
    (event) => event.eventName === "checkin_success" && event.txHash,
  );
  const seenTransactionHashes = new Set();
  const uniqueTransactionProofs = transactionInteractions.filter((event) => {
    if (seenTransactionHashes.has(event.txHash)) return false;
    seenTransactionHashes.add(event.txHash);
    return true;
  });
  const uniqueWallets = new Set(interactions.map((event) => event.address));
  const activeWallets = new Set(
    uniqueTransactionProofs.map((event) => event.address),
  );
  const remainingWallets = Math.max(LEVEL_TARGET_WALLETS - activeWallets.size, 0);

  return {
    level: "Level 5",
    minimumRequiredWallets: LEVEL_TARGET_WALLETS,
    uniqueWallets: uniqueWallets.size,
    activeWallets: activeWallets.size,
    transactionCount: uniqueTransactionProofs.length,
    duplicateTransactionCount:
      transactionInteractions.length - uniqueTransactionProofs.length,
    remainingWallets,
    requirementMet: activeWallets.size >= LEVEL_TARGET_WALLETS,
    latestTransactionProofs: uniqueTransactionProofs.slice(-50).reverse(),
    latestInteractions: interactions.slice(-50).reverse(),
  };
}

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN.split(","),
    }),
  );
  app.use(express.json({ limit: "64kb" }));

  app.get("/api/health", (_request, response) => {
    response.json({
      ok: true,
      network: "testnet",
      horizonUrl: HORIZON_URL,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api/account/:address", async (request, response) => {
    const address = request.params.address;

    if (!StrKey.isValidEd25519PublicKey(address)) {
      response.status(400).json({ error: "Invalid Stellar public key." });
      return;
    }

    const horizonResponse = await fetch(`${HORIZON_URL}/accounts/${address}`);

    if (horizonResponse.status === 404) {
      response.status(404).json({
        error: "Account not found on Stellar Testnet. Fund it with Friendbot.",
      });
      return;
    }

    if (!horizonResponse.ok) {
      response.status(horizonResponse.status).json({
        error: "Horizon account lookup failed.",
      });
      return;
    }

    const account = await horizonResponse.json();
    const nativeBalance = account.balances.find(
      (balance) => balance.asset_type === "native",
    );

    response.json({
      address,
      network: "testnet",
      horizonUrl: HORIZON_URL,
      sequence: account.sequence,
      subentryCount: account.subentry_count,
      lastModifiedLedger: account.last_modified_ledger,
      xlmBalance: nativeBalance?.balance ?? "0.0000000",
      balances: account.balances,
    });
  });

  app.post("/api/analytics", async (request, response) => {
    const eventName = request.body?.eventName;

    if (!isValidEventName(eventName)) {
      response.status(400).json({ error: "Invalid analytics event name." });
      return;
    }

    const event = {
      id: randomUUID(),
      eventName,
      address: normalizeAddress(request.body?.address),
      walletName:
        typeof request.body?.walletName === "string"
          ? request.body.walletName.slice(0, 80)
          : null,
      txHash: normalizeTransactionHash(request.body?.txHash),
      sessionId:
        typeof request.body?.sessionId === "string"
          ? request.body.sessionId.slice(0, 80)
          : null,
      metadata: cleanMetadata(request.body?.metadata),
      userAgent: request.get("user-agent") ?? "",
      createdAt: new Date().toISOString(),
    };

    await appendJsonLine(ANALYTICS_FILE, event);

    response.status(201).json({ ok: true, event });
  });

  app.get("/api/analytics/summary", async (_request, response) => {
    const analytics = await readJsonLines(ANALYTICS_FILE);
    const uniqueWallets = new Set(
      analytics.map((event) => event.address).filter(Boolean),
    );

    response.json({
      totalEvents: analytics.length,
      uniqueWallets: uniqueWallets.size,
      walletConnections: analytics.filter(
        (event) => event.eventName === "wallet_connected",
      ).length,
      checkIns: analytics.filter((event) => event.eventName === "checkin_success")
        .length,
      errors: analytics.filter((event) => event.eventName === "app_error").length,
      lastEventAt: analytics.at(-1)?.createdAt ?? null,
      latestEvents: analytics.slice(-10).reverse(),
    });
  });

  app.post("/api/feedback", async (request, response) => {
    const rating = Number(request.body?.rating);
    const message =
      typeof request.body?.message === "string" ? request.body.message.trim() : "";

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      response.status(400).json({ error: "Rating must be an integer from 1 to 5." });
      return;
    }

    if (message.length < 3 || message.length > MAX_FEEDBACK_LENGTH) {
      response.status(400).json({
        error: `Feedback must be between 3 and ${MAX_FEEDBACK_LENGTH} characters.`,
      });
      return;
    }

    const feedback = {
      id: randomUUID(),
      address: normalizeAddress(request.body?.address),
      category:
        typeof request.body?.category === "string"
          ? request.body.category.slice(0, 40)
          : "general",
      rating,
      message,
      txHash: normalizeTransactionHash(request.body?.txHash),
      createdAt: new Date().toISOString(),
    };

    await appendJsonLine(FEEDBACK_FILE, feedback);

    response.status(201).json({ ok: true, feedback });
  });

  app.get("/api/feedback/summary", async (_request, response) => {
    const feedback = await readJsonLines(FEEDBACK_FILE);
    response.json(summarizeFeedback(feedback));
  });

  app.get("/api/feedback/export.csv", async (_request, response) => {
    const feedback = await readJsonLines(FEEDBACK_FILE);
    const csv = toCsv(feedback, [
      { label: "created_at", value: (row) => row.createdAt },
      { label: "wallet_address", value: (row) => row.address },
      { label: "category", value: (row) => row.category },
      { label: "rating", value: (row) => row.rating },
      { label: "feedback", value: (row) => row.message },
      { label: "transaction_hash", value: (row) => row.txHash },
    ]);

    response.type("text/csv").send(`${csv}\n`);
  });

  app.get("/api/interactions/proof", async (_request, response) => {
    const analytics = await readJsonLines(ANALYTICS_FILE);
    response.json(summarizeInteractionProof(analytics));
  });

  app.get("/api/interactions/proof.csv", async (_request, response) => {
    const analytics = await readJsonLines(ANALYTICS_FILE);
    const proof = summarizeInteractionProof(analytics);
    const csv = toCsv(proof.latestTransactionProofs, [
      { label: "created_at", value: (row) => row.createdAt },
      { label: "wallet_address", value: (row) => row.address },
      { label: "wallet_used", value: (row) => row.walletName },
      { label: "transaction_hash", value: (row) => row.txHash },
      {
        label: "transaction_url",
        value: (row) =>
          `https://stellar.expert/explorer/testnet/tx/${row.txHash}`,
      },
    ]);

    response.type("text/csv").send(`${csv}\n`);
  });

  app.use((_request, response) => {
    response.status(404).json({ error: "Route not found." });
  });

  app.use((error, _request, response, _next) => {
    console.error(error);
    response.status(500).json({ error: "Internal server error." });
  });

  return app;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createApp().listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}
