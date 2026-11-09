import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import handler from '../api/orders.js'
import tracking from '../api/tracking.js'

test('orders are validated and priced on the server', async (t) => {
  const oldFetch = globalThis.fetch
  const oldUrl = process.env.SUPABASE_URL
  const oldKey = process.env.SUPABASE_SECRET_KEY
  process.env.SUPABASE_URL = 'https://example.test'
  process.env.SUPABASE_SECRET_KEY = 'test-secret'
  let saved
  globalThis.fetch = async (_url, options) => {
    saved = JSON.parse(options.body)
    return { ok: true, json: async () => [{ order_number: 12, total_cents: saved.total_cents }] }
  }
  t.after(() => {
    globalThis.fetch = oldFetch
    if (oldUrl === undefined) delete process.env.SUPABASE_URL
    else process.env.SUPABASE_URL = oldUrl
    if (oldKey === undefined) delete process.env.SUPABASE_SECRET_KEY
    else process.env.SUPABASE_SECRET_KEY = oldKey
  })
  const request = async (body) => {
    let status, result
    const response = { status(value) { status = value; return this }, json(value) { result = value; return this } }
    await handler({ method: 'POST', body }, response)
    return { status, result }
  }
  const pickup = { customerName: 'Pessoa Teste', phone: '(13) 99999-9999', fulfillment: 'pickup', address: null, paymentMethod: 'pay_at_counter', items: [{ name: 'Fritas', price: 'R$ 0,01', quantity: 2 }] }
  const created = await request(pickup)
  assert.equal(created.status, 201)
  assert.match(created.result.trackingToken, /^[A-Za-z0-9_-]{43}$/)
  assert.equal(saved.tracking_token_hash, createHash('sha256').update(created.result.trackingToken).digest('hex'))
  assert.equal(saved.total_cents, 8000)
  assert.equal(JSON.parse(saved.address).phone, '13999999999')
  assert.equal((await request({ ...pickup, phone: '123' })).status, 400)
  assert.equal((await request({ ...pickup, items: [{ name: 'Produto inexistente', price: 'R$ 1,00', quantity: 1 }] })).status, 400)
  assert.equal((await request({ ...pickup, items: [{ name: 'Fritas', price: 'R$ 40,00', quantity: 1.5 }] })).status, 400)
  const address = { cep: '11000-000', street: 'Rua Teste', number: '12', neighborhood: 'Centro', city: 'Santos', state: 'SP' }
  assert.equal((await request({ ...pickup, fulfillment: 'delivery', address, paymentMethod: 'online_pix' })).status, 201)
  assert.equal(saved.total_cents, 9000)
  assert.equal(JSON.parse(saved.address).location.street, 'Rua Teste')
  assert.equal((await request({ ...pickup, fulfillment: 'delivery', address: { ...address, cep: '123' }, paymentMethod: 'online_pix' })).status, 400)
})

test('tracking requires a personal token and returns no customer details', async (t) => {
  const oldFetch = globalThis.fetch, oldUrl = process.env.SUPABASE_URL, oldKey = process.env.SUPABASE_SECRET_KEY
  process.env.SUPABASE_URL = 'https://example.test'; process.env.SUPABASE_SECRET_KEY = 'test-secret'
  let calledUrl = ''
  globalThis.fetch = async (url) => { calledUrl = url; return { ok: true, json: async () => [{ order_number: 12, fulfillment: 'delivery', order_status: 'ready', dispatched_at: '2026-01-01', customer_name: 'private' }] } }
  t.after(() => { globalThis.fetch = oldFetch; if (oldUrl === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = oldUrl; if (oldKey === undefined) delete process.env.SUPABASE_SECRET_KEY; else process.env.SUPABASE_SECRET_KEY = oldKey })
  const query = async (token) => { let status, result; const response = { setHeader() {}, status(value) { status = value; return this }, json(value) { result = value; return this } }; await tracking({ method: 'POST', body: { token } }, response); return { status, result } }
  assert.equal((await query('12')).status, 400)
  const token = 'a'.repeat(43), result = await query(token)
  assert.equal(result.status, 200)
  assert.deepEqual(result.result, { number: 12, fulfillment: 'delivery', status: 'ready', dispatched: true })
  assert.ok(calledUrl.includes(createHash('sha256').update(token).digest('hex')))
  assert.ok(!calledUrl.includes(token))
  globalThis.fetch = async () => ({ ok: true, json: async () => [] })
  assert.equal((await query(token)).status, 404)
})
