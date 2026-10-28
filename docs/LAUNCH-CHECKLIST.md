# Launch checklist

The current app is a functional prototype. Authentication and database RLS are implemented as a Supabase integration foundation, but the live project connection and server-backed marketplace workflows must be configured and verified before production use.

## Identity and authorization
- [ ] Create a dedicated Supabase project and apply **supabase/schema.sql** followed by **supabase/migrations/202610280001_auth_rbac.sql**.
- [ ] Configure **VITE_SUPABASE_URL** and **VITE_SUPABASE_ANON_KEY** in the GitHub Pages build workflow; never expose a service-role key.
- [ ] Verify signup, email confirmation, login, session refresh, logout and recovery behavior.
- [ ] Test that a specialist cannot create/update tasks, an employer cannot submit proposals, and users cannot mutate another user's profile, task or proposal.
- [ ] Add validated server-side RPCs for contract creation/transitions and append-only audit events before enabling those actions.
- [ ] Replace browser-local task/proposal/contract state with authenticated server persistence.
- [ ] Add automated cross-account RLS integration tests for anonymous, employer, specialist, reviewer and administrator contexts.

## Before live accounts
- [ ] Choose legal operator, jurisdictions, contracting model and dispute policy.
- [ ] Approve privacy notice, consent, terms, retention/deletion and data-subject workflows.
- [ ] Choose hosting/database region and assess applicable data-residency requirements.
- [ ] Configure rate limits, abuse/reporting, moderation, backups, monitoring and incident response.

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
- [ ] Run **npm install**, **npm run typecheck**, **npm run build**.
- [ ] Add unit tests for every allowed/forbidden contract transition and financial edge case.
- [ ] Add end-to-end tests for publish → proposal → contract → evidence → acceptance/dispute.
- [ ] Accessibility review, mobile browser checks and load/security testing.
