-- Tighten task lifecycle permissions. Apply after 202610280001_auth_rbac.sql.
-- Direct browser UPDATE is disabled; status changes go through a validated RPC.

drop policy if exists "employers update own tasks" on public.market_tasks;

create or replace function public.transition_market_task(
  p_task_id uuid,
  p_next_status public.market_task_status
)
returns public.market_tasks
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_task public.market_tasks;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select t.* into current_task
  from public.market_tasks t
  where t.id = p_task_id
  for update;

  if not found then
    raise exception 'Task not found' using errcode = 'P0002';
  end if;

  if current_task.created_by <> auth.uid() then
    raise exception 'Only the task owner may change its status' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.market_profiles p
    where p.id = auth.uid() and p.profile_type in ('client', 'both')
  ) then
    raise exception 'Employer role required' using errcode = '42501';
  end if;

  if not (
    (current_task.status = 'open' and p_next_status in ('reviewing', 'cancelled')) or
    (current_task.status = 'reviewing' and p_next_status in ('open', 'contracting', 'cancelled')) or
    (current_task.status = 'contracting' and p_next_status in ('reviewing', 'in_progress', 'cancelled')) or
    (current_task.status = 'in_progress' and p_next_status in ('acceptance', 'disputed', 'cancelled')) or
    (current_task.status = 'acceptance' and p_next_status in ('in_progress', 'completed', 'disputed')) or
    (current_task.status = 'disputed' and p_next_status in ('in_progress', 'cancelled'))
  ) then
    raise exception 'Invalid task status transition: % -> %', current_task.status, p_next_status
      using errcode = '22023';
  end if;

  update public.market_tasks
  set status = p_next_status, updated_at = now()
  where id = p_task_id
  returning * into current_task;

  return current_task;
end;
$$;

revoke all on function public.transition_market_task(uuid, public.market_task_status) from public;
grant execute on function public.transition_market_task(uuid, public.market_task_status) to authenticated;

-- The RPC is the only browser-accessible task update path. Keep the table protected
-- against accidental future policy grants by revoking direct UPDATE from client roles.
revoke update on public.market_tasks from anon, authenticated;
