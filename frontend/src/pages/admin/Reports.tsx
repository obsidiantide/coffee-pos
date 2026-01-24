import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { azn } from '@/lib/format'

interface DashboardStats {
  orders_today: number
  completed_today: number
  sales_today: number
  pending_orders: number
  total_products: number
  active_categories: number
}

interface DailySale { day: string; total_orders: number; total_sales: number }
interface TopProduct { product__name: string; total_quantity: number; total_sales: number }

export default function AdminReports() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [daily, setDaily] = useState<DailySale[]>([])
  const [top, setTop] = useState<TopProduct[]>([])
  const [days, setDays] = useState(7)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [s, r] = await Promise.all([
        api.get('/dashboard/stats/'),
        api.get(`/reports/sales/?days=${days}`),
      ])
      setStats(s.data)
      setDaily(r.data.daily_sales)
      setTop(r.data.top_products)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [days])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Reports</h1>
        <div className="flex items-center gap-2">
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="border rounded px-2 py-1">
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select>
          <button className="px-3 py-2 border rounded" onClick={load}>Refresh</button>
        </div>
      </div>

      {loading && <div>Loading...</div>}

      {stats && (
        <div className="grid grid-cols-6 gap-3">
          <StatCard title="Orders today" value={stats.orders_today} />
          <StatCard title="Completed today" value={stats.completed_today} />
          <StatCard title="Sales today" value={azn(stats.sales_today)} />
          <StatCard title="Pending" value={stats.pending_orders} />
          <StatCard title="Products" value={stats.total_products} />
          <StatCard title="Categories" value={stats.active_categories} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-3">
          <div className="font-semibold mb-2">Sales by day</div>
          <div className="space-y-2">
            {daily.map((d) => (
              <div key={d.day} className="flex items-center gap-2">
                <div className="w-24 text-sm text-gray-600">{new Date(d.day).toLocaleDateString()}</div>
                <div className="flex-1 bg-gray-100 h-4 rounded">
                  <div className="bg-primary h-4 rounded" style={{ width: `${Math.min(100, (Number(d.total_sales) / Math.max(1, Number(stats?.sales_today) || 1)) * 100)}%` }} />
                </div>
                <div className="w-24 text-right text-sm">{azn(d.total_sales)}</div>
              </div>
            ))}
            {daily.length === 0 && <div className="text-gray-500">No sales.</div>}
          </div>
        </div>
        <div className="card p-3">
          <div className="font-semibold mb-2">Top products</div>
          <div className="space-y-2">
            {top.map((t) => (
              <div key={t.product__name} className="flex items-center justify-between">
                <div>{t.product__name}</div>
                <div className="text-sm text-gray-600">{t.total_quantity} pcs · {azn(t.total_sales)}</div>
              </div>
            ))}
            {top.length === 0 && <div className="text-gray-500">No data.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="card p-3">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}
