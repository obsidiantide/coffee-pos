import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { OrderDTO } from '@/types'
import { azn } from '@/lib/format'

export default function TodaysOrders() {
  const [orders, setOrders] = useState<OrderDTO[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/orders/today/')
      setOrders(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-3 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Today's Orders</h1>
        <button className="px-3 py-2 border rounded" onClick={load}>Refresh</button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="spinner"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {orders.map((o, idx) => (
          <div key={o.id} className="card p-3 stagger-item hover:shadow-lg transition-all duration-200" style={{ animationDelay: `${idx * 0.05}s` }}>
            <div className="flex items-center justify-between">
              <div className="font-semibold">Order #{o.id}</div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${o.payment_type === 'cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {o.payment_type === 'cash' ? 'Cash' : 'Card'}
                </span>
                <div className={`text-sm ${o.status==='completed' ? 'text-green-600' : o.status==='cancelled' ? 'text-red-600' : 'text-gray-600'}`}>{o.status}</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">{new Date(o.created_at).toLocaleString()}</div>
            <div className="mt-2 space-y-1">
              {o.items.map((i) => (
                <div key={i.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      {i.product_name} × {i.quantity}
                      {i.size && <span className="ml-2 text-xs text-gray-500">({i.size})</span>}
                    </div>
                    <div className="text-sm text-gray-600">{azn(i.price_at_time || '0')}</div>
                  </div>
                  {i.extras.length > 0 && (
                    <div className="ml-2 text-xs text-gray-600">
                      {i.extras.map((e) => (
                        <div key={e.id}>{e.extra_name} × {e.quantity}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 font-bold">{azn(o.total_amount)}</div>
          </div>
        ))}
      </div>

      {orders.length === 0 && !loading && <div className="text-gray-500">No orders yet.</div>}
    </div>
  )
}
