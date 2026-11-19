-- UNA JOYA - Meta de receita por mês (painel). Só administradoras ativas leem e gravam.
create table if not exists public.finance_goals (
  month text primary key check (month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  revenue_goal_cents bigint not null check (revenue_goal_cents > 0 and revenue_goal_cents < 100000000000),
  updated_at timestamptz not null default now()
);
alter table public.finance_goals enable row level security;
revoke all on public.finance_goals from anon, authenticated;
grant select, insert, update, delete on public.finance_goals to authenticated;
create policy finance_goals_admin_all on public.finance_goals for all to authenticated
  using (public.is_active_admin()) with check (public.is_active_admin());
