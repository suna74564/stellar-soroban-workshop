# ProofBull Level 4 Submission

## Status

ProofBull is now prepared as a Level 4 production MVP candidate with:

- Production frontend deployment through GitHub Pages.
- Stellar Testnet smart contract integrations for check-ins and reputation badges.
- Wallet onboarding checklist inside the product.
- Analytics and monitoring endpoints in the backend.
- In-app user feedback collection.
- Test coverage for reputation helpers, analytics helpers, and backend telemetry APIs.

## Live Links

- App: https://suna74564.github.io/stellar-soroban-workshop/
- Repository: https://github.com/suna74564/stellar-soroban-workshop
- Demo video: pending final recording

## Contract Addresses

Check-in contract:

```text
CDX47DA7XCWBN7LUQ4Z3NCVPGQ3D7GOLWJPR6EPT6SU4QU3V7DYFOAM5
```

Reputation badge contract:

```text
CB5PJLAQUHUT4I23NLKNJQWCAQ5X6KARLP66WGAHK6IY2OBZ4WW3ZIUQ
```

## Level 4 Evidence Checklist

Before submitting, capture and attach these items:

- Public GitHub repository URL.
- Live demo URL.
- Demo video URL.
- Contract deployment addresses.
- Desktop product screenshot.
- Mobile responsive screenshot.
- Monitoring or analytics setup screenshot.
- Proof of 10+ real user wallet interactions.
- Basic user feedback summary.

Use the files in `docs/level-4-evidence/` to collect the final proof package.

## Demo Flow

1. Open the production frontend.
2. Show the wallet options and the real user activation checklist.
3. Connect a Stellar Testnet wallet.
4. Confirm that account telemetry loads from the backend.
5. Click `Check in on-chain`.
6. Sign the transaction in the wallet.
7. Show the transaction tracker moving from signature to ledger confirmation.
8. Open the transaction explorer link.
9. Show the contract event tape updating.
10. Submit a short feedback response.
11. Show the monitoring strip with backend status, wallet proof count, check-ins, feedback, and errors.

## Verification Commands

```bash
cargo test
cd backend && npm test
cd ../frontend && npm test
cd ../frontend && npm run build
```
