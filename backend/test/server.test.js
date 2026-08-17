import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { Keypair } from "@stellar/stellar-sdk";

process.env.DATA_DIR = await mkdtemp(join(tmpdir(), "proofbull-api-"));
process.env.LEVEL_TARGET_WALLETS = "2";

const { createApp } = await import("../src/server.js");
const TEST_TX_HASH =
  "cf4bdadb55d15cb720691a7b580f7bc18f9f9aa986a4ff229fb2fb7a08f48b36";

let server;
let baseUrl;

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const payload = await response.json();
  return { response, payload };
}

async function requestText(path) {
  const response = await fetch(`${baseUrl}${path}`);
  const payload = await response.text();
  return { response, payload };
}

before(async () => {
  await new Promise((resolve) => {
    server = createApp().listen(0, "127.0.0.1", resolve);
  });

  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  await rm(process.env.DATA_DIR, { force: true, recursive: true });
});

test("health endpoint exposes testnet runtime status", async () => {
  const { response, payload } = await request("/api/health");

  assert.equal(response.status, 200);
  assert.equal(payload.ok, true);
  assert.equal(payload.network, "testnet");
  assert.equal(typeof payload.timestamp, "string");
});

test("analytics endpoints persist product validation events", async () => {
  const address = Keypair.random().publicKey();
  const secondAddress = Keypair.random().publicKey();
  const events = [
    { eventName: "wallet_connected", address, walletName: "Freighter" },
    {
      eventName: "checkin_success",
      address,
      txHash: TEST_TX_HASH,
      metadata: { walletCheckins: 1 },
    },
    {
      eventName: "checkin_success",
      address: secondAddress,
      txHash: TEST_TX_HASH,
      metadata: { walletCheckins: 1 },
    },
    { eventName: "wallet_connected", address: secondAddress, walletName: "xBull" },
    { eventName: "app_error", metadata: { type: "network" } },
  ];

  for (const event of events) {
    const { response } = await request("/api/analytics", {
      body: JSON.stringify(event),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    assert.equal(response.status, 201);
  }

  const { payload: summary } = await request("/api/analytics/summary");

  assert.equal(summary.totalEvents, 5);
  assert.equal(summary.uniqueWallets, 2);
  assert.equal(summary.walletConnections, 2);
  assert.equal(summary.checkIns, 2);
  assert.equal(summary.errors, 1);

  const { payload: proof } = await request("/api/interactions/proof");

  assert.equal(proof.minimumRequiredWallets, 2);
  assert.equal(proof.uniqueWallets, 2);
  assert.equal(proof.activeWallets, 1);
  assert.equal(proof.transactionCount, 1);
  assert.equal(proof.duplicateTransactionCount, 1);
  assert.equal(proof.remainingWallets, 1);
  assert.equal(proof.requirementMet, false);

  const { response: csvResponse, payload: csv } = await requestText(
    "/api/interactions/proof.csv",
  );

  assert.equal(csvResponse.status, 200);
  assert.match(csvResponse.headers.get("content-type"), /text\/csv/);
  assert.match(csv, /wallet_address,wallet_used,transaction_hash/);
  assert.match(csv, new RegExp(TEST_TX_HASH));
});

test("feedback endpoints validate and summarize user responses", async () => {
  const invalid = await request("/api/feedback", {
    body: JSON.stringify({ rating: 7, message: "Too high" }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  assert.equal(invalid.response.status, 400);

  const valid = await request("/api/feedback", {
    body: JSON.stringify({
      category: "usability",
      message: "The check-in flow is clear.",
      rating: 5,
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  assert.equal(valid.response.status, 201);

  const { payload: summary } = await request("/api/feedback/summary");

  assert.equal(summary.totalFeedback, 1);
  assert.equal(summary.averageRating, 5);
  assert.deepEqual(summary.categories, { usability: 1 });

  const { response: csvResponse, payload: csv } = await requestText(
    "/api/feedback/export.csv",
  );

  assert.equal(csvResponse.status, 200);
  assert.match(csvResponse.headers.get("content-type"), /text\/csv/);
  assert.match(csv, /created_at,wallet_address,category,rating,feedback/);
  assert.match(csv, /The check-in flow is clear/);
});
