import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Search, ShoppingBasket, Plus, Minus, Trash2, Leaf, Truck, ShieldCheck, X } from 'lucide-react'

const API = 'http://localhost:8080/api'
const money = n => `₹${Number(n).toFixed(2)}`
const categories = ['All', 'Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Staples', 'Beverages']

export default function App() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [cart, setCart] = useState({})
  const [cartOpen, setCartOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [checkout, setCheckout] = useState(false)
  const [customer, setCustomer] = useState({ customerName: '', phone: '', address: '' })
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (search.trim()) params.search = search.trim()
    if (category !== 'All') params.category = category
    axios.get(`${API}/products`, { params })
      .then(r => { setProducts(r.data); setError('') })
      .catch(() => setError('Cannot connect to the backend. Start the Spring Boot server and check MySQL settings.'))
      .finally(() => setLoading(false))
  }, [search, category])

  const cartItems = useMemo(() => Object.values(cart), [cart])
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const updateQty = (product, delta) => setCart(prev => {
    const next = { ...prev }
    const qty = (next[product.id]?.quantity || 0) + delta
    if (qty <= 0) delete next[product.id]
    else next[product.id] = { ...product, quantity: qty }
    return next
  })

  async function placeOrder(e) {
    e.preventDefault()
    try {
      const response = await axios.post(`${API}/orders`, {
        ...customer,
        items: cartItems.map(i => ({ productId: i.id, quantity: i.quantity }))
      })
      setSuccess(`Order #${response.data.id} placed successfully. Total: ${money(response.data.total)}`)
      setCart({})
      setCheckout(false)
      setCartOpen(false)
      setCustomer({ customerName: '', phone: '', address: '' })
      const r = await axios.get(`${API}/products`)
      setProducts(r.data)
    } catch (err) {
      setSuccess(err.response?.data?.message || 'Could not place the order. Check backend and available stock.')
    }
  }

  return <div className="app">
    <div className="topline">Fresh groceries, delivered with care • Free delivery on orders above ₹499</div>
    <header className="header">
      <a className="brand" href="#"><span className="brand-icon"><ShoppingBasket size={25}/></span><span>fresh<span className="brand-accent">cart</span><small>YOUR DAILY MARKET</small></span></a>
      <div className="searchbox"><Search size={19}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search fruits, vegetables, milk..." aria-label="Search products"/></div>
      <button className="cart-button" onClick={() => setCartOpen(true)}><ShoppingBasket size={20}/> <span>My Cart</span><b>{count}</b></button>
    </header>

    <main>
      <section className="hero">
        <div className="hero-copy"><span className="eyebrow"><Leaf size={15}/> FRESHNESS YOU CAN TRUST</span>
          <h1>Good food.<br/><span>Good mood.</span></h1>
          <p>Everyday essentials and farm-fresh favourites, all in one place.</p>
          <button className="primary" onClick={() => document.getElementById('shop').scrollIntoView({behavior:'smooth'})}>Shop groceries <span>→</span></button>
          <div className="hero-points"><span><ShieldCheck size={16}/> Quality checked</span><span><Truck size={16}/> Quick delivery</span></div>
        </div>
        <div className="hero-art"><div className="sun"></div><div className="produce">🥑 🍊<br/>🥦 🍎</div><div className="art-note">FRESH EVERY DAY <span>✦</span></div></div>
      </section>

      <section className="benefits"><div><span className="benefit-icon">🌱</span><p><b>Farm fresh</b><small>Picked with care</small></p></div><div><span className="benefit-icon">🚚</span><p><b>Fast delivery</b><small>At your doorstep</small></p></div><div><span className="benefit-icon">🥬</span><p><b>Great quality</b><small>Freshness guaranteed</small></p></div><div><span className="benefit-icon">💚</span><p><b>Fair prices</b><small>Everyday savings</small></p></div></section>

      <section id="shop" className="shop-section"><div className="section-heading"><div><span className="eyebrow">THE GOOD STUFF</span><h2>Shop groceries</h2><p>Everything you need for a happy kitchen.</p></div><span className="product-count">{products.length} products</span></div>
        <div className="categories">{categories.map(c => <button key={c} className={category===c?'active':''} onClick={() => setCategory(c)}>{c}</button>)}</div>
        {error && <div className="error">{error}</div>}
        {loading ? <div className="empty">Loading fresh picks…</div> : products.length === 0 ? <div className="empty">No products found. Try another search.</div> :
          <div className="product-grid">{products.map(p => <article className="product-card" key={p.id}>
            <div className={`product-art art-${(p.id%5)+1}`}><span className="product-emoji">{p.emoji || '🛒'}</span><span className="fresh-tag">FRESH</span></div>
            <div className="product-info"><span className="product-category">{p.category}</span><h3>{p.name}</h3><p className="unit">{p.unit}</p><div className="product-bottom"><div><strong>{money(p.price)}</strong><small>{p.stock} in stock</small></div>
              {cart[p.id] ? <div className="qty"><button onClick={() => updateQty(p,-1)} aria-label="Decrease quantity"><Minus size={14}/></button><b>{cart[p.id].quantity}</b><button disabled={cart[p.id].quantity>=p.stock} onClick={() => updateQty(p,1)} aria-label="Increase quantity"><Plus size={14}/></button></div> : <button className="add-btn" disabled={p.stock<1} onClick={() => updateQty(p,1)}><Plus size={16}/> Add</button>}
            </div></div>
          </article>)}</div>}
      </section>
      <section className="newsletter"><div><span className="eyebrow">A LITTLE FRESHNESS IN YOUR INBOX</span><h2>Make every meal a good one.</h2><p>Shop your daily essentials with FreshCart.</p></div><span className="newsletter-emoji">🥑🥦🍋</span></section>
    </main>
    <footer><a className="brand footer-brand" href="#"><span className="brand-icon"><ShoppingBasket size={21}/></span><span>fresh<span className="brand-accent">cart</span></span></a><span>Fresh choices for everyday living.</span><span>© 2026 FreshCart Demo</span></footer>

    {cartOpen && <div className="overlay" onMouseDown={e => {if(e.target===e.currentTarget)setCartOpen(false)}}><aside className="cart-panel"><div className="panel-head"><div><span className="eyebrow">YOUR BASKET</span><h2>My Cart ({count})</h2></div><button className="icon-btn" onClick={() => setCartOpen(false)}><X/></button></div>
      {cartItems.length===0 ? <div className="empty cart-empty"><span>🛍️</span><h3>Your basket is empty</h3><p>Add a few fresh favourites to get started.</p><button className="primary" onClick={() => setCartOpen(false)}>Continue shopping</button></div> :
      <>{!checkout ? <><div className="cart-list">{cartItems.map(i=><div className="cart-row" key={i.id}><span className="cart-emoji">{i.emoji}</span><div className="cart-item-name"><b>{i.name}</b><small>{money(i.price)} · {i.unit}</small><div className="qty"><button onClick={()=>updateQty(i,-1)}><Minus size={13}/></button><b>{i.quantity}</b><button onClick={()=>updateQty(i,1)} disabled={i.quantity>=i.stock}><Plus size={13}/></button></div></div><strong>{money(i.price*i.quantity)}</strong><button className="remove-btn" onClick={()=>setCart(prev=>{const n={...prev};delete n[i.id];return n})}><Trash2 size={15}/></button></div>)}</div><div className="cart-total"><div><span>Subtotal</span><b>{money(total)}</b></div><div><span>Delivery</span><b>{total>=499?'FREE':'₹30.00'}</b></div><div className="grand-total"><span>Total</span><b>{money(total+(total>=499?0:30))}</b></div><button className="primary full" onClick={()=>setCheckout(true)}>Proceed to checkout →</button><small className="secure-note">Demo checkout · No payment is collected</small></div></> :
      <form className="checkout-form" onSubmit={placeOrder}><button type="button" className="back-link" onClick={()=>setCheckout(false)}>← Back to cart</button><h3>Delivery details</h3><label>Full name<input required value={customer.customerName} onChange={e=>setCustomer({...customer,customerName:e.target.value})} placeholder="Your name"/></label><label>Phone number<input required pattern="[0-9]{10}" title="Enter a 10-digit phone number" value={customer.phone} onChange={e=>setCustomer({...customer,phone:e.target.value})} placeholder="10-digit mobile number"/></label><label>Delivery address<textarea required value={customer.address} onChange={e=>setCustomer({...customer,address:e.target.value})} placeholder="House number, street, city"/></label><div className="checkout-total">Order total <b>{money(total+(total>=499?0:30))}</b></div><button className="primary full" type="submit">Place demo order</button></form>}</>}
    </aside></div>}
    {success && <div className="toast"><span>{success}</span><button onClick={()=>setSuccess('')}><X size={17}/></button></div>}
  </div>
}
