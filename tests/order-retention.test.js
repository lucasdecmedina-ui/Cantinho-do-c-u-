import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

test('retention preserves active orders and deletes only orders completed at least 72 hours ago', async (t) => {
  const db = new PGlite()
  t.after(() => db.close())
  await db.exec(`
    create table public.orders (
      id integer primary key,
      order_status text not null,
      note text
    );
    insert into public.orders (id, order_status) values
      (1, 'completed'), (2, 'new'), (3, 'cancelled'), (4, 'new');

    -- O agendador é simulado; o código de limpeza capturado será executado
    -- pelo PostgreSQL real em memória, sem tocar no banco do restaurante.
    create schema cron;
    create table cron.jobs (name text primary key, schedule text, command text);
    create function cron.schedule(_name text, _schedule text, _command text)
    returns bigint language plpgsql as $fn$
    begin
      insert into cron.jobs values (_name, _schedule, _command)
      on conflict (name) do update set schedule = excluded.schedule, command = excluded.command;
      return 1;
    end;
    $fn$;
  `)

  const source = await readFile(new URL('../supabase/migrations/202611080001_retencao_pedidos.sql', import.meta.url), 'utf8')
  const migration = source.replace('create extension if not exists pg_cron;', '-- agendador simulado para teste')
  assert.notEqual(source, migration)
  await db.exec(migration)
  let rows = (await db.query('select id, order_status, completed_at from public.orders order by id')).rows
  assert.ok(rows[0].completed_at, 'concluído anterior recebe prazo novo')
  assert.equal(rows[1].completed_at, null, 'novo não tem data de conclusão')
  assert.equal(rows[2].completed_at, null, 'cancelado não tem data de conclusão')

  await db.exec("update public.orders set order_status = 'completed' where id = 2")
  const firstCompletion = (await db.query('select completed_at from public.orders where id = 2')).rows[0].completed_at.toISOString()
  await db.exec("update public.orders set note = 'atualizado', completed_at = now() - interval '1 year' where id = 2")
  assert.equal((await db.query('select completed_at from public.orders where id = 2')).rows[0].completed_at.toISOString(), firstCompletion, 'edição não altera data de conclusão')
  await db.exec("update public.orders set order_status = 'preparing' where id = 2")
  assert.equal((await db.query('select completed_at from public.orders where id = 2')).rows[0].completed_at, null, 'pedido reaberto não tem data de conclusão')
  await db.exec("update public.orders set order_status = 'completed' where id = 2")
  assert.ok((await db.query('select completed_at from public.orders where id = 2')).rows[0].completed_at, 'reconclusão começa nova contagem')

  // Fixamos datas de teste sem expor uma forma de alterá-las pela aplicação.
  await db.exec(`
    alter table public.orders disable trigger cantinho_track_order_completion;
    update public.orders set completed_at = now() - interval '73 hours' where id in (1, 3, 4);
    update public.orders set completed_at = now() - interval '71 hours' where id = 2;
    alter table public.orders enable trigger cantinho_track_order_completion;
  `)
  const jobs = (await db.query('select * from cron.jobs')).rows
  assert.equal(jobs.length, 1)
  assert.equal(jobs[0].schedule, '0 * * * *')
  await db.exec(jobs[0].command)
  rows = (await db.query('select id from public.orders order by id')).rows
  assert.deepEqual(rows.map((row) => row.id), [2, 3, 4], 'somente o concluído antigo é removido')

  await db.exec(migration)
  assert.equal((await db.query('select count(*)::int as count from cron.jobs')).rows[0].count, 1, 'reaplicar não duplica tarefas')
  assert.deepEqual((await db.query('select id from public.orders order by id')).rows.map((row) => row.id), [2, 3, 4], 'reaplicar não apaga pedidos')
})
