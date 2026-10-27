# Launch checklist

The current app is a functional local prototype with fictional data. Do not represent it as a production marketplace or funded escrow.

## Before live accounts
- [ ] Choose legal operator, jurisdictions, contracting model and dispute policy.
- [ ] Approve privacy notice, consent, terms, retention/deletion and data-subject workflows.
- [ ] Choose hosting/database region and assess applicable data-residency requirements.
- [ ] Add authentication, email verification, organization membership, roles and server-side authorization.
- [ ] Configure rate limits, abuse/reporting, moderation, backups, monitoring and incident response.
- [ ] Replace browser-local state with server persistence and database transactions.
- [ ] Test access isolation for anonymous users, employer, specialist, reviewer and administrator.
- [ ] Add versioned acceptance decisions, evidence retention and append-only server-side audit events.

## Before handling real money
- [ ] Select a regulated/legally suitable provider and merchant-of-record/agency model.
- [ ] Confirm KYC/AML responsibilities, invoices, tax/receipts, fees, refunds and chargebacks.
- [ ] Implement provider webhook signature checks, idempotency keys and reconciliation.
- [ ] Separate agreement status from provider payment status; never infer payment from contract acceptance.
- [ ] Define who may release/refund funds and how disputes pause settlement.
- [ ] Test failures, duplicate webhooks, partial refunds and interrupted payouts.

## Before blockchain anchoring
- [ ] Decide what needs public verifiability and why a database audit trail is insufficient.
- [ ] Never put personal or confidential task data on a public chain.
- [ ] Define canonical serialization, hash versioning, signer identity, key custody, fees and recovery.
- [ ] Record chain/transaction status separately from business acceptance and payment status.
- [ ] Threat-model replay, wrong-network, failed transaction and compromised key scenarios.

## Quality
- [ ] Run `npm install`, `npm run typecheck`, `npm run build`.
- [ ] Add unit tests for every allowed/forbidden contract transition and financial edge case.
- [ ] Add end-to-end tests for publish → proposal → contract → evidence → acceptance/dispute.
- [ ] Accessibility review, mobile browser checks and load/security testing.
