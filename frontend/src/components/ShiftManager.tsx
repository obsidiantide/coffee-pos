import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { getErrorStatus } from '@/lib/errors'
import type { Shift, ShiftReport } from '@/types'
import { Clock, DollarSign, TrendingUp, AlertCircle, Plus } from 'lucide-react'
import ShiftReportModal from './ShiftReportModal'
import AddExpenseModal from './AddExpenseModal'

export default function ShiftManager() {
  const [activeShift, setActiveShift] = useState<Shift | null>(null)
  const [loading, setLoading] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [report, setReport] = useState<ShiftReport | null>(null)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [expenseLoading, setExpenseLoading] = useState(false)

  useEffect(() => {
    loadActiveShift()
  }, [])

  const loadActiveShift = async () => {
    try {
      const { data } = await api.get('/shifts/active/')
      setActiveShift(data)
    } catch (err) {
      if (getErrorStatus(err) !== 404) {
        console.error('Failed to load active shift', err)
      }
    }
  }

  const openShift = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/shifts/', { opening_cash: 0 })
      setActiveShift(data)
    } catch (err) {
      alert('Failed to open shift')
    } finally {
      setLoading(false)
    }
  }

  const closeShift = async () => {
    if (!activeShift) return
    
    setLoading(true)
    try {
      const { data: reportData } = await api.get(`/shifts/${activeShift.id}/report/`)
      setReport(reportData)
      setShowReport(true)
    } catch (err) {
      alert('Failed to load shift report')
    } finally {
      setLoading(false)
    }
  }

  const confirmCloseShift = async (closingCash: number, depotAmount: number) => {
    if (!activeShift) return

    setLoading(true)
    try {
      await api.post(`/shifts/${activeShift.id}/close/`, {
        closing_cash: closingCash,
        depot_amount: depotAmount,
      })
      setActiveShift(null)
      setShowReport(false)
      setReport(null)
    } catch (err) {
      alert('Failed to close shift')
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = async (description: string, amount: number) => {
    setExpenseLoading(true)
    try {
      await api.post('/expenses/', {
        description,
        amount,
      })
      setShowExpenseModal(false)
      await loadActiveShift()
    } catch (err) {
      alert('Failed to add expense')
    } finally {
      setExpenseLoading(false)
    }
  }

  if (!activeShift) {
    return (
      <div className="card p-6 text-center animate-fadeIn">
        <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
        <h3 className="text-lg font-semibold mb-2">No Active Shift</h3>
        <p className="text-gray-600 mb-4">Open a shift to start taking orders</p>
        <button
          onClick={openShift}
          disabled={loading}
          className="button bg-green-600 hover:bg-green-700"
        >
          Open Shift
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="card p-4 space-y-3 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-green-600" />
            <span className="font-semibold">Shift Active</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowExpenseModal(true)}
              className="button bg-orange-600 hover:bg-orange-700 text-sm flex items-center gap-1"
            >
              <Plus size={16} />
              Add Expense
            </button>
            <button
              onClick={closeShift}
              disabled={loading}
              className="button bg-red-600 hover:bg-red-700 text-sm"
            >
              Close Shift
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 p-3 rounded transition-all duration-200 hover:bg-blue-100 hover:shadow-sm animate-fadeIn">
            <div className="text-xs text-gray-600 mb-1">Total Sales</div>
            <div className="text-lg font-bold text-blue-700">{Number(activeShift.total_sales).toFixed(2)} AZN</div>
          </div>
          <div className="bg-green-50 p-3 rounded transition-all duration-200 hover:bg-green-100 hover:shadow-sm animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <div className="text-xs text-gray-600 mb-1">Cash Sales</div>
            <div className="text-lg font-bold text-green-700">{Number(activeShift.cash_sales).toFixed(2)} AZN</div>
          </div>
          <div className="bg-purple-50 p-3 rounded transition-all duration-200 hover:bg-purple-100 hover:shadow-sm animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="text-xs text-gray-600 mb-1">Card Sales</div>
            <div className="text-lg font-bold text-purple-700">{Number(activeShift.card_sales).toFixed(2)} AZN</div>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Opened: {new Date(activeShift.opened_at).toLocaleString()}
        </div>
      </div>

      {showReport && report && (
        <ShiftReportModal
          report={report}
          onClose={() => setShowReport(false)}
          onConfirm={confirmCloseShift}
          loading={loading}
        />
      )}

      {showExpenseModal && (
        <AddExpenseModal
          onClose={() => setShowExpenseModal(false)}
          onSave={handleAddExpense}
          loading={expenseLoading}
        />
      )}
    </>
  )
}
