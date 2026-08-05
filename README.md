# ProofBull

## Project Name

- ProofBull Level 2: Live Check-in

## About Me

- name: Suna
- Builder focused on Stellar and Soroban smart contract development
- Interested in hackathon products, Web3 onboarding, and wallet-based user flows
- Learning Rust smart contracts through practical projects
- Building with React, TypeScript, Node.js, and Express
- Exploring how blockchain can create simple, useful public records
- Goal: create clear starter projects that help new builders move faster

## Project Details

ProofBull is a Stellar Soroban dApp for on-chain event and builder check-ins. Users connect with StellarWalletsKit, choose from multiple Stellar wallets, view Testnet account details, and record a signed check-in transaction on a Soroban smart contract. The contract stores each wallet's check-in count, the total check-in count, and publishes a `CheckIn` event for live frontend synchronization.

The frontend is built with React, TypeScript, and Vite. The backend uses Node.js and Express to fetch account information from Stellar Horizon Testnet. The activity feed polls Soroban RPC events with a cursor so newly confirmed contract calls appear in the UI.

Testnet contract ID:

```text
CAS6QJJ6OJDVAFVYDOXUPGRXGFJQ5WKEDS3DRS4MNWHAFY2ULXN2TKLE
```

Verified contract call transaction:

```text
830dce6f4a2a810a4d0744b8c905fc3285cd60f82dc4eed9bf16ec43e313564a
```

Explorer links:

- Contract: <https://stellar.expert/explorer/testnet/contract/CAS6QJJ6OJDVAFVYDOXUPGRXGFJQ5WKEDS3DRS4MNWHAFY2ULXN2TKLE>
- Contract call: <https://stellar.expert/explorer/testnet/tx/830dce6f4a2a810a4d0744b8c905fc3285cd60f82dc4eed9bf16ec43e313564a>

## Level 2 Checklist

- Multi-wallet connection with StellarWalletsKit
- Wallet options visible in the app
- Handles wallet not found, rejected signature, wrong network, and insufficient balance states
- Contract deployed on Stellar Testnet
- Frontend calls `check_in(user)` on the deployed contract
- Transaction status shows signature, pending, success, and failed states
- Live activity feed reads `CheckIn` events from Soroban RPC
- Contract tests verify storage and event emission

## Screenshots

Wallet options available:

![Wallet options](frontend/public/wallet-options-screenshot.png)

Mobile layout:

![Mobile wallet options](frontend/public/wallet-options-mobile.png)

## Vision

ProofBull aims to make blockchain participation easy, visible, and useful. Many people join workshops, hackathons, and community events, but their participation disappears after the event ends. ProofBull turns participation into a simple on-chain record. A wallet can show that someone joined, built, learned, and kept showing up. This can help communities reward active members, track engagement, and create trusted proof of attendance without complex tools. The long-term vision is to help new builders cross into Web3 with confidence and create abundance through open, verifiable participation records.

## Development Plan

1. Create the Soroban smart contract with storage keys for each user wallet and a total check-in counter.
2. Add smart contract functions: `check_in(user)`, `get_count(user)`, and `total()`.
3. Require wallet authorization inside `check_in(user)` so only the wallet owner can record their own check-in.
4. Write tests for first check-in, repeated check-ins, multiple users, and total count updates.
5. Build the React frontend with StellarWalletsKit, account details, XLM balance, transaction status, and check-in button. Add an Express backend endpoint for Horizon account data.
6. Publish `CheckIn` events from the contract and read them from the frontend through Soroban RPC.
7. Build, generate TypeScript contract bindings, deploy the contract to Stellar Testnet, and connect the deployed contract ID to the frontend.

## Personal Story

I started this project to understand how a real Stellar dApp works from contract to frontend. Instead of only writing a simple smart contract, I wanted to connect the full flow: wallet login, account data, smart contract storage, and a user action. ProofBull helped me learn how Freighter, Horizon, Soroban, Rust, React, and Express work together. The project is small, but it represents a complete builder journey.

## Installation

### Requirements

- Rust
- Stellar CLI
- Node.js 22+
- npm
- A Stellar wallet supported by StellarWalletsKit

### Clone the Repository

```bash
git clone https://github.com/suna74564/stellar-soroban-workshop.git
cd stellar-soroban-workshop
```

### Install Soroban Target

```bash
rustup target add wasm32v1-none
stellar network use testnet
```

### Test and Build Smart Contracts

```bash
cargo test
stellar contract build
```

### Generate TypeScript Bindings

```bash
stellar contract bindings typescript \
  --contract-id CAS6QJJ6OJDVAFVYDOXUPGRXGFJQ5WKEDS3DRS4MNWHAFY2ULXN2TKLE \
  --network testnet \
  --output-dir frontend/packages/checkin \
  --overwrite

cd frontend/packages/checkin
npm install
npm run build
```

### Run the Backend

```bash
cd backend
npm install
npm start
```

Backend runs on:

```text
http://localhost:3001
```

Available endpoints:

```text
GET /api/health
GET /api/account/:address
```

### Run the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:4321
```

### Use the App

1. Install or open a StellarWalletsKit-supported wallet.
2. Switch the wallet to Testnet.
3. Open the frontend.
4. Choose a wallet.
5. Click `Check in on-chain`.
6. Confirm the transaction in your wallet.
7. Watch the transaction tracker and live contract event feed update.

## Smart Contract

Main contract:

```text
contracts/checkin
```

Functions:

```text
check_in(user: Address) -> u32
get_count(user: Address) -> u32
total() -> u32
```

Event:

```text
CheckIn(check_in, user) -> [user_count, total_count]
```

## Tech Stack

- Stellar Soroban
- Rust
- React
- TypeScript
- Vite
- Node.js
- Express
- StellarWalletsKit
- Stellar SDK
- Stellar Horizon Testnet
- Soroban RPC events

## Visual Concept

- Mascot: bull
- Setting: bright futuristic city
- Physical keywords: creating abundance, exploring new frontiers
- Art direction: futuristic happy digital painting with an energetic bull mascot, optimistic blockchain atmosphere, glowing city lights, friendly technology, and vibrant colors

## Useful Links

- Stellar Developer Documentation: <https://developers.stellar.org/docs>
- Freighter Documentation: <https://docs.freighter.app/docs>
- Stellar Chain Explorer: <https://stellar.expert/explorer/testnet>
- Stellar Lab: <https://lab.stellar.org>
