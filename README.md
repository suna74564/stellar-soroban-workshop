# ProofBull

## Level 5 - Blue Belt Submission

ProofBull is a production-ready Stellar Soroban dApp for live builder check-ins and wallet reputation. Users connect a Stellar Testnet wallet, call a deployed check-in contract from the frontend, and watch the app synchronize transaction status, live contract events, analytics, and a reputation score in real time.

The Level 5 version focuses on user growth and product iteration: 50-user Testnet growth tracking, active transaction proof, feedback export analysis, a pitch deck, a demo flow, and a next-phase roadmap based on real user feedback.

## Live Demo

- GitHub Pages: <https://suna74564.github.io/stellar-soroban-workshop/>
- Google Form: TODO - add the live Google Form URL after creating it.
- Exported Excel sheet: [docs/level-5-evidence/proofbull-level-5-feedback-analysis.xlsx](docs/level-5-evidence/proofbull-level-5-feedback-analysis.xlsx)
- Pitch deck/PPT: [docs/level-5-evidence/proofbull-level-5-pitch-deck.pptx](docs/level-5-evidence/proofbull-level-5-pitch-deck.pptx)
- Demo video: TODO - add the full product walkthrough URL.

## About Me

- name: Suna
- Builder focused on Stellar and Soroban smart contract development
- Interested in hackathon products, Web3 onboarding, and wallet-based user flows
- Learning Rust smart contracts through practical projects
- Building with React, TypeScript, Node.js, and Express

## Deployed Contracts

Check-in contract:

```text
CDX47DA7XCWBN7LUQ4Z3NCVPGQ3D7GOLWJPR6EPT6SU4QU3V7DYFOAM5
```

Reputation badge contract:

```text
CB5PJLAQUHUT4I23NLKNJQWCAQ5X6KARLP66WGAHK6IY2OBZ4WW3ZIUQ
```

Verified contract interaction transaction:

```text
cf4bdadb55d15cb720691a7b580f7bc18f9f9aa986a4ff229fb2fb7a08f48b36
```

Badge configuration transaction:

```text
6dc37fe5e283c52e4ffdc848c29c680ab4b7ede66b1253c68970856198e11309
```

Explorer links:

- Check-in contract: <https://stellar.expert/explorer/testnet/contract/CDX47DA7XCWBN7LUQ4Z3NCVPGQ3D7GOLWJPR6EPT6SU4QU3V7DYFOAM5>
- Badge contract: <https://stellar.expert/explorer/testnet/contract/CB5PJLAQUHUT4I23NLKNJQWCAQ5X6KARLP66WGAHK6IY2OBZ4WW3ZIUQ>
- Contract call transaction: <https://stellar.expert/explorer/testnet/tx/cf4bdadb55d15cb720691a7b580f7bc18f9f9aa986a4ff229fb2fb7a08f48b36>

## Level 5 Checklist

- Production frontend deployment through GitHub Pages
- Smart contracts deployed on Stellar Testnet
- Two Soroban contracts with inter-contract communication
- Event streaming through Soroban RPC with live frontend updates
- 50-user Blue Belt growth target in the product UI
- Active Testnet transaction proof tracking in the backend
- Backend analytics and monitoring endpoints
- In-app user feedback collection
- Interaction proof endpoint for 50+ real transaction wallets
- Google Form response export workbook for user details and feedback analysis
- Pitch deck for problem, solution, market, architecture, growth strategy, and roadmap
- CI workflow for contract tests, contract build, backend tests, frontend tests, and frontend build
- Mobile responsive frontend
- Loading, wallet, transaction, feedback, monitoring, and contract error states
- Complete documentation and Level 5 evidence templates
- 20+ meaningful commits

## Level 5 User Growth Evidence

Level 5 requires 50+ real Testnet users with active transaction proof. Use these files to collect and verify the evidence before submission:

- Submission guide: [docs/level-5-submission.md](docs/level-5-submission.md)
- Evidence pack: [docs/level-5-evidence/](docs/level-5-evidence/)
- Wallet transaction tracker: [docs/level-5-evidence/user-wallet-interactions.csv](docs/level-5-evidence/user-wallet-interactions.csv)
- Feedback iteration summary: [docs/level-5-evidence/feedback-iteration-summary.md](docs/level-5-evidence/feedback-iteration-summary.md)

The Google Form should collect name, email, Stellar Testnet wallet address, wallet used, transaction hash, transaction URL, product rating, feedback, and consent. Export the responses to the Excel workbook above before submitting.

## Feedback-Based Improvement Plan

Initial Level 5 improvements shipped from Level 4 feedback themes:

- Users need clearer proof progress, so the UI now shows progress toward the 50 active Testnet wallet target.
- Reviewers need stronger transaction evidence, so the backend proof endpoint now counts wallets with real check-in transaction hashes separately from basic wallet connections.
- The submission needs auditable user feedback, so the project now includes a Google Form field list, wallet interaction tracker, Excel analysis workbook, and iteration summary.

Commit evidence will be added here after the Level 5 commits are pushed.

## Screenshots

Wallet options and desktop UI:

![Wallet options](frontend/public/wallet-options-screenshot.png)

Mobile responsive UI:

![Mobile wallet options](frontend/public/wallet-options-mobile.png)

Test output with passing tests:

![Test output](docs/test-output-screenshot.png)

CI pipeline:

![CI workflow](docs/ci-workflow-screenshot.png)

Level 4 evidence pack:

```text
docs/level-4-submission.md
docs/level-4-evidence/
```

Level 5 evidence pack:

```text
docs/level-5-submission.md
docs/level-5-evidence/
```

## Architecture

```text
frontend/
  src/
    lib/
      checkin.ts       TypeScript client for check-in contract
      badge.ts         TypeScript client for badge contract
      events.ts        Soroban RPC event polling
      reputation.ts    UI reputation helpers and tests
contracts/
  checkin/             Main wallet check-in contract
  badge/               Reputation scoring contract
backend/
  server.js            Horizon lookup, analytics, feedback, and Level 5 proof APIs
.github/workflows/
  ci.yml               Tests and builds contracts/backend/frontend
  pages.yml            Deploys frontend to GitHub Pages
  contracts.yml        Manual contract deployment workflow
```

## Smart Contracts

### Check-in Contract

Path:

```text
contracts/checkin
```

Functions:

```text
check_in(user: Address) -> u32
get_count(user: Address) -> u32
total() -> u32
configure_badge(admin: Address, badge_contract: Address) -> Address
badge_contract() -> Option<Address>
```

Events:

```text
CheckIn(check_in, user) -> [user_count, total_count, badge_score]
BadgeLinked(badge_linked, admin) -> badge_contract
```

### Badge Contract

Path:

```text
contracts/badge
```

Functions:

```text
record(user: Address, checkins: u32, total_checkins: u32) -> u32
score(user: Address) -> u32
total_badges() -> u32
```

Event:

```text
BadgeUpdated(badge_updated, user) -> [score, total_badges]
```

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
  --contract-id CDX47DA7XCWBN7LUQ4Z3NCVPGQ3D7GOLWJPR6EPT6SU4QU3V7DYFOAM5 \
  --network testnet \
  --output-dir frontend/packages/checkin \
  --overwrite

stellar contract bindings typescript \
  --contract-id CB5PJLAQUHUT4I23NLKNJQWCAQ5X6KARLP66WGAHK6IY2OBZ4WW3ZIUQ \
  --network testnet \
  --output-dir frontend/packages/badge \
  --overwrite
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
POST /api/analytics
GET /api/analytics/summary
POST /api/feedback
GET /api/feedback/summary
GET /api/interactions/proof
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

## Tests

Run all contract tests:

```bash
cargo test
```

Run frontend tests:

```bash
cd frontend
npm test
```

Run backend tests:

```bash
cd backend
npm test
```

Build frontend:

```bash
cd frontend
npm run build
```

## Deployment

Local contract deployment helper:

```bash
NETWORK=testnet SOURCE_ACCOUNT=alice ./scripts/deploy-level3.sh
```

GitHub Actions:

- `Level 4 CI` runs on push and pull request.
- `Deploy Frontend` builds and publishes the frontend to GitHub Pages.
- `Deploy Contracts` is a manual workflow for contract deployment. Add `STELLAR_SECRET_KEY` as a repository secret before enabling deploy mode.

## Use the App

1. Install or open a StellarWalletsKit-supported wallet.
2. Switch the wallet to Testnet.
3. Open the frontend.
4. Choose a wallet.
5. Click `Check in on-chain`.
6. Confirm the transaction in your wallet.
7. Watch the transaction tracker, live contract event feed, and reputation score update.

## Tech Stack

- Stellar Soroban
- Rust
- React
- TypeScript
- Vite
- Vitest
- Node.js
- Express
- StellarWalletsKit
- Stellar SDK
- Stellar Horizon Testnet
- Soroban RPC events
- GitHub Actions
