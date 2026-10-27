-- Apply only to a new dedicated Supabase project after review.
-- This schema is a starting point, not a production-ready security sign-off.
create extension if not exists pgcrypto;

create type public.market_task_status as enum ('open','reviewing','contracting','in_progress','acceptance','completed','disputed','cancelled');
create type public.market_contract_status as enum ('draft','proposed','active','submitted','accepted','disputed','cancelled');
create type public.market_milestone_status as enum ('pending','submitted','accepted','rejected');

create table public.market_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  profile_type text not null check (profile_type in ('client','specialist','both')),
  headline text,
  skills text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.market_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.market_org_members (
  organization_id uuid not null references public.market_organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','manager','member','reviewer')),
  created_at timestamptz not null default now(),
  primary key (organization_id,user_id)
);

create table public.market_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.market_organizations(id),
  created_by uuid not null references auth.users(id),
  vertical text not null check (vertical in ('efficiency','sales','projects','digital','hr','management')),
  category text not null,
  title text not null check (length(trim(title)) between 5 and 180),
  description text not null,
  outcome text not null,
  acceptance_criteria jsonb not null default '[]'::jsonb,
  budget_minor bigint not null check (budget_minor > 0),
  currency char(3) not null default 'RUB',
  target_days integer not null check (target_days > 0),
  required_skills text[] not null default '{}',
  status public.market_task_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.market_proposals (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.market_tasks(id) on delete cascade,
  specialist_id uuid not null references auth.users(id),
  headline text not null,
  approach text not null,
  price_minor bigint not null check (price_minor > 0),
  currency char(3) not null default 'RUB',
  delivery_days integer not null check (delivery_days > 0),
  relevant_evidence jsonb not null default '[]'::jsonb,
  status text not null default 'submitted' check (status in ('submitted','shortlisted','selected','declined','withdrawn')),
  created_at timestamptz not null default now(),
  unique(task_id,specialist_id)
);

create table public.market_contracts (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null unique references public.market_tasks(id),
  client_id uuid not null references auth.users(id),
  specialist_id uuid not null references auth.users(id),
  version integer not null default 1 check (version > 0),
  status public.market_contract_status not null default 'draft',
  terms_snapshot jsonb not null,
  amount_minor bigint not null check (amount_minor > 0),
  currency char(3) not null default 'RUB',
  accepted_by_client_at timestamptz,
  accepted_by_specialist_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (client_id <> specialist_id)
);

create table public.market_milestones (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.market_contracts(id) on delete cascade,
  ordinal integer not null check (ordinal > 0),
  title text not null,
  criteria text not null,
  amount_minor bigint not null check (amount_minor >= 0),
  due_at timestamptz,
  status public.market_milestone_status not null default 'pending',
  evidence jsonb not null default '[]'::jsonb,
  reviewer_id uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(contract_id,ordinal)
);

create table public.market_contract_events (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.market_contracts(id) on delete cascade,
  actor_id uuid references auth.users(id),
  event_type text not null,
  contract_version integer not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index market_tasks_status_vertical_idx on public.market_tasks(status,vertical,created_at desc);
create index market_proposals_task_idx on public.market_proposals(task_id,created_at desc);
create index market_contract_events_contract_idx on public.market_contract_events(contract_id,created_at desc);

alter table public.market_profiles enable row level security;
alter table public.market_organizations enable row level security;
alter table public.market_org_members enable row level security;
alter table public.market_tasks enable row level security;
alter table public.market_proposals enable row level security;
alter table public.market_contracts enable row level security;
alter table public.market_milestones enable row level security;
alter table public.market_contract_events enable row level security;

-- Profiles: signed-in users may see marketplace profiles; users may edit only themselves.
create policy "profiles readable to authenticated" on public.market_profiles for select to authenticated using (true);
create policy "profile insert self" on public.market_profiles for insert to authenticated with check (id = auth.uid());
create policy "profile update self" on public.market_profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Organizations and memberships are restricted to members; owner bootstrap must be implemented server-side.
create policy "org members can read org" on public.market_organizations for select to authenticated using (
  exists(select 1 from public.market_org_members m where m.organization_id=id and m.user_id=auth.uid())
);
create policy "org members can read membership" on public.market_org_members for select to authenticated using (user_id=auth.uid());
-- No direct membership or organization writes are exposed by these policies.

-- Public task feed to authenticated users; only creator can insert/update own tasks.
create policy "authenticated read tasks" on public.market_tasks for select to authenticated using (true);
create policy "task creator insert" on public.market_tasks for insert to authenticated with check (created_by=auth.uid());
create policy "task creator update" on public.market_tasks for update to authenticated using (created_by=auth.uid()) with check (created_by=auth.uid());

create policy "proposal visible to parties" on public.market_proposals for select to authenticated using (
  specialist_id=auth.uid() or exists(select 1 from public.market_tasks t where t.id=task_id and t.created_by=auth.uid())
);
create policy "specialist submits own proposal" on public.market_proposals for insert to authenticated with check (specialist_id=auth.uid());

create policy "contract visible to parties" on public.market_contracts for select to authenticated using (client_id=auth.uid() or specialist_id=auth.uid());
-- Contract transitions and event insertion must be performed by a validated server function/service role.
create policy "milestones visible to parties" on public.market_milestones for select to authenticated using (
  exists(select 1 from public.market_contracts c where c.id=contract_id and (c.client_id=auth.uid() or c.specialist_id=auth.uid()))
);
create policy "events visible to parties" on public.market_contract_events for select to authenticated using (
  exists(select 1 from public.market_contracts c where c.id=contract_id and (c.client_id=auth.uid() or c.specialist_id=auth.uid()))
);
-- Deliberately no client-side write policies for contracts, milestones or event ledger.
