# InCORE Market

**Единое ядро для рынка работы по измеримому результату.** InCORE Market соединяет бизнес-заказчиков и специалистов/команды вокруг конкретных задач, проверяемых критериев, этапов и прозрачной приёмки.

## Product slices

- **Эффективность бизнеса** — ФОТ, производительность, оргдизайн, потери процессов и автоматизация.
- **Управление продажами** — воронка, конверсия, выручка и коммерческие процессы.
- **Проектное управление** — поставка этапов, сроки, риски и результат.
- **Цифровизация процессов** — автоматизация, интеграции и снижение ручного труда.
- **HR** — подбор, адаптация, развитие и внутренняя мобильность.
- **Управленческие задачи** — диагностика, стратегия, изменения и операционные улучшения.

## Current implementation

- Supabase Auth sign-up/sign-in and server-issued sessions.
- Account role comes from the authenticated server profile; there is no client-side role switch.
- Database trigger creates the profile; Postgres RLS restricts task creation/editing and proposal submission by role and record ownership.
- Employer and candidate have separate navigation and actions in the prototype.
- Contract/milestone/event writes remain blocked from the browser until validated server-side RPCs are implemented.
- The marketplace UI still uses fictional seed records and browser-local task/proposal/contract interactions. These are not live marketplace records.

## Supabase setup

Follow [docs/SUPABASE-AUTH.md](docs/SUPABASE-AUTH.md). Create a dedicated Supabase project, run **supabase/schema.sql** and then **supabase/migrations/202610280001_auth_rbac.sql**, and configure the two public Vite variables in the GitHub Pages build environment.

**Never expose the Supabase service-role key in the frontend.** RLS must remain enabled.

## Run locally

Requirements: Node.js 20+.

    npm install
    cp .env.example .env.local
    npm run dev

Build and type-check:

    npm run typecheck
    npm run build
    npm test

## Architecture and trust boundaries

- **src/domain.ts**: task/proposal/contract types and allowed state transitions.
- **src/App.tsx**: marketplace prototype and demo workflows.
- **src/auth.tsx**: Supabase session, profile lookup and registration/login.
- **src/lib/supabase.ts**: public browser client configuration.
- **supabase/schema.sql**: database tables and baseline RLS.
- **supabase/migrations/202610280001_auth_rbac.sql**: signup profile trigger and role-specific RLS.
- **docs/SUPABASE-AUTH.md**: setup and current implementation boundary.
- **docs/LAUNCH-CHECKLIST.md**: launch gates.

A contract status is not proof of legal escrow or payment. Do not enter real personal, banking, passport or confidential business data until server persistence, privacy controls, and security tests are complete.
