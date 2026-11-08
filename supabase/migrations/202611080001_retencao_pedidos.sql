-- Remove somente pedidos concluídos há pelo menos 72 horas.
-- Os concluídos antes da ativação recebem um prazo novo de três dias.
-- O agendamento roda de hora em hora, portanto a remoção pode ocorrer
-- até uma hora depois de completadas as 72 horas, enquanto o banco estiver ativo.

begin;

alter table public.orders add column if not exists completed_at timestamptz;

-- A data original dos pedidos já concluídos não existe: nunca adivinhe.
-- Ao ativar, comece a contagem para esses pedidos a partir de agora.
update public.orders
set completed_at = now()
where order_status = 'completed' and completed_at is null;

create or replace function public.cantinho_track_order_completion()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  if tg_op = 'INSERT' then
    if new.order_status = 'completed' then
      new.completed_at := now();
    else
      new.completed_at := null;
    end if;
  elsif new.order_status = 'completed' and old.order_status is distinct from 'completed' then
    new.completed_at := now();
  elsif new.order_status = 'completed' then
    -- Mudanças posteriores no pedido não reiniciam ou alteram a contagem.
    new.completed_at := old.completed_at;
  else
    -- Se um pedido voltar a ficar em andamento, não poderá ser apagado.
    new.completed_at := null;
  end if;
  return new;
end;
$function$;

drop trigger if exists cantinho_track_order_completion on public.orders;
create trigger cantinho_track_order_completion
before insert or update on public.orders
for each row execute function public.cantinho_track_order_completion();

create index if not exists cantinho_completed_orders_retention_idx
on public.orders (completed_at)
where order_status = 'completed';

create extension if not exists pg_cron;

-- O nome fixo evita criar tarefas duplicadas se esta migração for reaplicada.
select cron.schedule(
  'cantinho-remover-pedidos-concluidos',
  '0 * * * *',
  $job$
    delete from public.orders
    where order_status = 'completed'
      and completed_at is not null
      and completed_at <= now() - interval '72 hours';
  $job$
);

commit;
