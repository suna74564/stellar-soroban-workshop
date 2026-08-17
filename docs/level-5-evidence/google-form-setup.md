# Level 5 Google Form Setup

Use this checklist to create the required ProofBull user onboarding form.

## Form Title

```text
ProofBull Level 5 Testnet User Feedback
```

## Required Questions

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| Name | Short answer | Yes | Reviewer-facing evidence only. |
| Email | Short answer | Yes | Do not publish raw emails in screenshots. |
| Stellar Testnet wallet address | Short answer | Yes | Must start with `G` and match the wallet used in the app. |
| Wallet used | Multiple choice | Yes | Freighter, xBull, Lobstr, Rabet, Other. |
| Did you complete an on-chain check-in? | Yes/No | Yes | Count only `Yes` responses for the 50-user proof. |
| Testnet transaction hash | Short answer | Yes | Must be the on-chain ProofBull check-in transaction. |
| Stellar Expert transaction URL | Short answer | Yes | Use the Testnet explorer URL. |
| Rate ProofBull from 1 to 5 | Linear scale | Yes | Use `1 = confusing`, `5 = very clear`. |
| What was confusing or slow? | Paragraph | Yes | Main source for iteration themes. |
| What should we improve next? | Paragraph | Yes | Use this for the roadmap section. |
| Consent to include anonymized feedback | Checkbox | Yes | Required before using the response as submission proof. |

## Export Flow

1. Open the Google Form responses tab.
2. Link responses to Google Sheets.
3. Remove or hide raw email columns before taking screenshots.
4. Export the response sheet as `.xlsx`.
5. Replace `docs/level-5-evidence/proofbull-level-5-feedback-analysis.xlsx`.
6. Add the public form URL to the root `README.md`.
7. Add the exported workbook link to the Level 5 submission page.

## Evidence Rules

- Count only unique wallet addresses with a real Testnet transaction hash.
- Do not include secret keys, recovery phrases, phone numbers, or private notes.
- Do not fabricate rows or duplicate one transaction across multiple users.
- Keep the raw sheet private if it includes email addresses; publish only the exported workbook required by the program.
