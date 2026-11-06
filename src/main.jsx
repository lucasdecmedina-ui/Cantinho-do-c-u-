import { useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const contact = {
  whatsapp: 'https://wa.me/5513997858098',
  instagram: 'https://www.instagram.com/barcantinhodoceu/',
  maps: 'https://maps.app.goo.gl/puprWokzCHBH4FNU7',
}

const categories = [
  { id: 'destaques', label: 'Destaques', icon: '✦' },
  { id: 'porcoes', label: 'Porções', icon: '🍤' },
  { id: 'churrasco', label: 'Churrasco', icon: '🔥' },
  { id: 'espetos', label: 'Espetos', icon: '🍢' },
  { id: 'drinks', label: 'Drinks', icon: '🍹' },
  { id: 'cervejas', label: 'Cervejas', icon: '🍺' },
  { id: 'fit', label: 'Fit', icon: '🥗' },
  { id: 'sem-alcool', label: 'Sem álcool', icon: '🧃' },
]

const menu = [
  { category: 'destaques', name: 'Cupim da Ju', price: 'R$ 95,00', detail: '500g · Cupim assado, molho de tomate da casa e mussarela derretida. Acompanha cesto de pães.', image: '/images/churrasco-domingo.png' },
  { category: 'destaques', name: 'Trio do mar', price: 'R$ 130,00', detail: '1,2kg · Camarão, manjuba e isca de peixe fritos, com molho tártaro.', image: '/images/churrasco-domingo.png' },
  { category: 'destaques', name: 'Aperol Spritz', price: 'R$ 25,00', detail: 'Aperol, água com gás e rodela de laranja.', image: '/images/drinks-cantinho.png' },
  { category: 'destaques', name: 'Churrasco Mista', price: 'R$ 130,00', detail: 'Inteira · Carne, linguiça, farofa, pão fatiado, cebolete e molho barbecue.', image: '/images/churrasco-domingo.png' },
  { category: 'porcoes', name: 'Dadinho de Tapioca', price: 'R$ 50,00', detail: '400g · Cubos crocantes de tapioca com queijo coalho e geleia de pimenta.' },
  { category: 'porcoes', name: 'Bolinho de Provolone', price: 'R$ 50,00', detail: '400g · Empanado e frito, servido com molho da casa.' },
  { category: 'porcoes', name: 'Camarão com Catupiry', price: 'R$ 80,00', detail: '400g · Camarões empanados crocantes recheados com catupiry e molho rosê.' },
  { category: 'porcoes', name: 'Bolinho de Aipim com Carne Seca', price: 'R$ 50,00', detail: '400g · Servido com molho da casa.' },
  { category: 'porcoes', name: 'Anéis de Cebola', price: 'R$ 50,00', detail: '400g · Cebolas empanadas, douradas e crocantes.' },
  { category: 'porcoes', name: 'Calabresa Acebolada', price: 'R$ 50,00', detail: '400g · Com pão fatiado.' },
  { category: 'porcoes', name: 'Fritas', price: 'R$ 40,00', detail: '400g · Batata frita crocante.' },
  { category: 'porcoes', name: 'Torresmo de Rolo', price: 'R$ 45,00', detail: 'Com limão e ketchup caseiro de goiaba.' },
  { category: 'porcoes', name: 'Tulipinha com Fritas', price: 'R$ 115,00', detail: '1,5kg · Tulipa de frango crocante, fritas e molho da casa.' },
  { category: 'porcoes', name: 'Camarão Frito', price: 'R$ 65,00', detail: '500g · Com limão e molho rosê.' },
  { category: 'porcoes', name: 'Manjuba Empanada Frita', price: 'R$ 45,00', detail: '500g · Com limão e molho tártaro.' },
  { category: 'churrasco', name: 'Churrasco Mista', price: 'R$ 130,00', detail: 'Inteira · Carne, linguiça, farofa, pão, cebolete e barbecue.' },
  { category: 'churrasco', name: 'Churrasco Mista', price: 'R$ 100,00', detail: 'Meia · Carne, linguiça, farofa, pão, cebolete e barbecue.' },
  { category: 'churrasco', name: 'Costela Suína / Copa', price: 'R$ 80,00', detail: 'Por kg · Porção de carnes no bafo, aos domingos.' },
  { category: 'churrasco', name: 'Costela Bovina', price: 'R$ 90,00', detail: 'Por kg · Porção de carnes no bafo, aos domingos.' },
  { category: 'churrasco', name: 'Cupim / Lagarto', price: 'R$ 110,00', detail: 'Por kg · Porção de carnes no bafo, aos domingos.' },
  { category: 'churrasco', name: 'Frango na Brasa', price: 'R$ 55,00', detail: 'Com farofa, cebolete e batatinha.' },
  { category: 'espetos', name: 'Espeto de Carne', price: 'R$ 13,00', detail: 'Unidade.' },
  { category: 'espetos', name: 'Espeto de Linguiça Apimentada', price: 'R$ 13,00', detail: 'Unidade.' },
  { category: 'espetos', name: 'Espeto de Coração', price: 'R$ 13,00', detail: 'Unidade.' },
  { category: 'espetos', name: 'Espeto de Queijo Coalho', price: 'R$ 13,00', detail: 'Unidade.' },
  { category: 'espetos', name: 'Pão de Alho', price: 'R$ 13,00', detail: 'Unidade.' },
  { category: 'espetos', name: 'Espeto Misto', price: 'R$ 13,00', detail: 'Unidade.' },
  { category: 'drinks', name: 'Gin Tônica', price: 'R$ 20,00', detail: 'Limão, maracujá, melancia, abacaxi, morango, uva ou kiwi.', image: '/images/drinks-cantinho.png' },
  { category: 'drinks', name: 'Negroni', price: 'R$ 30,00', detail: 'Gin, vermouth e Campari.', image: '/images/drinks-cantinho.png' },
  { category: 'drinks', name: 'Aperol Spritz', price: 'R$ 25,00', detail: 'Aperol, água com gás e rodela de laranja.', image: '/images/drinks-cantinho.png' },
  { category: 'drinks', name: 'Moscow Mule', price: 'R$ 32,00', detail: 'Vodka, maracujá, limão, açúcar, espuma de maracujá e gelo.' },
  { category: 'drinks', name: 'Cooler de Melancia', price: 'R$ 15,00', detail: 'Vodka, melancia, limão, gelo e hortelã.' },
  { category: 'drinks', name: 'Lagoa Azul', price: 'R$ 22,00', detail: 'Vodka, Curaçau Blue, suco de limão e gelo.' },
  { category: 'drinks', name: 'Maracujack', price: 'R$ 37,00', detail: 'Jack Daniels, maracujá, soda e gelo.' },
  { category: 'cervejas', name: 'Chopp 300ml', price: 'R$ 8,00', detail: 'Cerveja gelada no ponto.' },
  { category: 'cervejas', name: 'Chopp 750ml', price: 'R$ 15,00', detail: 'Para dividir a roda.' },
  { category: 'cervejas', name: 'Torre de Chopp', price: 'R$ 49,00', detail: 'Cerveja gelada para a mesa.' },
  { category: 'cervejas', name: 'Heineken', price: 'R$ 19,00', detail: 'Garrafa 600ml.' },
  { category: 'cervejas', name: 'Original', price: 'R$ 16,00', detail: 'Garrafa 600ml.' },
  { category: 'cervejas', name: 'Spaten', price: 'R$ 16,00', detail: 'Garrafa 600ml.' },
  { category: 'cervejas', name: 'Stella Artois Pure Gold', price: 'R$ 18,00', detail: 'Garrafa 600ml.' },
  { category: 'cervejas', name: 'Heineken Long Neck', price: 'R$ 12,00', detail: 'Verificar disponibilidade.' },
  { category: 'fit', name: 'Espeto de Legumes', price: 'R$ 18,00', detail: 'Acompanha feijão fradinho ou tabule, cebolete e barbecue.' },
  { category: 'fit', name: 'Espeto Kafta de Mandioca', price: 'R$ 18,00', detail: 'Acompanha feijão fradinho ou tabule, cebolete e barbecue.' },
  { category: 'fit', name: 'Espeto Abobrinha com Coalho', price: 'R$ 18,00', detail: 'Acompanha feijão fradinho ou tabule, cebolete e barbecue.' },
  { category: 'fit', name: 'Salada no Pote', price: 'R$ 20,00', detail: 'Três opções. Ver detalhes no balcão e disponibilidade do dia.' },
  { category: 'fit', name: 'Frango Grelhado com Salada', price: 'R$ 30,00', detail: 'Filé na brasa, feijão fradinho ou tabule e mix de folhas.' },
  { category: 'fit', name: 'Contra Grelhado com Salada', price: 'R$ 35,00', detail: 'Contra-filé na brasa, feijão fradinho ou tabule e mix de folhas.' },
  { category: 'sem-alcool', name: 'Refrigerante Lata', price: 'R$ 7,00', detail: 'Lata.' },
  { category: 'sem-alcool', name: 'Água 500ml', price: 'R$ 5,00', detail: 'Com ou sem gás.' },
  { category: 'sem-alcool', name: 'Suco Natural - Copo', price: 'R$ 15,00', detail: 'Copo.' },
  { category: 'sem-alcool', name: 'Suco Natural - Jarra', price: 'R$ 20,00', detail: 'Jarra.' },
  { category: 'sem-alcool', name: 'Suco Rosa', price: 'R$ 20,00', detail: '400ml · Melancia, morango e hortelã.' },
  { category: 'sem-alcool', name: 'Suco Verde', price: 'R$ 20,00', detail: '400ml · Couve, limão, hortelã e gengibre.' },
]

const festival = {
  kind: 'festival',
  name: 'Quinta do Festival',
  price: 'R$ 69,90 por pessoa',
  detail: 'Toda quinta, das 18h às 21h.',
  drinks: 'Chopp ou refrigerante de limão, laranja ou tubaína.',
  items: ['Batata frita', 'Cebola empanada', 'Polenta frita', 'Coxinha de frango', 'Bolinha de queijo', 'Maravilha', 'Mandioca frita', 'Calabresa acebolada', 'Ovo de codorna', 'Dadinho de batata com queijo', 'Bolinho de aipim com carne seca', 'Tulipinha de frango', 'Mini pão de queijo frito', 'Mini churros'],
}

function Icon({ children }) { return <span aria-hidden="true">{children}</span> }

function App() {
  const [active, setActive] = useState('destaques')
  const [selected, setSelected] = useState(null)
  const [cart, setCart] = useState([])
  const [flow, setFlow] = useState(null)
  const [order, setOrder] = useState(null)
  const [checkoutMode, setCheckoutMode] = useState('delivery')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderError, setOrderError] = useState('')
  const chipsRef = useRef(null)
  const items = useMemo(() => menu.filter((item) => item.category === active), [active])
  const category = categories.find((item) => item.id === active)
  const go = (id) => { setActive(id); document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const scrollChips = (direction) => chipsRef.current?.scrollBy({ left: direction * 230, behavior: 'smooth' })
  const addToCart = (item) => { setCart((current) => { const found = current.find((entry) => entry.name === item.name && entry.price === item.price); return found ? current.map((entry) => entry === found ? { ...entry, quantity: entry.quantity + 1 } : entry) : [...current, { ...item, quantity: 1 }] }); setSelected(null) }
  const total = cart.reduce((sum, item) => sum + Number(item.price.replace(/[^0-9,]/g, '').replace(',', '.')) * item.quantity, 0)
  const deliveryFee = checkoutMode === 'delivery' ? 10 : 0
  const finalTotal = total + deliveryFee
  const money = (value) => `R$ ${value.toFixed(2).replace('.', ',')}`
  const finalize = async (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setOrderError('')
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerName: data.get('name'), fulfillment: data.get('mode'), address: data.get('address'), paymentMethod: data.get('payment'), items: cart }) })
      const responseBody = await response.text()
      let result
      try { result = JSON.parse(responseBody) } catch { result = {} }
      if (!response.ok) throw new Error(result.error || 'Não foi possível enviar o pedido.')
      setOrder({ id: String(result.id), name: data.get('name'), mode: data.get('mode'), address: data.get('address'), payment: data.get('payment'), items: cart, total: result.totalCents / 100 })
      setCart([])
      setFlow('success')
    } catch (error) { setOrderError(error.message) } finally { setIsSubmitting(false) }
  }

  return <main>
    <header className="topbar">
      <img className="logo" src="/images/logo-cantinho.png" alt="Bar Cantinho do Céu" />
      <div className="brand"><strong>Cantinho do Céu</strong><span>Marapé · Santos</span></div>
      <div className="header-links">
        <button className="cart-button" onClick={() => setFlow('cart')} aria-label="Ver carrinho">🛒<b>{cart.reduce((sum, item) => sum + item.quantity, 0)}</b></button>
        <a href={contact.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Icon>◎</Icon></a>
        <a href={contact.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp"><Icon>◔</Icon></a>
      </div>
    </header>

    <section className="hero">
      <img src="/images/churrasco-domingo.png" alt="Churrasco, porções e cerveja gelada" />
      <div className="hero-shadow" />
      <div className="hero-copy"><p>DOMINGO É AQUI</p><h1>Churrasco, pagode<br />e cerveja gelada.</h1><button onClick={() => go('porcoes')}>Ver cardápio <span>↓</span></button></div>
    </section>

    <section className="offers" aria-label="Ofertas e eventos">
      <button className="festival-card" onClick={() => setSelected(festival)}>
        <span className="eyebrow">TODA QUINTA</span><strong>Quinta do<br />Festival</strong><em>Ver o que inclui <span>→</span></em>
      </button>
      <button className="drink-card" onClick={() => go('drinks')}>
        <img src="/images/drinks-cantinho.png" alt="Drinks do Cantinho" /><span>DRINKS DA CASA</span><strong>Um brinde<br />do seu jeito.</strong>
      </button>
    </section>

    <section id="menu" className="menu-section">
      <div className="section-heading"><div><p>CARDÁPIO</p><h2>Qual vai ser?</h2></div><span className="mobile-hint">Arraste <Icon>→</Icon></span></div>
      <div className="chips-shell"><button className="chip-arrow previous" onClick={() => scrollChips(-1)} aria-label="Ver categorias anteriores">←</button><nav ref={chipsRef} className="chips" aria-label="Categorias do cardápio">
        {categories.map((item) => <button key={item.id} className={active === item.id ? 'active' : ''} onClick={() => setActive(item.id)}><Icon>{item.icon}</Icon>{item.label}</button>)}
      </nav><button className="chip-arrow next" onClick={() => scrollChips(1)} aria-label="Ver próximas categorias">→</button></div>
      <div className="category-title"><span>{category.icon}</span><h2>{category.label}</h2><small>{items.length} opções</small></div>
      <div className="products">
        {items.map((item) => <button key={`${item.name}-${item.price}`} className={`product ${item.image ? 'with-image' : ''}`} onClick={() => setSelected(item)}>
          {item.image && <img src={item.image} alt="" />}
          <div className="product-body"><div><h3>{item.name}</h3><p>{item.detail}</p></div><strong>{item.price}</strong></div>
          <span className="more">+</span>
        </button>)}
      </div>
      <p className="availability">*Itens sujeitos à disponibilidade. Confirme com a equipe.</p>
    </section>

    <section className="review-section">
      <span>★ ★ ★ ★ ★</span><h2>Curtiu o Cantinho?</h2><p>Sua avaliação ajuda a nossa roda a crescer.</p>
      <a href={contact.maps} target="_blank" rel="noreferrer">Avaliar no Google <Icon>↗</Icon></a>
    </section>

    <footer><img src="/images/logo-cantinho.png" alt="" /><p>R. Alfredo Albertini, 99<br />Marapé · Santos/SP</p><a href={contact.whatsapp} target="_blank" rel="noreferrer">Falar no WhatsApp</a></footer>

    <nav className="bottom-nav" aria-label="Navegação rápida">
      <button onClick={() => go('destaques')}><Icon>⌂</Icon><span>Início</span></button>
      <button onClick={() => go('porcoes')}><Icon>▤</Icon><span>Cardápio</span></button>
      <button onClick={() => setSelected(festival)}><Icon>✦</Icon><span>Ofertas</span></button>
      <a href={contact.maps} target="_blank" rel="noreferrer"><Icon>★</Icon><span>Avaliar</span></a>
    </nav>

    {selected && <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}><article className={`modal ${selected.kind === 'festival' ? 'festival-modal' : ''}`} role="dialog" aria-modal="true" aria-label={selected.name} onClick={(event) => event.stopPropagation()}>{selected.image && <img src={selected.image} alt="" />}<button className="close" onClick={() => setSelected(null)} aria-label="Fechar">×</button><p>{selected.kind === 'festival' ? 'TODA QUINTA' : 'NO CANTINHO'}</p><h2>{selected.name}</h2><strong>{selected.price}</strong><span className="divider" /><div>{selected.detail}</div>{selected.kind === 'festival' && <><section className="festival-includes"><h3>O que está incluso</h3><p><b>Bebidas:</b> {selected.drinks}</p><div className="festival-items">{selected.items.map((item) => <span key={item}>✓ {item}</span>)}</div></section></>} {!selected.kind && <button className="add-button" onClick={() => addToCart(selected)}>Adicionar ao pedido <Icon>+</Icon></button>}</article></div>}
    {flow === 'cart' && <section className="order-page"><article className="order-screen"><button className="back" onClick={() => setFlow(null)}>← Voltar ao cardápio</button><p>SEU PEDIDO</p><h2>Carrinho</h2>{cart.length ? <><div className="cart-list">{cart.map((item) => <div key={`${item.name}-${item.price}`}><span>{item.quantity}x</span><b>{item.name}</b><strong>{item.price}</strong></div>)}</div><div className="order-total"><span>Total</span><strong>R$ {total.toFixed(2).replace('.', ',')}</strong></div><button className="add-button" onClick={() => setFlow('checkout')}>Finalizar pedido <Icon>→</Icon></button></> : <p className="empty">Seu carrinho está esperando uma porção gelada e uma cerveja.</p>}</article></section>}
    {flow === 'checkout' && <section className="order-page"><form className="order-screen checkout" onSubmit={finalize}><button type="button" className="back" onClick={() => setFlow('cart')}>← Voltar ao carrinho</button><p>QUASE LÁ</p><h2>Finalizar pedido</h2><input required name="name" placeholder="Seu nome" /><select name="mode" value={checkoutMode} onChange={(event) => setCheckoutMode(event.target.value)}><option value="delivery">Entrega · taxa fixa R$ 10,00</option><option value="pickup">Retirada no local</option></select>{checkoutMode === 'delivery' && <input required name="address" placeholder="Endereço completo" />}{checkoutMode === 'pickup' && <input type="hidden" name="address" value="" />}<select name="payment" value={checkoutMode === 'delivery' ? 'online_pix' : 'pay_at_counter'} readOnly><option value={checkoutMode === 'delivery' ? 'online_pix' : 'pay_at_counter'}>{checkoutMode === 'delivery' ? 'Pix online — em breve' : 'Pagamento no balcão'}</option></select><div className="checkout-total"><span>Itens</span><b>{money(total)}</b>{checkoutMode === 'delivery' && <><span>Entrega</span><b>R$ 10,00</b></>}<strong>Total final</strong><strong>{money(finalTotal)}</strong></div><small>{checkoutMode === 'delivery' ? 'O Pix online será ativado quando a conta de pagamento do bar estiver conectada.' : 'Retire no Cantinho e pague no balcão.'}</small>{orderError && <p className="form-error" role="alert">{orderError}</p>}<button className="add-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Enviando pedido...' : 'Confirmar pedido'} <Icon>✓</Icon></button></form></section>}
    {flow === 'success' && <div className="modal-backdrop"><article className="modal order-modal success"><span className="success-icon">✓</span><p>PEDIDO RECEBIDO</p><h2>Tá na mão!</h2><strong>Pedido #{order.id}</strong><div>Recebemos seu pedido, {order.name}. A equipe já consegue ver os detalhes no painel.</div><button className="add-button" onClick={() => setFlow('panel')}>Ver demonstração do painel <Icon>→</Icon></button></article></div>}
    {flow === 'panel' && <div className="modal-backdrop"><article className="modal order-modal panel"><button className="close" onClick={() => setFlow(null)}>×</button><p>DEMONSTRAÇÃO</p><h2>Painel de pedidos</h2><div className="order-card"><span>NOVO PEDIDO #{order.id}</span><h3>{order.name} · {order.mode}</h3><p>{order.address}</p>{order.items.map((item) => <div key={item.name}>{item.quantity}x {item.name} <b>{item.price}</b></div>)}<strong>R$ {order.total.toFixed(2).replace('.', ',')}</strong><button>Aceitar pedido</button></div></article></div>}
  </main>
}

createRoot(document.getElementById('root')).render(<App />)
