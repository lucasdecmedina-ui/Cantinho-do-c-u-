import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'
import './panel.css'

const labels = { new: 'Novo', accepted: 'Aceito', preparing: 'Em preparo', ready: 'Pronto', completed: 'Concluído', cancelled: 'Cancelado' }
const nextStatus = { new: 'accepted', accepted: 'preparing', preparing: 'ready', ready: 'completed' }
const nextLabel = { new: 'Aceitar pedido', accepted: 'Iniciar preparo', preparing: 'Marcar como pronto', ready: 'Concluir pedido' }
const money = (cents) => (Number(cents || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const date = (value) => new Date(value).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

function orderDetails(address) {
  if (!address) return { address: '', phone: '' }
  try {
    const data = JSON.parse(address)
    if (!data || typeof data !== 'object') return { address, phone: '' }
    const location = data.location || {}
    return { phone: data.phone || '', address: [location.street, location.number && `nº ${location.number}`, location.complement, location.neighborhood, [location.city, location.state].filter(Boolean).join(' / '), location.cep && `CEP ${location.cep}`].filter(Boolean).join(', ') }
  } catch { return { address, phone: '' } }
}

export default function Panel() {
  const [session, setSession] = useState(null)
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [busy, setBusy] = useState(false)
  const [orders, setOrders] = useState([])
  const [loadError, setLoadError] = useState('')
  const [filter, setFilter] = useState('active')
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [updating, setUpdating] = useState(null)
  const audioRef = useRef(null)
  const knownIds = useRef(null)
  const pollId = useRef(0)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => { if (active) { setSession(data.session); setChecking(false) } })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => { if (active) setSession(next) })
    return () => { active = false; subscription.unsubscribe(); audioRef.current?.close() }
  }, [])
  const playBell = useCallback(() => {
    const context = audioRef.current
    if (!context || context.state !== 'running') return
    const now = context.currentTime
    for (const [index, frequency] of [740, 988].entries()) {
      const oscillator = context.createOscillator(), gain = context.createGain()
      oscillator.type = 'sine'; oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, now + index * 0.17)
      gain.gain.exponentialRampToValueAtTime(0.25, now + index * 0.17 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.17 + 0.22)
      oscillator.connect(gain); gain.connect(context.destination)
      oscillator.start(now + index * 0.17); oscillator.stop(now + index * 0.17 + 0.23)
    }
  }, [])
  const enableSound = async () => {
    try {
      const Audio = window.AudioContext || window.webkitAudioContext
      if (!Audio) throw new Error('Som indisponível')
      audioRef.current ||= new Audio()
      await audioRef.current.resume()
      setSoundEnabled(true); playBell()
    } catch { setLoadError('Não foi possível ativar o som neste navegador.') }
  }
  const loadOrders = useCallback(async () => {
    const id = ++pollId.current
    const { data, error } = await supabase.from('orders').select('id,order_number,customer_name,fulfillment,address,payment_method,payment_status,order_status,subtotal_cents,delivery_cents,total_cents,items,created_at').order('created_at', { ascending: false })
    if (id !== pollId.current) return
    if (error) { setLoadError('Não foi possível carregar os pedidos. Verifique sua conexão e tente novamente.'); return }
    setLoadError('')
    const incoming = data || []
    if (knownIds.current && incoming.some((order) => order.order_status === 'new' && !knownIds.current.has(order.id))) playBell()
    knownIds.current = new Set(incoming.map((order) => order.id))
    setOrders(incoming)
  }, [playBell])
  useEffect(() => {
    if (!session) { knownIds.current = null; setOrders([]); return }
    let mounted = true
    const verifyAndLoad = async () => {
      const { data, error } = await supabase.from('team_members').select('user_id').eq('user_id', session.user.id).maybeSingle()
      if (!mounted) return
      if (error || !data) { setLoadError('Esta conta ainda não tem acesso ao painel. Peça ao administrador para autorizá-la.'); return }
      await loadOrders()
    }
    verifyAndLoad()
    const interval = setInterval(verifyAndLoad, 10000)
    return () => { mounted = false; clearInterval(interval); pollId.current++ }
  }, [session, loadOrders])
  const login = async (event) => {
    event.preventDefault(); setBusy(true); setLoginError('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) setLoginError('Não foi possível entrar. Confira seu e-mail e sua senha.')
    setBusy(false)
  }
  const changeStatus = async (order, status) => {
    setUpdating(order.id); setLoadError('')
    const { data, error } = await supabase.from('orders').update({ order_status: status }).eq('id', order.id).select('id')
    if (error || !data?.length) setLoadError('Não foi possível atualizar o pedido. Tente novamente.')
    else await loadOrders()
    setUpdating(null)
  }
  const visible = orders.filter((order) => filter === 'all' || (filter === 'active' ? !['completed', 'cancelled'].includes(order.order_status) : order.order_status === filter))
  const countNew = orders.filter((order) => order.order_status === 'new').length
  if (checking) return <main className="staff-page"><div className="staff-loading">Carregando painel…</div></main>
  if (!session) return <main className="staff-page"><div className="staff-login"><img src="/images/logo-cantinho.png" alt="Bar Cantinho do Céu" /><p>ÁREA DA EQUIPE</p><h1>Bem-vindo<br />ao Cantinho.</h1><span>Entre para acompanhar os pedidos.</span><form onSubmit={login}><label>E-mail<input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail da equipe" /></label><label>Senha<input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" /></label>{loginError && <div className="staff-error" role="alert">{loginError}</div>}<button className="staff-primary" disabled={busy}>{busy ? 'Entrando…' : 'Entrar no painel'} <span>→</span></button></form><small>Esse acesso é exclusivo para a equipe.</small></div></main>
  return <main className="staff-page"><header className="staff-header"><div className="staff-brand"><img src="/images/logo-cantinho.png" alt="" /><div><strong>CANTINHO DO CÉU</strong><small>PAINEL DA EQUIPE</small></div></div><button onClick={() => supabase.auth.signOut()}>Sair</button></header><div className="staff-content"><section className="staff-intro"><div><p>ÁREA DA EQUIPE</p><h1>Pedidos</h1><span>Acompanhe a cozinha em tempo real.</span></div><div className="staff-count"><strong>{countNew}</strong><span>novos pedidos</span></div></section>
    <div className="staff-actions"><button className={soundEnabled ? 'sound-on' : ''} onClick={enableSound}>{soundEnabled ? '♪ Som ativado' : '🔔 Ativar som'}</button><button onClick={loadOrders}>↻ Atualizar</button></div><p className="sound-hint">Ative o som e mantenha o painel aberto para ouvir novos pedidos.</p>
    {loadError && <div className="staff-error" role="alert">{loadError}</div>}
    <div className="staff-filters" aria-label="Filtrar pedidos">{[['active', 'Em andamento'], ['new', 'Novos'], ['all', 'Todos']].map(([id, title]) => <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{title}{id === 'new' && countNew > 0 ? ` (${countNew})` : ''}</button>)}</div>
    <div className="staff-orders">{visible.length === 0 && !loadError ? <div className="staff-empty"><span>🍽️</span><h2>Tudo tranquilo por aqui.</h2><p>Quando chegar um pedido, ele aparece nesta tela.</p></div> : visible.map((order) => { const details = orderDetails(order.address); return <article className="staff-order" key={order.id}><div className="staff-order-top"><div><span className={`status status-${order.order_status}`}>{labels[order.order_status] || order.order_status}</span><h2>Pedido #{order.order_number}</h2><p>{date(order.created_at)} · {order.fulfillment === 'delivery' ? '🛵 Entrega' : '🏠 Retirada'}</p></div><strong>{money(order.total_cents)}</strong></div><div className="staff-customer"><b>{order.customer_name}</b>{details.phone && <a href={`tel:${details.phone.replace(/\D/g, '')}`}>{details.phone}</a>}{order.fulfillment === 'delivery' && details.address && <p>📍 {details.address}</p>}</div><div className="staff-items">{Array.isArray(order.items) && order.items.map((item, index) => <div key={`${item.name}-${index}`}><span><b>{item.quantity}×</b> {item.name}</span><strong>{money(item.unit_price_cents * item.quantity)}</strong></div>)}</div><div className="staff-payment"><span>Pagamento</span><b>{order.payment_method === 'online_pix' ? 'Pix · simulação / pendente' : 'No balcão'}</b></div>{nextStatus[order.order_status] && <button className="staff-primary" disabled={updating === order.id} onClick={() => changeStatus(order, nextStatus[order.order_status])}>{updating === order.id ? 'Atualizando…' : nextLabel[order.order_status]} <span>→</span></button>}</article> })}</div>
  </div></main>
}
