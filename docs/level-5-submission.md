# ProofBull Level 5 Submission

## Status

ProofBull is being prepared as a Level 5 Blue Belt candidate focused on user growth, feedback-driven iteration, and a stronger product story.

The Level 5 version adds:

- A 50-user growth target in the product monitoring flow.
- Active Testnet transaction proof tracking through the backend.
- A feedback export and analysis workbook for Google Form responses.
- A pitch deck structure for ecosystem/demo presentation.
- A clear next-phase roadmap tied to collected user feedback.

## Live Links

- App: https://suna74564.github.io/stellar-soroban-workshop/
- Repository: https://github.com/suna74564/stellar-soroban-workshop
- Google Form: TODO - add the live Google Form URL.
- Exported Excel sheet: `docs/level-5-evidence/proofbull-level-5-feedback-analysis.xlsx`
- Pitch deck: `docs/level-5-evidence/proofbull-level-5-pitch-deck.pptx`
- Demo video: TODO - add the full product walkthrough URL.

## Contract Addresses

Check-in contract:

```text
CDX47DA7XCWBN7LUQ4Z3NCVPGQ3D7GOLWJPR6EPT6SU4QU3V7DYFOAM5
```

Reputation badge contract:

```text
CB5PJLAQUHUT4I23NLKNJQWCAQ5X6KARLP66WGAHK6IY2OBZ4WW3ZIUQ
```

## User Growth Evidence

Level 5 requires 50+ real Testnet users with real transaction activity.

Use `docs/level-5-evidence/user-wallet-interactions.csv` to track wallet and transaction proof. Do not submit this level until:

- At least 50 unique real user wallets are present.
- Each counted user has an on-chain Testnet transaction hash.
- Each transaction hash links to Stellar Expert or another verifiable Testnet explorer.
- Google Form responses have been exported to the Excel workbook.

## Demo Flow

1. Open the production frontend.
2. Show the Blue Belt growth target and live monitoring tiles.
3. Connect a Stellar Testnet wallet.
4. Confirm account telemetry and wallet network details.
5. Complete an on-chain check-in.
6. Open the Testnet transaction explorer link.
7. Show the contract event tape updating.
8. Submit product feedback.
9. Show the analytics/proof summary for active Testnet users.
10. Walk through the feedback iteration summary and next roadmap.

## Verification Commands

```bash
cargo test
cd backend && npm test
cd ../frontend && npm test
cd ../frontend && npm run build
```
