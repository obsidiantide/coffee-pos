import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import type { Category, Extra, Product } from '@/types'
import { useOrder } from '@/store/order'
import { azn } from '@/lib/format'
import { Plus, Minus, Check, Trash2 } from 'lucide-react'
import ShiftManager from '@/components/ShiftManager'

export default function Pos() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [extras, setExtras] = useState<Extra[]>([])
  const [activeCat, setActiveCat] = useState<number | 'all'>('all')
  const [submitting, setSubmitting] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L'>('M')
  const [showSplitModal, setShowSplitModal] = useState(false)
  const [splitCash, setSplitCash] = useState('')
  const [splitCard, setSplitCard] = useState('')

  const order = useOrder()

  useEffect(() => {
    const load = async () => {
      const [cats, exs] = await Promise.all([
        api.get('/categories/'),
        api.get('/extras/'),
      ])
      setCategories(cats.data)
      setExtras(exs.data)
      await fetchProducts('all')
    }
    load()
  }, [])

  const fetchProducts = async (cat: number | 'all') => {
    const url = cat === 'all' ? '/products/' : `/products/?category=${cat}`
    const { data } = await api.get(url)
    setProducts(data)
  }

  const filtered = useMemo(() => products, [products])

  const onSubmit = async (complete = true) => {
    if (order.items.length === 0) return
    setSubmitting(true)
    try {
      const payload = {
        items: order.items.map((i) => ({
          product: i.product.id,
          quantity: i.quantity,
          size: i.size,
          extras: i.extras.map((e) => ({ extra: e.extra.id, quantity: e.quantity })),
        })),
        payment_type: order.paymentType,
        cash_amount: order.paymentType === 'split' ? order.cashAmount : (order.paymentType === 'cash' ? order.total() : 0),
        card_amount: order.paymentType === 'split' ? order.cardAmount : (order.paymentType === 'card' ? order.total() : 0),
        status: complete ? 'completed' : 'pending',
      }
      const { data } = await api.post('/orders/', payload)
      if (complete && data?.id) {
        await api.post(`/orders/${data.id}/complete/`)
      }
      order.clear()
      setSelectedProductId(null)
      setSelectedSize('M')
      alert('Order submitted')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-3">
      <ShiftManager />
      <div className="grid grid-cols-3 gap-3">
      <div className="col-span-2 space-y-3">
        <div className="flex gap-2">
          <button onClick={() => { setActiveCat('all'); fetchProducts('all') }} className={`px-4 py-2 rounded ${activeCat==='all' ? 'bg-primary text-white' : 'bg-white border'}`}>All</button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => { setActiveCat(c.id); fetchProducts(c.id) }} className={`px-4 py-2 rounded ${activeCat===c.id ? 'bg-primary text-white' : 'bg-white border'}`}>{c.name}</button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((p, idx) => (
            <button 
              key={p.id} 
              onClick={() => { order.addProduct(p); setSelectedProductId(p.id); setSelectedSize('M') }} 
              className="group card p-5 text-left hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 stagger-item relative overflow-hidden"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" style={{ background: 'rgba(107, 68, 35, 0.1)' }}></div>
              <div className="relative z-10">
                <div className="text-lg font-bold transition-colors" style={{ color: '#2C2C2C' }}>{p.name}</div>
                <div className="text-sm mt-1" style={{ color: '#757575' }}>{p.category_name}</div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold" style={{ color: '#6B4423' }}>{azn(p.price)}</span>
                  <span className="text-xs" style={{ color: '#757575' }}>AZN</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="col-span-1">
        <div className="card p-5 space-y-4 animate-slideInRight sticky top-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <h3 className="text-xl font-bold gradient-text">Current Order</h3>
            <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={() => order.clear()}>Clear All</button>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => order.setPaymentType('cash')}
                className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  order.paymentType === 'cash' 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg scale-105' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                💵 Cash
              </button>
              <button
                onClick={() => order.setPaymentType('card')}
                className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  order.paymentType === 'card' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                💳 Card
              </button>
            </div>
            <button
              onClick={() => setShowSplitModal(true)}
              className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                order.paymentType === 'split' 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              💰 Split Payment {order.paymentType === 'split' ? `(${azn(order.cashAmount)} + ${azn(order.cardAmount)})` : ''}
            </button>
          </div>
          <div className="space-y-2">
            {order.items.map((i) => {
              const getPrice = () => {
                if (i.size === 'S' && i.product.price_small) return i.product.price_small
                if (i.size === 'L' && i.product.price_large) return i.product.price_large
                return i.product.price
              }
              return (
              <div key={`${i.product.id}-${i.size}`} className={`border rounded-lg p-3 transition-all duration-200 animate-fadeInScale cursor-pointer ${
                selectedProductId===i.product.id 
                  ? 'shadow-md scale-[1.01]' 
                  : 'hover:shadow-sm'
              }`} style={selectedProductId===i.product.id && selectedSize===i.size ? { borderColor: '#6B4423', background: '#F5F5F5' } : { borderColor: '#E0E0E0' }} onClick={() => { setSelectedProductId(i.product.id); setSelectedSize(i.size) }}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{i.product.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{azn(getPrice())} × {i.quantity}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors" onClick={(e) => { e.stopPropagation(); order.decrement(i.product.id, i.size) }}>
                      <Minus size={16} className="text-red-600" />
                    </button>
                    <div className="w-10 text-center font-bold text-lg">{i.quantity}</div>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors" onClick={(e) => { e.stopPropagation(); order.increment(i.product.id, i.size) }}>
                      <Plus size={16} className="text-green-600" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  {(['S', 'M', 'L'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={(e) => { e.stopPropagation(); order.setSize(i.product.id, i.size, size) }}
                      className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        i.size === size 
                          ? 'text-white shadow-sm' 
                          : 'hover:bg-gray-100'
                      }`}
                      style={i.size === size ? { background: '#6B4423', color: 'white' } : { background: '#F5F5F5', color: '#757575' }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {i.extras.length > 0 && (
                  <div className="mt-2 pl-2 border-l text-sm space-y-1">
                    {i.extras.map((e) => (
                      <div key={e.extra.id} className="flex items-center justify-between">
                        <div>{e.extra.name} × {e.quantity}</div>
                        <div className="flex items-center gap-1">
                          <button className="p-1 border rounded" onClick={() => order.decExtra(i.product.id, i.size, e.extra.id)}><Minus size={14} /></button>
                          <button className="p-1 border rounded" onClick={() => order.incExtra(i.product.id, i.size, e.extra.id)}><Plus size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )})}
            {order.items.length === 0 && <div className="text-center text-gray-500 py-6">No items</div>}
          </div>
          <div className="">
            <div className="text-sm text-gray-600 mb-2">Extras</div>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-auto">
              {extras.map((e) => (
                <button key={e.id} className="px-3 py-2 rounded border bg-white" onClick={() => selectedProductId && order.addExtra(selectedProductId, selectedSize, e)}>{e.name} · {azn(e.price)}</button>
              ))}
            </div>
          </div>
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium" style={{ color: '#757575' }}>Total Amount</span>
              <div className="text-3xl font-bold" style={{ color: '#6B4423' }}>
                {azn(order.total())}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button 
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                disabled={submitting || order.items.length===0} 
                onClick={() => onSubmit(false)}
              >
                <Check size={18} />
                Save
              </button>
              <button 
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                disabled={submitting || order.items.length===0} 
                onClick={() => onSubmit(true)}
              >
                <Check size={18} />
                Complete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Split Payment Modal */}
    {showSplitModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn" onClick={() => setShowSplitModal(false)}>
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl animate-bounceIn" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-2xl font-bold mb-4" style={{ color: '#6B4423' }}>Split Payment</h3>
          <p className="text-sm mb-4" style={{ color: '#757575' }}>Total: {azn(order.total())}</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2C2C2C' }}>💵 Cash Amount</label>
              <input
                type="number"
                step="0.01"
                value={splitCash}
                onChange={(e) => setSplitCash(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                style={{ borderColor: '#E0E0E0' }}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2C2C2C' }}>💳 Card Amount</label>
              <input
                type="number"
                step="0.01"
                value={splitCard}
                onChange={(e) => setSplitCard(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                style={{ borderColor: '#E0E0E0' }}
                placeholder="0.00"
              />
            </div>
            
            <div className="p-3 rounded-lg" style={{ background: '#F5F5F5' }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#757575' }}>Total Entered:</span>
                <span className="font-bold" style={{ color: '#6B4423' }}>
                  {azn((Number(splitCash) || 0) + (Number(splitCard) || 0))}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setShowSplitModal(false)
                setSplitCash('')
                setSplitCard('')
              }}
              className="flex-1 px-4 py-3 rounded-lg font-semibold transition-all"
              style={{ background: '#E0E0E0', color: '#2C2C2C' }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const cash = Number(splitCash) || 0
                const card = Number(splitCard) || 0
                if (cash + card === order.total()) {
                  order.setSplitPayment(cash, card)
                  setShowSplitModal(false)
                  setSplitCash('')
                  setSplitCard('')
                } else {
                  alert(`Total must equal ${azn(order.total())}`)
                }
              }}
              className="flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-all"
              style={{ background: '#6B4423' }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  )
}
