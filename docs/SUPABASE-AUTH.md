# Supabase Auth and role-based access

This project uses Supabase Auth for server-issued sessions and Postgres Row Level Security (RLS) for database authorization. The browser never receives the Supabase **service_role** secret.

## One-time setup

1. Create a **dedicated Supabase project for InCORE Market**. Do not reuse the production InCORE project.
2. In SQL Editor, run **supabase/schema.sql**, then **supabase/migrations/202610280001_auth_rbac.sql**, in that order.
3. In Authentication → URL Configuration, set the Site URL to **https://incoresmart.github.io/incore-market/** and add that URL plus **http://localhost:5173/** to Redirect URLs.
4. In the repository's Settings → Secrets and variables → Actions → Variables, add:
   - **VITE_SUPABASE_URL**: the project URL from Supabase → Project Settings → API.
   - **VITE_SUPABASE_ANON_KEY**: the project's publishable/anon key. This key is intended for the browser and is safe only with RLS enabled.
5. Ensure the GitHub Pages build workflow maps both repository variables into the build step's environment as **VITE_SUPABASE_URL: ${{ vars.VITE_SUPABASE_URL }}** and **VITE_SUPABASE_ANON_KEY: ${{ vars.VITE_SUPABASE_ANON_KEY }}**. Vite embeds these values at build time; merely adding repository variables is not enough.
6. Redeploy Pages and test registration with separate employer and specialist accounts. Confirm email verification settings and allowed redirect URLs.
7. For local development, copy **.env.example** to **.env.local**, enter the same two public client values, then run **npm install** and **npm run dev**.

## Authorization rules in the database

- The Auth user UUID is the profile primary key. A database trigger creates the profile on signup.
- The role is chosen from the allowed values at signup and cannot be changed by updating the profile.
- Employer/client profiles may create and edit only their own tasks.
- Specialist profiles may submit a proposal only as their own user, only to an open task, and never to their own task.
- Contract, milestone and contract-event tables intentionally have no browser write policies. Validated server-side RPCs are required before contract lifecycle writes can be enabled.
- Public task discovery and authenticated profile discovery are separate from permission to mutate records.

## Additional task lifecycle guardrail

Apply `supabase/migrations/202610290001_market_task_guardrails.sql` after the auth/RLS migration. It removes direct task-update permission and exposes `transition_market_task(...)`, which validates the authenticated owner, employer role, and allowed status transitions. This migration does not make the current UI server-backed: task/proposal/contract screens still use demo records until the data layer is replaced and tested.

## Current implementation boundary

Authentication/session and the RLS foundation are real once the project and build variables are configured. The marketplace task/proposal/contract UI still contains demo seed records and browser-local interactions. Those are **not** server-persisted marketplace records and must not be used for real customer data. The next integration step is to replace those local mutations with authenticated Supabase queries and validated RPCs, then add cross-account RLS integration tests before production use.

Never add **service_role**, database passwords, JWT signing secrets, or provider secrets to Vite variables, source code, or GitHub Pages.
