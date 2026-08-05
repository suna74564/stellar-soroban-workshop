#!/usr/bin/env bash
set -euo pipefail

NETWORK="${NETWORK:-testnet}"
SOURCE_ACCOUNT="${SOURCE_ACCOUNT:-alice}"

stellar contract build

BADGE_ID="$(
  stellar contract deploy \
    --wasm target/wasm32v1-none/release/badge.wasm \
    --source-account "$SOURCE_ACCOUNT" \
    --network "$NETWORK"
)"

CHECKIN_ID="$(
  stellar contract deploy \
    --wasm target/wasm32v1-none/release/checkin.wasm \
    --source-account "$SOURCE_ACCOUNT" \
    --network "$NETWORK"
)"

stellar contract invoke \
  --id "$CHECKIN_ID" \
  --source-account "$SOURCE_ACCOUNT" \
  --network "$NETWORK" \
  -- configure_badge \
  --admin "$SOURCE_ACCOUNT" \
  --badge_contract "$BADGE_ID"

printf 'Badge contract: %s\n' "$BADGE_ID"
printf 'Check-in contract: %s\n' "$CHECKIN_ID"
