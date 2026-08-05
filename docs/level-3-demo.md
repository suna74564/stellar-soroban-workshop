# Level 3 Demo Notes

## Demo Flow

1. Open the live ProofBull app and show the mobile responsive layout.
2. Connect a Stellar Testnet wallet through StellarWalletsKit.
3. Show the deployed check-in and badge contract IDs in the contract terminal.
4. Trigger `check_in(user)` from the frontend.
5. Confirm the pending, success, or failed transaction state in the UI.
6. Show the live activity feed receiving the new `CheckIn` event.
7. Show the reputation panel updating from the badge contract score.
8. Open GitHub Actions and show the CI workflow running tests and build steps.

## Submission Facts

- Check-in contract: `CDX47DA7XCWBN7LUQ4Z3NCVPGQ3D7GOLWJPR6EPT6SU4QU3V7DYFOAM5`
- Badge contract: `CB5PJLAQUHUT4I23NLKNJQWCAQ5X6KARLP66WGAHK6IY2OBZ4WW3ZIUQ`
- Badge link transaction: `6dc37fe5e283c52e4ffdc848c29c680ab4b7ede66b1253c68970856198e11309`
- Contract interaction transaction: `cf4bdadb55d15cb720691a7b580f7bc18f9f9aa986a4ff229fb2fb7a08f48b36`

## Demo Video Script

ProofBull is a production-ready Stellar Soroban dApp for live builder check-ins and reputation. The frontend connects multiple wallets, calls the deployed check-in contract, and streams contract events back into the activity feed. The check-in contract also communicates with a second badge contract, which calculates a wallet reputation score from check-in history and global participation. The app includes loading states, wallet errors, transaction tracking, mobile responsive UI, contract tests, frontend tests, and GitHub Actions workflows for CI and deployment.
