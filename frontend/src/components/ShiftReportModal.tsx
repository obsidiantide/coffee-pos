import { useState } from 'react'
import type { ShiftReport } from '@/types'
import { X } from 'lucide-react'

interface Props {
  report: ShiftReport
  onClose: () => void
  onConfirm: (closingCash: number, depotAmount: number) => void
  loading: boolean
}

export default function ShiftReportModal({ report, onClose, onConfirm, loading }: Props) {
  const [closingCash, setClosingCash] = useState('')
  const [depotAmount, setDepotAmount] = useState('0')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(Number(closingCash), Number(depotAmount))
  }

  const openingCash = Number(report.opening_cash)
  const totalSales = Number(report.total_sales)
  const cashSales = Number(report.cash_sales)
  const cardSales = Number(report.card_sales)
  const totalExpenses = Number(report.total_expenses)
  const depot = Number(depotAmount) || 0
  const expectedCash = openingCash + cashSales - totalExpenses - depot

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto animate-fadeInScale">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Shift Report</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Остаток в кассе (начало)</span>
              <span className="font-semibold">{openingCash.toFixed(2)} AZN</span>
            </div>

            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Продажа за сегодня (оборот)</span>
              <span className="font-semibold">{totalSales.toFixed(2)} AZN</span>
            </div>

            <div className="bg-blue-50 p-3 rounded space-y-2">
              <div className="flex justify-between text-sm">
                <span>Продажа наличными</span>
                <span className="font-medium">{cashSales.toFixed(2)} AZN</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Продажа картой</span>
                <span className="font-medium">{cardSales.toFixed(2)} AZN</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-blue-200">
                <span className="font-semibold">Общая сумма за сегодня</span>
                <span className="font-bold">{(cashSales + cardSales).toFixed(2)} AZN</span>
              </div>
            </div>

            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Расход за сегодня</span>
              <span className="font-semibold text-red-600">{totalExpenses.toFixed(2)} AZN</span>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Сколько отложено в депо</label>
              <input
                type="number"
                step="0.01"
                value={depotAmount}
                onChange={(e) => setDepotAmount(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="0.00"
              />
            </div>

            <div className="bg-green-50 p-3 rounded">
              <div className="flex justify-between">
                <span className="font-semibold">Должно остаться наличных</span>
                <span className="font-bold text-green-700">{expectedCash.toFixed(2)} AZN</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                = {openingCash.toFixed(2)} + {cashSales.toFixed(2)} - {totalExpenses.toFixed(2)} - {depot.toFixed(2)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Сколько осталось наличных в кассе (фактически)</label>
              <input
                type="number"
                step="0.01"
                value={closingCash}
                onChange={(e) => setClosingCash(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="0.00"
                required
              />
            </div>

            {closingCash && Math.abs(Number(closingCash) - expectedCash) > 0.01 && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                <div className="text-sm font-medium text-yellow-800">
                  Разница: {(Number(closingCash) - expectedCash).toFixed(2)} AZN
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              disabled={loading}
            >
              {loading ? 'Closing...' : 'Close Shift'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
