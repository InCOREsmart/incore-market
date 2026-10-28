-- Run after supabase/schema.sql in the dedicated InCORE Market Supabase project.
-- Auth identity comes only from Supabase Auth; never trust a user_id sent by the browser.

create or replace function public.handle_new_market_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_type text;
  requested_name text;
begin
  requested_type := coalesce(new.raw_user_meta_data ->> 'profile_type', 'specialist');
  if requested_type not in ('client', 'specialist') then
    requested_type := 'specialist';
  end if;

  requested_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), '');
  if requested_name is null then
    requested_name := split_part(coalesce(new.email, 'Пользователь'), '@', 1);
  end if;

  insert into public.market_profiles (id, display_name, profile_type)
  values (new.id, left(requested_name, 120), requested_type)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_market_profile on auth.users;
create trigger on_auth_user_created_market_profile
  after insert on auth.users
  for each row execute function public.handle_new_market_user();

-- A user can edit their public profile, but cannot promote themselves to another role.
create or replace function public.prevent_market_role_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.profile_type is distinct from old.profile_type then
    raise exception 'Account role cannot be changed by the profile owner';
  end if;
  return new;
end;
$$;

drop trigger if exists market_profile_role_immutable on public.market_profiles;
create trigger market_profile_role_immutable
  before update of profile_type on public.market_profiles
  for each row execute function public.prevent_market_role_change();

drop policy if exists "profile insert self" on public.market_profiles;
drop policy if exists "task creator insert" on public.market_tasks;
drop policy if exists "task creator update" on public.market_tasks;
drop policy if exists "specialist submits own proposal" on public.market_proposals;

-- Profile creation is trigger-only. Authenticated users can only edit their own non-role fields.
create policy "profile update own non-role fields" on public.market_profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Anyone signed in may browse the public marketplace. Only client accounts can publish/manage tasks.
create policy "employers create own tasks" on public.market_tasks
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and exists (
      select 1 from public.market_profiles p
      where p.id = (select auth.uid()) and p.profile_type in ('client', 'both')
    )
    and (
      organization_id is null
      or exists (
        select 1 from public.market_org_members m
        where m.organization_id = market_tasks.organization_id
          and m.user_id = (select auth.uid())
          and m.role in ('owner', 'manager')
      )
    )
  );

create policy "employers update own tasks" on public.market_tasks
  for update to authenticated
  using (
    created_by = (select auth.uid())
    and exists (
      select 1 from public.market_profiles p
      where p.id = (select auth.uid()) and p.profile_type in ('client', 'both')
    )
  )
  with check (
    created_by = (select auth.uid())
    and exists (
      select 1 from public.market_profiles p
      where p.id = (select auth.uid()) and p.profile_type in ('client', 'both')
    )
    and (
      organization_id is null
      or exists (
        select 1 from public.market_org_members m
        where m.organization_id = market_tasks.organization_id
          and m.user_id = (select auth.uid())
          and m.role in ('owner', 'manager')
      )
    )
  );

-- A specialist can submit only as themselves and cannot apply to their own task.
create policy "specialists submit own proposals" on public.market_proposals
  for insert to authenticated
  with check (
    specialist_id = (select auth.uid())
    and exists (
      select 1 from public.market_profiles p
      where p.id = (select auth.uid()) and p.profile_type in ('specialist', 'both')
    )
    and exists (
      select 1 from public.market_tasks t
      where t.id = market_proposals.task_id
        and t.created_by <> (select auth.uid())
        and t.status in ('open', 'reviewing')
    )
  );

-- No browser write policies are granted for contracts, milestones, or the event ledger.
-- Contract creation/transitions must be exposed later through validated RPCs or a trusted server.
