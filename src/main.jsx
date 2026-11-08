import { useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import Checkout from './Checkout'
import Panel from './Panel'
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

function Icon({ children }) { return <span aria-hidden="true">{children}</span> }

function App() {
  const [active, setActive] = useState('destaques')
  const [selected, setSelected] = useState(null)
  const [cart, setCart] = useState([])
  const [flow, setFlow] = useState(null)
  const [order, setOrder] = useState(null)
  const chipsRef = useRef(null)
  const items = useMemo(() => menu.filter((item) => item.category === active), [active])
  const category = categories.find((item) => item.id === active)
  const go = (id) => { setActive(id); document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const scrollChips = (direction) => chipsRef.current?.scrollBy({ left: direction * 230, behavior: 'smooth' })
  const addToCart = (item) => { setCart((current) => { const found = current.find((entry) => entry.name === item.name && entry.price === item.price); return found ? current.map((entry) => entry === found ? { ...entry, quantity: entry.quantity + 1 } : entry) : [...current, { ...item, quantity: 1 }] }); setSelected(null) }
  const total = cart.reduce((sum, item) => sum + Number(item.price.replace(/[^0-9,]/g, '').replace(',', '.')) * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const money = (value) => `R$ ${value.toFixed(2).replace('.', ',')}`
  const changeQuantity = (item, delta) => setCart((current) => current.map((entry) => entry.name === item.name && entry.price === item.price ? { ...entry, quantity: entry.quantity + delta } : entry).filter((entry) => entry.quantity > 0))

  return <main className={cartCount && !flow && !selected ? 'has-cart-bar' : undefined}>
    <header className="topbar">
      <img className="logo" src="/images/logo-cantinho.png" alt="Bar Cantinho do Céu" />
      <div className="brand"><strong>Cantinho do Céu</strong><span>Cardápio delivery</span></div>
      <div className="header-links">
        <button className="cart-button" onClick={() => setFlow('cart')} aria-label="Ver carrinho">🛒<b>{cartCount}</b></button>
        <a href={contact.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Icon>◎</Icon></a>
        <a href={contact.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp"><Icon>◔</Icon></a>
      </div>
    </header>

    <section id="menu" className="menu-section">
      <div className="section-heading"><div><p>CARDÁPIO DELIVERY</p><h1>Qual vai ser?</h1></div><span className="mobile-hint">Arraste <Icon>→</Icon></span></div>
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

    <footer><img src="/images/logo-cantinho.png" alt="" /><p>R. Alfredo Albertini, 99<br />Marapé · Santos/SP</p><a href={contact.whatsapp} target="_blank" rel="noreferrer">Falar no WhatsApp</a></footer>

    <nav className="bottom-nav" aria-label="Navegação rápida">
      <button onClick={() => go('destaques')}><Icon>▤</Icon><span>Cardápio</span></button>
      <a href={contact.maps} target="_blank" rel="noreferrer"><Icon>★</Icon><span>Avaliar</span></a>
    </nav>

    {cartCount > 0 && !flow && !selected && <div className="cart-bar-wrap"><button className="cart-bar" onClick={() => setFlow('cart')} aria-label={`Ver carrinho, ${cartCount} ${cartCount === 1 ? 'item' : 'itens'}, subtotal ${money(total)}`}><span className="cart-bar-count" aria-hidden="true">{cartCount}</span><span className="cart-bar-label">Ver carrinho <span aria-hidden="true">→</span></span><span className="cart-bar-total"><small>Subtotal</small><strong>{money(total)}</strong></span></button></div>}

    {selected && <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}><article className="modal" role="dialog" aria-modal="true" aria-label={selected.name} onClick={(event) => event.stopPropagation()}>{selected.image && <img src={selected.image} alt="" />}<button className="close" onClick={() => setSelected(null)} aria-label="Fechar">×</button><p>NO CANTINHO</p><h2>{selected.name}</h2><strong>{selected.price}</strong><span className="divider" /><div>{selected.detail}</div><button className="add-button" onClick={() => addToCart(selected)}>Adicionar ao pedido <Icon>+</Icon></button></article></div>}
    {flow === 'cart' && <section className="order-page"><article className="order-screen"><button className="back" onClick={() => setFlow(null)}>← Voltar ao cardápio</button><p>SEU PEDIDO</p><h2>Carrinho</h2>{cart.length ? <><div className="cart-list cart-edit">{cart.map((item) => <div key={`${item.name}-${item.price}`}><div><b>{item.name}</b><small>{item.price} cada</small></div><div className="quantity-control"><button onClick={() => changeQuantity(item, -1)} aria-label={`Remover uma unidade de ${item.name}`}>−</button><span>{item.quantity}</span><button onClick={() => changeQuantity(item, 1)} disabled={item.quantity >= 20} aria-label={`Adicionar uma unidade de ${item.name}`}>+</button></div><strong>{money(Number(item.price.replace(/[^0-9,]/g, '').replace(',', '.')) * item.quantity)}</strong></div>)}</div><div className="order-total"><span>Subtotal</span><strong>{money(total)}</strong></div><p className="cart-fee-note">A taxa de entrega será mostrada no próximo passo.</p><button className="add-button" onClick={() => setFlow('checkout')}>Continuar <Icon>→</Icon></button></> : <p className="empty">Seu carrinho ainda está vazio. Escolha algo gostoso no cardápio!</p>}</article></section>}
    {flow === 'checkout' && <Checkout cart={cart} total={total} onBack={() => setFlow('cart')} onSuccess={(result) => { setOrder(result); setCart([]); setFlow('success') }} />}
    {flow === 'success' && <div className="modal-backdrop"><article className="modal order-modal success"><span className="success-icon">✓</span><p>PEDIDO DE DEMONSTRAÇÃO ENVIADO</p><h2>Tá na mão!</h2><strong>Pedido #{order.id}</strong><div>Seu pedido de teste foi registrado, {order.name}. {order.mode === 'delivery' ? 'Nenhum pagamento Pix foi realizado.' : 'Pagamento no balcão é apenas demonstrativo.'}</div><button className="add-button" onClick={() => setFlow(null)}>Voltar ao cardápio <Icon>→</Icon></button></article></div>}
  </main>
}

createRoot(document.getElementById('root')).render(window.location.pathname.replace(/\/$/, '') === '/painel' ? <Panel /> : <App />)
