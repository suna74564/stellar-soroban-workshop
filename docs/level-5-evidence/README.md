# Level 5 Evidence Pack

Collect real Level 5 review artifacts here before the monthly deadline.

## Required Files and Links

- `user-wallet-interactions.csv`: one row per real Testnet user transaction.
- `proofbull-level-5-feedback-analysis.xlsx`: exported and analyzed Google Form responses.
- `proofbull-level-5-pitch-deck.pptx`: professional pitch deck.
- `feedback-iteration-summary.md`: feedback themes, shipped changes, and next improvements.
- `google-form-setup.md`: exact Google Form field and export checklist.
- `demo-recording-script.md`: walkthrough script for the required demo video.
- `growth-playbook.md`: 50-user onboarding and retention plan.
- `feedback-analysis-guide.md`: response tagging and iteration summary format.
- Google Form URL in the root `README.md`.
- Demo video URL in the root `README.md`.
- Screenshots showing desktop UI, mobile UI, analytics, and transaction activity.

## Wallet Interaction Proof Rules

Use only real Testnet wallet interactions from actual users.

Each counted user should have:

- Name from the Google Form.
- Email from the Google Form.
- Real Stellar public key.
- Wallet used.
- Transaction hash from an on-chain check-in.
- Stellar Expert transaction URL.
- Product rating and feedback.
- Consent note confirming the user agreed to be included as testnet feedback proof.

Do not include secret keys, recovery phrases, private keys, phone numbers, or sensitive private notes.

## Export Endpoints

When the backend is running, these endpoints help create reviewer-friendly evidence exports:

- `GET /api/interactions/proof.csv`: active transaction wallet proof rows.
- `GET /api/feedback/export.csv`: in-app feedback rows for workbook analysis.
- `GET /api/interactions/proof`: JSON proof summary for the monitoring UI.

## Google Form Fields

Use these fields when creating the Google Form:

- Name
- Email
- Stellar Testnet wallet address
- Wallet used
- Did you complete an on-chain check-in?
- Testnet transaction hash
- Stellar Expert transaction URL
- Rate ProofBull from 1 to 5
- What was confusing or slow?
- What should we improve next?
- Consent to include anonymized feedback in the Level 5 submission

## Submission Guardrail

The evidence files in this folder are templates until real user responses and transaction hashes are collected. Do not submit with fabricated, duplicate, or self-generated wallet rows.
