import test from 'node:test'
import assert from 'node:assert/strict'
import handler from '../api/orders.js'

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
  assert.equal((await request(pickup)).status, 201)
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
