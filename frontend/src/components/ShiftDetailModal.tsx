import type { Shift } from '@/types'
import { X, Calendar, Clock, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

interface Props {
  shift: Shift
  onClose: () => void
}

export default function ShiftDetailModal({ shift, onClose }: Props) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const cashRemaining = shift.closing_cash 
    ? Number(shift.closing_cash)
    : Number(shift.opening_cash) + Number(shift.cash_sales) - Number(shift.total_expenses) - Number(shift.depot_amount)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-backdrop" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto animate-fadeInScale"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Shift #{shift.id}</h2>
            <p className="text-sm text-gray-600">{shift.user_name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Calendar size={16} />
                <span className="text-sm">Status</span>
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${shift.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {shift.is_active ? 'Active' : 'Closed'}
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Clock size={16} />
                <span className="text-sm">Duration</span>
              </div>
              <div className="text-sm">
                <div>Opened: {formatDate(shift.opened_at)}</div>
                {shift.closed_at && <div>Closed: {formatDate(shift.closed_at)}</div>}
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <DollarSign size={20} className="text-green-600" />
              Financial Summary
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-sm text-gray-600 mb-1">Opening Cash</div>
                <div className="text-2xl font-bold text-blue-700">{Number(shift.opening_cash).toFixed(2)} AZN</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-sm text-gray-600 mb-1">Total Sales</div>
                <div className="text-2xl font-bold text-green-700">{Number(shift.total_sales).toFixed(2)} AZN</div>
              </div>
            </div>
          </div>

          {/* Sales Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <TrendingUp size={20} className="text-purple-600" />
              Sales Breakdown
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Cash Sales</div>
                <div className="text-xl font-bold text-green-700">{Number(shift.cash_sales).toFixed(2)} AZN</div>
                <div className="text-xs text-gray-500 mt-1">
                  {shift.total_sales !== '0' ? ((Number(shift.cash_sales) / Number(shift.total_sales)) * 100).toFixed(1) : 0}%
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Card Sales</div>
                <div className="text-xl font-bold text-blue-700">{Number(shift.card_sales).toFixed(2)} AZN</div>
                <div className="text-xs text-gray-500 mt-1">
                  {shift.total_sales !== '0' ? ((Number(shift.card_sales) / Number(shift.total_sales)) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Expenses and Depot */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <TrendingDown size={20} className="text-red-600" />
              Expenses & Depot
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="text-sm text-gray-600 mb-1">Total Expenses</div>
                <div className="text-xl font-bold text-red-700">{Number(shift.total_expenses).toFixed(2)} AZN</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="text-sm text-gray-600 mb-1">Depot Amount</div>
                <div className="text-xl font-bold text-yellow-700">{Number(shift.depot_amount).toFixed(2)} AZN</div>
              </div>
            </div>
          </div>

          {/* Cash Summary */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-5 rounded-lg border-2 border-green-200">
            <h3 className="text-lg font-semibold mb-3">Cash Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Opening Cash:</span>
                <span className="font-medium">+{Number(shift.opening_cash).toFixed(2)} AZN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cash Sales:</span>
                <span className="font-medium text-green-600">+{Number(shift.cash_sales).toFixed(2)} AZN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expenses:</span>
                <span className="font-medium text-red-600">-{Number(shift.total_expenses).toFixed(2)} AZN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Depot:</span>
                <span className="font-medium text-yellow-600">-{Number(shift.depot_amount).toFixed(2)} AZN</span>
              </div>
              <div className="border-t-2 border-gray-300 pt-2 mt-2 flex justify-between">
                <span className="font-semibold">Expected Cash:</span>
                <span className="font-bold text-lg">{cashRemaining.toFixed(2)} AZN</span>
              </div>
              {shift.closing_cash && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Actual Closing Cash:</span>
                    <span className="font-medium">{Number(shift.closing_cash).toFixed(2)} AZN</span>
                  </div>
                  {Math.abs(Number(shift.closing_cash) - cashRemaining) > 0.01 && (
                    <div className="flex justify-between text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                      <span className="font-medium">Difference:</span>
                      <span className="font-bold">{(Number(shift.closing_cash) - cashRemaining).toFixed(2)} AZN</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
