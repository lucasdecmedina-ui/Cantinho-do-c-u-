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
  const chipsRef = useRef(null)
  const items = useMemo(() => menu.filter((item) => item.category === active), [active])
  const category = categories.find((item) => item.id === active)
  const go = (id) => { setActive(id); document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const scrollChips = (direction) => chipsRef.current?.scrollBy({ left: direction * 230, behavior: 'smooth' })

  return <main>
    <header className="topbar">
      <img className="logo" src="/images/logo-cantinho.png" alt="Bar Cantinho do Céu" />
      <div className="brand"><strong>Cantinho do Céu</strong><span>Marapé · Santos</span></div>
      <div className="header-links">
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

    {selected && <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}><article className={`modal ${selected.kind === 'festival' ? 'festival-modal' : ''}`} role="dialog" aria-modal="true" aria-label={selected.name} onClick={(event) => event.stopPropagation()}>{selected.image && <img src={selected.image} alt="" />}<button className="close" onClick={() => setSelected(null)} aria-label="Fechar">×</button><p>{selected.kind === 'festival' ? 'TODA QUINTA' : 'NO CANTINHO'}</p><h2>{selected.name}</h2><strong>{selected.price}</strong><span className="divider" /><div>{selected.detail}</div>{selected.kind === 'festival' && <><section className="festival-includes"><h3>O que está incluso</h3><p><b>Bebidas:</b> {selected.drinks}</p><div className="festival-items">{selected.items.map((item) => <span key={item}>✓ {item}</span>)}</div></section></>}<a href={contact.whatsapp} target="_blank" rel="noreferrer">Tirar dúvida no WhatsApp <Icon>↗</Icon></a></article></div>}
  </main>
}

createRoot(document.getElementById('root')).render(<App />)
