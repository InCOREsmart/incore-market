# InCORE Market

**Единое ядро для рынка работы по измеримому результату.** InCORE Market соединяет бизнес-заказчиков и специалистов/команды вокруг конкретных задач, проверяемых критериев, этапов и прозрачной приёмки. Отраслевые вертикали работают поверх общего ядра, а не как отдельные продукты.

## Product slices

- **Эффективность бизнеса** — ФОТ, производительность, оргдизайн, потери процессов и автоматизация.
- **Управление продажами** — воронка, конверсия, выручка и коммерческие процессы.
- **Проектное управление** — поставка этапов, сроки, риски и результат.
- **Цифровизация процессов** — автоматизация, интеграции и снижение ручного труда.
- **HR** — подбор, адаптация, развитие и внутренняя мобильность.
- **Управленческие задачи** — диагностика, стратегия, изменения и операционные улучшения.

## Current implementation

The first slice is a responsive working prototype with:
- vertical navigation and a unified task marketplace;
- task cards with budget, timeframe, outcome and acceptance criteria;
- task creation form;
- specialist proposal submission;
- contract lifecycle state machine with versioned terms, milestones, evidence, acceptance and dispute states;
- activity/audit trail and example specialist result profiles;
- fictional seed data so the interface can be explored without credentials.

The UI currently persists demo interactions in local browser storage. It is **not** connected to live accounts, a production database, escrow, a payment provider, or a deployed blockchain contract. The contract engine is a domain model and adapter boundary, not a claim that money is held or paid automatically. Before live use, connect authenticated persistence, harden authorization, select a legally suitable payment flow, and add dispute operations.

## Run locally

Requirements: Node.js 20+.

```bash
npm install
npm run dev
```

Build and type-check:

```bash
npm run build
```

## Architecture

- `src/domain.ts`: shared task/proposal/contract types, allowed state transitions and audit events.
- `src/App.tsx`: marketplace experience and demo workflows.
- `supabase/schema.sql`: proposed isolated schema for profiles, tasks, proposals, contracts, milestones, evidence and immutable-style event records with RLS.
- `docs/PRODUCT-ARCHITECTURE.md`: shared-core/vertical model and integration boundaries.
- `docs/LAUNCH-CHECKLIST.md`: gates before production use.

## Safety and trust boundaries

- Demo records are fictional.
- A result is only verifiable when acceptance criteria are measurable or an authorized reviewer/defined dispute process resolves ambiguity.
- Contract state is not proof of a legal escrow or payment.
- Do not put real personal, banking, passport or confidential business data into the demo.
- Apply the SQL only to a new dedicated Supabase project after review; do not run it against the existing InCORE project blindly.
