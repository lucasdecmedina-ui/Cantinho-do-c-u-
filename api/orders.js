const DELIVERY_FEE_CENTS = 1000

const priceToCents = (value) => Math.round(Number(String(value).replace(/[^0-9,]/g, '').replace(',', '.')) * 100)
const approvedProducts = new Map([
  ['Cupim da Ju', 9500], ['Trio do mar', 13000], ['Aperol Spritz', 2500], ['Churrasco Mista', 13000], ['Churrasco Mista|R$ 100,00', 10000],
  ['Dadinho de Tapioca', 5000], ['Bolinho de Provolone', 5000], ['Camarão com Catupiry', 8000], ['Bolinho de Aipim com Carne Seca', 5000], ['Anéis de Cebola', 5000], ['Calabresa Acebolada', 5000], ['Fritas', 4000], ['Torresmo de Rolo', 4500], ['Tulipinha com Fritas', 11500], ['Camarão Frito', 6500], ['Manjuba Empanada Frita', 4500],
  ['Costela Suína / Copa', 8000], ['Costela Bovina', 9000], ['Cupim / Lagarto', 11000], ['Frango na Brasa', 5500],
  ['Espeto de Carne', 1300], ['Espeto de Linguiça Apimentada', 1300], ['Espeto de Coração', 1300], ['Espeto de Queijo Coalho', 1300], ['Pão de Alho', 1300], ['Espeto Misto', 1300],
  ['Gin Tônica', 2000], ['Negroni', 3000], ['Moscow Mule', 3200], ['Cooler de Melancia', 1500], ['Lagoa Azul', 2200], ['Maracujack', 3700],
  ['Chopp 300ml', 800], ['Chopp 750ml', 1500], ['Torre de Chopp', 4900], ['Heineken', 1900], ['Original', 1600], ['Spaten', 1600], ['Stella Artois Pure Gold', 1800], ['Heineken Long Neck', 1200],
  ['Espeto de Legumes', 1800], ['Espeto Kafta de Mandioca', 1800], ['Espeto Abobrinha com Coalho', 1800], ['Salada no Pote', 2000], ['Frango Grelhado com Salada', 3000], ['Contra Grelhado com Salada', 3500],
  ['Refrigerante Lata', 700], ['Água 500ml', 500], ['Suco Natural - Copo', 1500], ['Suco Natural - Jarra', 2000], ['Suco Rosa', 2000], ['Suco Verde', 2000],
])

function send(response, status, body) {
  response.status(status).json(body)
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return send(response, 405, { error: 'Método não permitido.' })
  try {

  const { customerName, phone, fulfillment, address, paymentMethod, items } = request.body || {}
  if (typeof customerName !== 'string' || customerName.trim().length < 2 || customerName.trim().length > 100 || typeof phone !== 'string' || !/^\d{10,11}$/.test(phone.replace(/\D/g, '')) || !['delivery', 'pickup'].includes(fulfillment) || !Array.isArray(items) || !items.length || items.length > 50) {
    return send(response, 400, { error: 'Confira os dados do pedido.' })
  }
  if (fulfillment === 'delivery' && (!address || typeof address !== 'object' || ['cep', 'street', 'number', 'neighborhood', 'city', 'state'].some((field) => typeof address[field] !== 'string' || !address[field].trim()) || !/^\d{8}$/.test(address.cep.replace(/\D/g, '')) || !/^[a-zA-Z]{2}$/.test(address.state.trim()))) return send(response, 400, { error: 'Confira o endereço completo e o CEP.' })
  if (fulfillment === 'delivery' && paymentMethod !== 'online_pix') return send(response, 400, { error: 'Para entrega, o pagamento é Pix online.' })
  if (fulfillment === 'pickup' && paymentMethod !== 'pay_at_counter') return send(response, 400, { error: 'Para retirada, o pagamento é feito no local.' })

  const normalizedItems = items.map((item) => ({
    name: String(item.name || '').slice(0, 140),
    quantity: Number(item.quantity),
    unit_price_cents: approvedProducts.get(`${item.name}|${item.price}`) || approvedProducts.get(item.name),
  }))
  if (normalizedItems.some((item) => !item.name || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20 || !Number.isInteger(item.unit_price_cents) || item.unit_price_cents <= 0)) return send(response, 400, { error: 'Há um item inválido no pedido.' })

  const subtotalCents = normalizedItems.reduce((total, item) => total + item.unit_price_cents * item.quantity, 0)
  const deliveryCents = fulfillment === 'delivery' ? DELIVERY_FEE_CENTS : 0
  const secret = process.env.SUPABASE_SECRET_KEY
  const url = process.env.SUPABASE_URL
  if (!secret || !url) return send(response, 503, { error: 'Pedidos ainda não foram ativados.' })

  const saved = await fetch(`${url}/rest/v1/orders`, {
    method: 'POST',
    headers: { apikey: secret, Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({
      customer_name: customerName.trim(), fulfillment,
      // Preserva compatibilidade com o banco existente, sem migração destrutiva.
      address: JSON.stringify({ phone: phone.replace(/\D/g, ''), location: fulfillment === 'delivery' ? Object.fromEntries(['cep', 'street', 'number', 'complement', 'neighborhood', 'city', 'state'].map((field) => [field, String(address[field] || '').trim().slice(0, 120)])) : null }),
      payment_method: paymentMethod, items: normalizedItems,
      subtotal_cents: subtotalCents, delivery_cents: deliveryCents, total_cents: subtotalCents + deliveryCents,
    }),
  })
  if (!saved.ok) return send(response, 500, { error: 'Não conseguimos registrar o pedido. Tente novamente.' })
  const [order] = await saved.json()
  return send(response, 201, { id: order.order_number, totalCents: order.total_cents })
  } catch (error) {
    console.error('Order creation failed:', error)
    return send(response, 500, { error: 'O pedido não pôde ser registrado agora. Tente novamente em instantes.' })
  }
}
