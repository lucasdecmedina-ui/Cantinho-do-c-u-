import { createHash } from 'node:crypto'

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  if (request.method !== 'POST') return response.status(405).json({ error: 'Método não permitido.' })
  const token = request.body?.token
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) return response.status(400).json({ error: 'Link inválido.' })
  const { SUPABASE_URL: url, SUPABASE_SECRET_KEY: secret } = process.env
  if (!url || !secret) return response.status(503).json({ error: 'Acompanhamento indisponível.' })
  const hash = createHash('sha256').update(token).digest('hex')
  try {
    const result = await fetch(`${url}/rest/v1/orders?tracking_token_hash=eq.${hash}&select=order_number,fulfillment,order_status,dispatched_at&limit=1`, {
      headers: { apikey: secret, Authorization: `Bearer ${secret}` },
    })
    if (!result.ok) throw new Error('Database unavailable')
    const [order] = await result.json()
    if (!order) return response.status(404).json({ error: 'Pedido não encontrado ou link expirado.' })
    return response.status(200).json({ number: order.order_number, fulfillment: order.fulfillment, status: order.order_status, dispatched: Boolean(order.dispatched_at) })
  } catch {
    return response.status(503).json({ error: 'Não foi possível consultar o pedido agora.' })
  }
}
