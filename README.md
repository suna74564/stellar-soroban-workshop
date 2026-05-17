# ProofBull

## Project Name

- ProofBull

## About Me

- name: Suna
- Builder focused on Stellar and Soroban smart contract development
- Interested in hackathon products, Web3 onboarding, and wallet-based user flows
- Learning Rust smart contracts through practical projects
- Building with React, TypeScript, Node.js, and Express
- Exploring how blockchain can create simple, useful public records
- Goal: create clear starter projects that help new builders move faster

## Project Details

ProofBull is a Stellar Soroban dApp for on-chain event and builder check-ins. Users connect their Freighter wallet, view their Stellar Testnet account details, and record a signed check-in transaction on a Soroban smart contract. The contract stores each wallet's check-in count and the total check-in count. The frontend is built with React, TypeScript, and Vite. The backend uses Node.js and Express to fetch account information from Stellar Horizon Testnet.

Testnet contract ID:

```text
CATRUM6EPBPN2475AO42CXU7TDDUZ2TGFS2IY3QOQY5JB53I3HWIDO44
```

## Vision

ProofBull aims to make blockchain participation easy, visible, and useful. Many people join workshops, hackathons, and community events, but their participation disappears after the event ends. ProofBull turns participation into a simple on-chain record. A wallet can show that someone joined, built, learned, and kept showing up. This can help communities reward active members, track engagement, and create trusted proof of attendance without complex tools. The long-term vision is to help new builders cross into Web3 with confidence and create abundance through open, verifiable participation records.

## Development Plan

1. Create the Soroban smart contract with storage keys for each user wallet and a total check-in counter.
2. Add smart contract functions: `check_in(user)`, `get_count(user)`, and `total()`.
3. Require wallet authorization inside `check_in(user)` so only the wallet owner can record their own check-in.
4. Write tests for first check-in, repeated check-ins, multiple users, and total count updates.
5. Build the React frontend with Freighter wallet connection, account details, XLM balance, and check-in button. Add an Express backend endpoint for Horizon account data.
6. Build, generate TypeScript contract bindings, deploy the contract to Stellar Testnet, and connect the deployed contract ID to the frontend.

## Personal Story

I started this project to understand how a real Stellar dApp works from contract to frontend. Instead of only writing a simple smart contract, I wanted to connect the full flow: wallet login, account data, smart contract storage, and a user action. ProofBull helped me learn how Freighter, Horizon, Soroban, Rust, React, and Express work together. The project is small, but it represents a complete builder journey.

## Installation

### Requirements

- Rust
- Stellar CLI
- Node.js 22+
- npm
- Freighter browser extension

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

1. Install Freighter.
2. Switch Freighter to Testnet.
3. Open the frontend.
4. Connect your wallet.
5. Click `Check in on-chain`.
6. Confirm the transaction in Freighter.

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

## Tech Stack

- Stellar Soroban
- Rust
- React
- TypeScript
- Vite
- Node.js
- Express
- Freighter API
- Stellar Horizon Testnet

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
