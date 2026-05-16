import cors from "cors";
import express from "express";
import { StrKey } from "@stellar/stellar-sdk";

const PORT = Number(process.env.PORT ?? 3001);
const HORIZON_URL =
  process.env.HORIZON_URL ?? "https://horizon-testnet.stellar.org";
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";

const app = express();

app.use(
  cors({
    origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN.split(","),
  }),
);

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    network: "testnet",
    horizonUrl: HORIZON_URL,
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

app.use((_request, response) => {
  response.status(404).json({ error: "Route not found." });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
