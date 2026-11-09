-- Executar antes de publicar a versão que oferece acompanhamento de pedidos.
alter table public.orders add column if not exists tracking_token_hash text;
alter table public.orders add column if not exists dispatched_at timestamptz;
create unique index if not exists orders_tracking_token_hash_idx on public.orders (tracking_token_hash) where tracking_token_hash is not null;
