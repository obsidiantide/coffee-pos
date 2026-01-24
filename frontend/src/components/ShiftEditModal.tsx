import { useState } from 'react'
import type { Shift } from '@/types'
import { X } from 'lucide-react'

interface Props {
  shift: Shift
  onClose: () => void
  onSave: (updatedShift: Partial<Shift>) => void
}

export default function ShiftEditModal({ shift, onClose, onSave }: Props) {
  const [formData, setFormData] = useState({
    opening_cash: shift.opening_cash,
    closing_cash: shift.closing_cash || '',
    depot_amount: shift.depot_amount,
    total_sales: shift.total_sales,
    cash_sales: shift.cash_sales,
    card_sales: shift.card_sales,
    total_expenses: shift.total_expenses,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      opening_cash: formData.opening_cash,
      closing_cash: formData.closing_cash || null,
      depot_amount: formData.depot_amount,
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto animate-fadeInScale">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit Shift #{shift.id}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-gray-50 p-3 rounded space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">User:</span>
              <span className="font-medium">{shift.user_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${shift.is_active ? 'text-green-600' : 'text-gray-600'}`}>
                {shift.is_active ? 'Active' : 'Closed'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Opened:</span>
              <span className="font-medium">{new Date(shift.opened_at).toLocaleString()}</span>
            </div>
            {shift.closed_at && (
              <div className="flex justify-between">
                <span className="text-gray-600">Closed:</span>
                <span className="font-medium">{new Date(shift.closed_at).toLocaleString()}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Opening Cash (AZN)</label>
            <input
              type="number"
              step="0.01"
              value={formData.opening_cash}
              onChange={(e) => handleChange('opening_cash', e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="bg-blue-50 p-3 rounded space-y-2">
            <div className="text-sm font-semibold mb-2">Sales (Read-only)</div>
            <div className="flex justify-between text-sm">
              <span>Total Sales:</span>
              <span className="font-medium">{Number(formData.total_sales).toFixed(2)} AZN</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Cash Sales:</span>
              <span className="font-medium">{Number(formData.cash_sales).toFixed(2)} AZN</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Card Sales:</span>
              <span className="font-medium">{Number(formData.card_sales).toFixed(2)} AZN</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Expenses:</span>
              <span className="font-medium">{Number(formData.total_expenses).toFixed(2)} AZN</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Depot Amount (AZN)</label>
            <input
              type="number"
              step="0.01"
              value={formData.depot_amount}
              onChange={(e) => handleChange('depot_amount', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {!shift.is_active && (
            <div>
              <label className="block text-sm font-medium mb-1">Closing Cash (AZN)</label>
              <input
                type="number"
                step="0.01"
                value={formData.closing_cash}
                onChange={(e) => handleChange('closing_cash', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          )}

          <div className="bg-green-50 p-3 rounded">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Expected Cash Remaining:</span>
              <span className="font-bold text-green-700">
                {(Number(formData.opening_cash) + Number(formData.cash_sales) - Number(formData.total_expenses) - Number(formData.depot_amount)).toFixed(2)} AZN
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
