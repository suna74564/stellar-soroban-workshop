# Level 5 Feedback Analysis Guide

Use this guide after exporting Google Form responses into the workbook.

## Response Segments

| Segment | Definition | What to Look For |
| --- | --- | --- |
| Activated user | Unique wallet with a valid check-in transaction hash. | Product feedback counts toward Level 5 proof. |
| Connected only | Wallet address submitted but no transaction hash. | Onboarding blocker or funding problem. |
| Low rating | Rating 1 to 3. | Prioritize for immediate iteration. |
| High rating | Rating 4 to 5. | Look for strengths to mention in the pitch. |

## Theme Tags

Tag each response with one primary theme:

- Wallet selection
- Testnet funding
- Transaction confirmation
- Mobile layout
- Trust/reputation value
- Performance
- Documentation

## Iteration Summary Format

For every shipped improvement, add:

```text
Feedback theme:
Evidence:
Change shipped:
Commit link:
Next measurement:
```

## Metrics to Report

- Total form responses.
- Unique wallet addresses submitted.
- Unique activated wallets with valid transaction hashes.
- Average product rating.
- Lowest-rated onboarding step.
- Top requested next feature.
- Number of fixes shipped after feedback.

## Reviewer Note

Do not claim the 50-user requirement is complete until the activated wallet count is 50 or higher and every counted wallet has a verifiable Testnet transaction URL.
