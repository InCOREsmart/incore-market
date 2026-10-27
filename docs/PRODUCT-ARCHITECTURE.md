# InCORE Market: product architecture

## Product principle

One core, multiple markets. A vertical is a market vocabulary and workflow configuration, not a forked application.

## Shared core

1. **Identity and trust** — organizations, people, specialist teams, capabilities and verified outcome history.
2. **Problem/task** — business context, baseline, target outcome, constraints, budget, time window and acceptance criteria.
3. **Matching and proposals** — approaches, scope, price, delivery plan, relevant skills and evidence.
4. **Agreement** — immutable versions of scope, amount, milestones, deadlines, acceptance rules, dispute process and cancellation terms.
5. **Delivery** — milestone status, artifacts/evidence, comments, reviewer decisions and timestamps.
6. **Settlement adapter** — funding, payment authorization, capture, release, refund and provider webhooks. This is an interface boundary until a suitable provider and legal model are selected.
7. **Reputation and analytics** — accepted outcomes, delivery reliability, variance against agreed scope, and business effects with source and attribution caveats.

## Vertical configuration

| Vertical | Example outcome | Typical acceptance evidence |
|---|---|---|
| Business effectiveness | Reduce avoidable cost without harming output | Baseline, transparent assumptions, savings calculation, owner-approved plan |
| Sales management | Improve qualified opportunity conversion | CRM cohort, stage definitions, conversion measurement |
| Project management | Deliver a milestone portfolio on agreed dates | Accepted artifacts, milestone status, risk register |
| Process digitization | Reduce manual handling time | Process map, before/after sample, system logs |
| HR | Reduce time to productivity | Role-specific baseline, onboarding assets, cohort measure |
| Management | Improve decision speed and ownership | Decision-rights map, operating cadence, accountable owners |

## Contract lifecycle

`draft → proposed → active → submitted → accepted`

Alternative paths: `active → disputed`, `submitted → active` for rework, and cancellation only where the agreed terms permit it. Transitions must be authorized server-side, idempotent where external events are involved, and append an audit event. A disputed state records a disagreement; it does not decide who is right.

A contract version must snapshot:
- parties and authority to act;
- scope and exclusions;
- measurable criteria and how ambiguous criteria are reviewed;
- amount/currency and fee treatment;
- milestone amounts, due dates and deliverables;
- acceptance/rework window;
- dispute escalation, cancellation and refund rules;
- document/hash references and event timestamps.

## Technical boundaries

- React + TypeScript + Vite UI.
- Domain transitions in `src/domain.ts`, kept independent from persistence.
- A future API/service layer owns authorization and transition validation.
- PostgreSQL/Supabase is a candidate persistence layer, isolated from existing projects.
- Payment and blockchain adapters are separate integrations. A chain transaction may anchor an agreement hash or append an attestation, but cannot magically determine whether a subjective business outcome is true.

## Important trust distinction

A saved UI event is not an immutable audit log. A database append-only table with restricted update/delete permissions improves auditability but is still controlled by the database operator. A public chain anchor can make tampering more detectable, but creates privacy, key-management, fee, legal and correction constraints. Choose only after threat modelling and legal review.
