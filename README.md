# ProofBull

## Project Name

- ProofBull

## Who Are You?

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

## ChatGPT Prompt 1

Write me a project description, in less than 150 simple, straightforward words, for the following blockchain project details to be implemented on Stellar Blockchain. Describe a complete project:

ProofBull is a Stellar Soroban project that lets users record on-chain check-ins with their Freighter wallet. The project has a React and TypeScript frontend, a Node.js and Express backend, and a Rust smart contract. Users connect their wallet, see their XLM balance and account details, then click a button to create a signed check-in transaction. The Soroban contract stores how many times each wallet has checked in and how many total check-ins exist. This can be used for hackathons, workshops, community events, and builder attendance tracking. The backend reads account data from Stellar Horizon Testnet, while the frontend interacts with the smart contract through generated TypeScript bindings.

## ChatGPT Prompt 2

Now, also write a vision statement, in 100 simple, straightforward words, for this project. Talk about how this project can create a big impact. Here are my notes:

ProofBull can create impact by making blockchain participation simple and useful. People who attend events, join workshops, or contribute to communities can record their presence on-chain with one wallet signature. This creates a public, verifiable proof of participation that can later support rewards, reputation, access, or community recognition. The project helps new users understand wallets, smart contracts, and blockchain data through a real product flow. In the future, ProofBull can become a flexible attendance and achievement layer for hackathons, schools, meetups, and builder communities across the Stellar ecosystem.

## ChatGPT Prompt 3

Now, write me a software development plan for this project. Please mainly focus on the smart contract functions, variables, features to be developed. Then, mention the front-end development as well. It should have less than 6 steps in total. Final step can be deployment.

1. Create the Soroban smart contract with storage keys for each user wallet and a total check-in counter.
2. Add smart contract functions: `check_in(user)`, `get_count(user)`, and `total()`.
3. Require wallet authorization inside `check_in(user)` so only the wallet owner can record their own check-in.
4. Write tests for first check-in, repeated check-ins, multiple users, and total count updates.
5. Build the React frontend with Freighter wallet connect, account details, XLM balance, and check-in button. Add an Express backend endpoint for Horizon account data.
6. Build, generate TypeScript contract bindings, deploy the contract to Stellar Testnet, and connect the deployed contract ID to the frontend.

## ChatGPT Prompt 4

Now, write a personal story summary in less than 100 words. Here are my notes:

I started this project to understand how a real Stellar dApp works from contract to frontend. Instead of only writing a simple smart contract, I wanted to connect the full flow: wallet login, account data, smart contract storage, and a user action. ProofBull helped me learn how Freighter, Horizon, Soroban, Rust, React, and Express work together. The project is small, but it represents a complete builder journey. It shows that a beginner can move from setup to a deployed blockchain app by building step by step.

## ChatGPT Prompt 5

Can you also write a draft GitHub README on how to install the project?

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

## ImgCreator Prompt

futuristic happy digital painting with a bull mascot hero in a happy, bright futuristic city, creating abundance, exploring new frontiers, energetic motion, optimistic blockchain atmosphere, glowing city lights, friendly technology, vibrant colors

## Visual

- mascot: bull
- setting: city
- physical keywords: creating abundance, new frontiers

## Useful Links

- Stellar Developer Documentation: <https://developers.stellar.org/docs>
- Freighter Documentation: <https://docs.freighter.app/docs>
- Stellar Chain Explorer: <https://stellar.expert/explorer/testnet>
- Stellar Lab: <https://lab.stellar.org>
