import { useEffect, useState } from 'react'
import './tracking.css'

export default function Tracking() {
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    const token = window.location.hash.slice(1)
    const load = async () => {
      try {
        const response = await fetch('/api/tracking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }), cache: 'no-store' })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Não foi possível consultar o pedido.')
        if (active) { setOrder(data); setError('') }
      } catch (err) { if (active) setError(err.message || 'Confira sua conexão e tente novamente.') }
    }
    load()
    const timer = setInterval(load, 10000)
    return () => { active = false; clearInterval(timer) }
  }, [])
  const delivery = order?.fulfillment === 'delivery'
  const stages = ['Pedido recebido', 'Em preparo', delivery ? 'Pronto para entrega' : 'Pronto para retirada', ...(delivery ? ['Saiu para entrega'] : []), 'Concluído']
  const index = !order ? -1 : order.status === 'completed' ? stages.length - 1 : order.status === 'ready' ? (delivery && order.dispatched ? 3 : 2) : order.status === 'preparing' ? 1 : 0
  return <main className="tracking-page"><div className="tracking-content"><a className="tracking-brand" href="/"><img src="/images/logo-cantinho.png" alt="" /><span>CANTINHO DO CÉU<small>ACOMPANHE SEU PEDIDO</small></span></a><p className="tracking-eyebrow">DEMONSTRAÇÃO</p><h1>Seu pedido, de pertinho.</h1><p className="tracking-intro">Acompanhe por aqui enquanto a equipe atualiza o andamento.</p>{error && <div className="tracking-error" role="alert">{error}</div>}{!order && !error && <p>Buscando seu pedido…</p>}{order && <section className="tracking-card" aria-live="polite"><div className="tracking-card-heading"><div><small>SEU PEDIDO</small><h2>#{order.number}</h2></div><span>{delivery ? '🛵 Entrega' : '🏠 Retirada'}</span></div>{order.status === 'cancelled' ? <p className="tracking-cancelled">Pedido cancelado. Entre em contato com o estabelecimento.</p> : <ol className="tracking-steps">{stages.map((stage, i) => <li className={i === index ? 'current' : i < index ? 'done' : ''} key={stage}><span className="tracking-dot">{i < index ? '✓' : i + 1}</span><div><strong>{stage}</strong>{i === index && <small>Etapa atual</small>}</div></li>)}</ol>}<p className="tracking-note">Esta tela atualiza automaticamente enquanto estiver aberta.</p></section>}<p className="tracking-foot">Guarde este link pessoal para consultar seu pedido novamente. Pedidos concluídos são apagados após 3 dias.</p><a className="tracking-back" href="/">← Voltar ao cardápio</a></div></main>
}
