import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { Keypair } from "@stellar/stellar-sdk";

process.env.DATA_DIR = await mkdtemp(join(tmpdir(), "proofbull-api-"));

const { createApp } = await import("../src/server.js");

let server;
let baseUrl;

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const payload = await response.json();
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
  const events = [
    { eventName: "wallet_connected", address, walletName: "Freighter" },
    {
      eventName: "checkin_success",
      address,
      txHash: "abc123",
      metadata: { walletCheckins: 1 },
    },
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

  assert.equal(summary.totalEvents, 3);
  assert.equal(summary.uniqueWallets, 1);
  assert.equal(summary.walletConnections, 1);
  assert.equal(summary.checkIns, 1);
  assert.equal(summary.errors, 1);

  const { payload: proof } = await request("/api/interactions/proof");

  assert.equal(proof.uniqueWallets, 1);
  assert.equal(proof.checkIns, 1);
  assert.equal(proof.requirementMet, false);
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
});
