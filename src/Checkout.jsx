import { useState } from 'react'

const money = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const maskPhone = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4,5})(\d{4})$/, '$1-$2')
}
const maskCep = (value) => value.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2')

export default function Checkout({ cart, total, onBack, onSuccess }) {
  const [mode, setMode] = useState('delivery')
  const [fields, setFields] = useState({ name: '', phone: '', cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' })
  const [lookup, setLookup] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const update = (key, value) => setFields((current) => ({ ...current, [key]: value }))
  const findCep = async () => {
    const cep = fields.cep.replace(/\D/g, '')
    if (cep.length !== 8) { setLookup('Informe um CEP com 8 números ou preencha o endereço manualmente.'); return }
    setLookup('Buscando endereço…')
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      if (!response.ok) throw new Error('CEP indisponível')
      const result = await response.json()
      if (result.erro) throw new Error('CEP não encontrado')
      setFields((current) => current.cep.replace(/\D/g, '') === cep ? { ...current, street: result.logradouro || current.street, neighborhood: result.bairro || current.neighborhood, city: result.localidade || current.city, state: result.uf || current.state } : current)
      setLookup('Endereço encontrado. Confira e complete os campos.')
    } catch { setLookup('Não foi possível buscar o CEP. Preencha o endereço manualmente.') }
  }
  const submit = async (event) => {
    event.preventDefault()
    if (fields.name.trim().length < 2 || fields.phone.replace(/\D/g, '').length < 10) { setError('Confira seu nome e telefone com DDD.'); return }
    setError(''); setBusy(true)
    try {
      const payload = { customerName: fields.name, phone: fields.phone, fulfillment: mode, address: mode === 'delivery' ? { cep: fields.cep, street: fields.street, number: fields.number, complement: fields.complement, neighborhood: fields.neighborhood, city: fields.city, state: fields.state } : null, paymentMethod: mode === 'delivery' ? 'online_pix' : 'pay_at_counter', items: cart }
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result.id) throw new Error(result.error || 'Não foi possível enviar o pedido. Tente novamente.')
      onSuccess({ id: result.id, name: fields.name, mode, trackingToken: result.trackingToken })
    } catch (err) { setError(err.message || 'Não foi possível enviar o pedido. Tente novamente.') } finally { setBusy(false) }
  }
  const field = (key, label, options = {}) => <label className={options.className || ''}>{label}{options.optional && <small> · opcional</small>}<input name={key} value={fields[key]} onChange={(e) => update(key, options.mask ? options.mask(e.target.value) : e.target.value)} onBlur={options.onBlur} required={!options.optional} autoComplete={options.autoComplete} inputMode={options.inputMode} maxLength={options.maxLength} placeholder={options.placeholder} /></label>
  return <section className="order-page"><form className="order-screen checkout checkout-new" onSubmit={submit}>
    <button type="button" className="back" onClick={onBack}>← Voltar ao carrinho</button>
    <div className="checkout-intro"><p>SEU PEDIDO · ÚLTIMO PASSO</p><h2>Vamos finalizar?</h2><span>Conta pra gente como seu pedido vai chegar.</span></div>
    <div className="checkout-block"><div className="checkout-block-title"><span>01</span><div><h3>Seus dados</h3><p>Para a equipe saber com quem falar.</p></div></div>
      {field('name', 'Seu nome', { autoComplete: 'name', placeholder: 'Como podemos te chamar?', maxLength: 100 })}
      {field('phone', 'Celular com DDD', { autoComplete: 'tel-national', inputMode: 'tel', placeholder: '(13) 99999-9999', mask: maskPhone, maxLength: 15 })}
    </div>
    <div className="checkout-block"><div className="checkout-block-title"><span>02</span><div><h3>Como você prefere?</h3><p>Escolha entrega ou retirada.</p></div></div>
      <div className="fulfillment-choices"><button type="button" className={mode === 'delivery' ? 'chosen' : ''} onClick={() => setMode('delivery')}><b>🛵 Entrega</b><small>Taxa de R$ 10,00</small></button><button type="button" className={mode === 'pickup' ? 'chosen' : ''} onClick={() => setMode('pickup')}><b>🏠 Retirar no bar</b><small>Sem taxa</small></button></div>
      {mode === 'delivery' ? <div className="address-fields">
        {field('cep', 'CEP', { autoComplete: 'postal-code', inputMode: 'numeric', placeholder: '00000-000', mask: maskCep, onBlur: findCep, maxLength: 9 })}
        {lookup && <p className="cep-feedback" role="status">{lookup}</p>}
        {field('street', 'Rua ou avenida', { autoComplete: 'address-line1', placeholder: 'Nome da rua', maxLength: 120 })}
        <div className="field-row">{field('number', 'Número', { placeholder: 'Ex.: 99', maxLength: 20 })}{field('complement', 'Complemento', { optional: true, autoComplete: 'address-line2', placeholder: 'Apto, bloco…', maxLength: 100 })}</div>
        {field('neighborhood', 'Bairro', { placeholder: 'Seu bairro', maxLength: 100 })}
        <div className="field-row">{field('city', 'Cidade', { autoComplete: 'address-level2', placeholder: 'Cidade', maxLength: 100 })}{field('state', 'Estado', { autoComplete: 'address-level1', placeholder: 'UF', maxLength: 2 })}</div>
      </div> : <div className="pickup-address">📍 R. Alfredo Albertini, 99 · Marapé, Santos</div>}
    </div>
    <div className="checkout-block"><div className="checkout-block-title"><span>03</span><div><h3>Pagamento</h3><p>{mode === 'delivery' ? 'Pix online · demonstração' : 'Você paga ao retirar'}</p></div></div>
      <div className="payment-note">{mode === 'delivery' ? 'O Pix é apenas uma demonstração: nenhum pagamento será gerado ou confirmado.' : 'Pagamento no balcão, na retirada do pedido.'}</div>
    </div>
    <div className="checkout-block order-summary"><h3>Resumo do pedido</h3>{cart.map((item) => <div className="summary-line" key={`${item.name}-${item.price}`}><span>{item.quantity}× {item.name}</span><span>{money(Number(item.price.replace(/[^0-9,]/g, '').replace(',', '.')) * item.quantity)}</span></div>)}<div className="summary-line"><span>Subtotal</span><span>{money(total)}</span></div><div className="summary-line"><span>Entrega</span><span>{mode === 'delivery' ? money(10) : 'Grátis'}</span></div><div className="summary-final"><strong>Total</strong><strong>{money(total + (mode === 'delivery' ? 10 : 0))}</strong></div></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="add-button checkout-submit" type="submit" disabled={busy}>{busy ? 'Enviando…' : 'Enviar pedido de demonstração'} <span>→</span></button>
    <p className="demo-disclaimer">Demonstração: consulte a equipe sobre disponibilidade e valores.</p>
  </form></section>
}
