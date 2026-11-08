-- Cantinho do Céu: estrutura segura de pedidos.
-- Rode este arquivo inteiro em Supabase > SQL Editor > New query > Run.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity unique,
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  fulfillment text not null check (fulfillment in ('delivery', 'pickup')),
  address text,
  payment_method text not null check (payment_method in ('online_pix', 'pay_at_counter')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid')),
  order_status text not null default 'new' check (order_status in ('new', 'accepted', 'preparing', 'ready', 'completed', 'cancelled')),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  delivery_cents integer not null default 0 check (delivery_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  items jsonb not null check (jsonb_array_length(items) > 0),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint delivery_needs_address check (fulfillment <> 'delivery' or address is not null)
);

create table if not exists public.team_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;
alter table public.team_members enable row level security;

-- O cliente nunca escreve direto no banco: o pedido entra pela rota protegida
-- do site. Apenas usuários marcados como equipe conseguem ler pedidos.
create policy "team members can view orders"
on public.orders for select to authenticated
using (exists (select 1 from public.team_members where user_id = auth.uid()));

create policy "team members can update orders"
on public.orders for update to authenticated
using (exists (select 1 from public.team_members where user_id = auth.uid()))
with check (exists (select 1 from public.team_members where user_id = auth.uid()));

create policy "team member reads own membership"
on public.team_members for select to authenticated
using (user_id = auth.uid());

-- Depois de criar o primeiro usuário da equipe em Authentication > Users,
-- rode uma vez (trocando o UUID pelo dele):
-- insert into public.team_members (user_id) values ('UUID_DO_USUARIO');
