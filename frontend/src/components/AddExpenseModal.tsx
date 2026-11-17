import { useState } from 'react'
import { DollarSign } from 'lucide-react'
import ModalShell from './ModalShell'

interface Props {
  onClose: () => void
  onSave: (description: string, amount: number) => void
  loading?: boolean
}

export default function AddExpenseModal({ onClose, onSave, loading = false }: Props) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || !amount) {
      alert('Please fill in all fields')
      return
    }
    onSave(description.trim(), Number(amount))
  }

  return (
    <ModalShell
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <DollarSign size={24} className="text-red-600" />
          <h2 className="text-xl font-bold">Add Expense</h2>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2 transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="e.g., Coffee beans, Milk, Cleaning supplies"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Amount (AZN)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded px-3 py-2 transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="0.00"
            required
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
          <p className="text-yellow-800">
            💡 This expense will be added to the current active shift and will be included in the shift report.
          </p>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="spinner"></div>
                Adding...
              </span>
            ) : (
              'Add Expense'
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}
