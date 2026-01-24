import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { OrderDTO } from '@/types'
import { azn } from '@/lib/format'

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/orders/')
      setOrders(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const completeOrder = async (id: number) => {
    await api.post(`/orders/${id}/complete/`)
    await load()
  }

  const cancelOrder = async (id: number) => {
    await api.patch(`/orders/${id}/`, { status: 'cancelled' })
    await load()
  }

  const filtered = orders.filter((o) => (status === 'all' ? true : o.status === status))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Orders</h1>
        <div className="flex items-center gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="border rounded px-2 py-1">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="px-3 py-2 border rounded" onClick={load}>Refresh</button>
        </div>
      </div>

      {loading && <div>Loading...</div>}

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((o) => (
          <div key={o.id} className="card p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Order #{o.id}</div>
              <div className={`text-sm ${o.status==='completed' ? 'text-green-600' : o.status==='cancelled' ? 'text-red-600' : 'text-gray-600'}`}>{o.status}</div>
            </div>
            <div className="text-sm text-gray-500">{new Date(o.created_at).toLocaleString()}</div>
            <div className="space-y-1">
              {o.items.map((i) => (
                <div key={i.id} className="flex items-center justify-between">
                  <div>{i.product_name} × {i.quantity}</div>
                  <div className="text-xs text-gray-600">{azn(i.price_at_time || '0')}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="font-bold">{azn(o.total_amount)}</div>
              <div className="flex gap-2">
                {o.status !== 'completed' && (
                  <button className="button !px-3 !py-2" onClick={() => completeOrder(o.id)}>Complete</button>
                )}
                {o.status !== 'cancelled' && (
                  <button className="px-3 py-2 rounded bg-gray-200" onClick={() => cancelOrder(o.id)}>Cancel</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && !loading && <div className="text-gray-500">No orders.</div>}
    </div>
  )
}
