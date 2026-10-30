-- Persist employer-facing company label and expose proposals only to their parties.
alter table public.market_tasks add column if not exists company_name text not null default 'Заказчик';

drop policy if exists "proposal visible to parties" on public.market_proposals;
create policy "proposal visible to parties" on public.market_proposals
for select to authenticated
using (
  specialist_id = (select auth.uid())
  or exists (
    select 1 from public.market_tasks t
    where t.id = market_proposals.task_id and t.created_by = (select auth.uid())
  )
);

-- Keep proposal identity and commercial terms immutable from the browser after submission.
revoke update, delete on public.market_proposals from anon, authenticated;
