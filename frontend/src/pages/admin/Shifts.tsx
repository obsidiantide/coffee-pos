import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Shift, Expense } from '@/types'
import { Calendar, DollarSign, Edit, Eye } from 'lucide-react'
import ShiftEditModal from '@/components/ShiftEditModal'
import ShiftDetailModal from '@/components/ShiftDetailModal'
import ShiftReportPanel from '@/components/ShiftReportPanel'

export default function Shifts() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    loadShifts()
  }, [])

  const loadShifts = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/shifts/')
      setShifts(data)
    } catch (err) {
      console.error('Failed to load shifts', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (shift: Shift, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedShift(shift)
    setShowEditModal(true)
  }

  const handleViewDetails = (shift: Shift) => {
    setSelectedShift(shift)
    setShowDetailModal(true)
  }

  const handleSave = async (updatedShift: Partial<Shift>) => {
    if (!selectedShift) return

    try {
      await api.patch(`/shifts/${selectedShift.id}/`, updatedShift)
      await loadShifts()
      setShowEditModal(false)
      setSelectedShift(null)
    } catch (err) {
      alert('Failed to update shift')
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      <ShiftReportPanel />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shifts Management</h1>
        <button onClick={loadShifts} className="px-4 py-2 border rounded hover:bg-gray-50">
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="spinner"></div>
          <span className="ml-3 text-gray-600">Loading shifts...</span>
        </div>
      )}

      <div className="space-y-3">
        {shifts.map((shift, idx) => (
          <div 
            key={shift.id} 
            className="card p-4 stagger-item hover:shadow-lg transition-all duration-200 cursor-pointer" 
            style={{ animationDelay: `${idx * 0.05}s` }}
            onClick={() => handleViewDetails(shift)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">Shift #{shift.id}</h3>
                  <span className={`px-2 py-1 text-xs rounded ${shift.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {shift.is_active ? 'Active' : 'Closed'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">User</div>
                    <div className="font-medium">{shift.user_name}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Opened</div>
                    <div className="font-medium">{formatDate(shift.opened_at)}</div>
                  </div>
                  {shift.closed_at && (
                    <div>
                      <div className="text-gray-600">Closed</div>
                      <div className="font-medium">{formatDate(shift.closed_at)}</div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-3 mt-4">
                  <div className="bg-blue-50 p-3 rounded transition-all duration-200 hover:bg-blue-100 hover:shadow-sm">
                    <div className="text-xs text-gray-600 mb-1">Opening Cash</div>
                    <div className="text-lg font-bold text-blue-700">{Number(shift.opening_cash).toFixed(2)} AZN</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded transition-all duration-200 hover:bg-green-100 hover:shadow-sm">
                    <div className="text-xs text-gray-600 mb-1">Total Sales</div>
                    <div className="text-lg font-bold text-green-700">{Number(shift.total_sales).toFixed(2)} AZN</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded transition-all duration-200 hover:bg-purple-100 hover:shadow-sm">
                    <div className="text-xs text-gray-600 mb-1">Cash / Card</div>
                    <div className="text-sm font-bold text-purple-700">
                      {Number(shift.cash_sales).toFixed(2)} / {Number(shift.card_sales).toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-red-50 p-3 rounded transition-all duration-200 hover:bg-red-100 hover:shadow-sm">
                    <div className="text-xs text-gray-600 mb-1">Expenses</div>
                    <div className="text-lg font-bold text-red-700">{Number(shift.total_expenses).toFixed(2)} AZN</div>
                  </div>
                </div>

                {!shift.is_active && shift.closing_cash && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="bg-yellow-50 p-3 rounded">
                      <div className="text-xs text-gray-600 mb-1">Depot Amount</div>
                      <div className="text-lg font-bold">{Number(shift.depot_amount).toFixed(2)} AZN</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <div className="text-xs text-gray-600 mb-1">Closing Cash</div>
                      <div className="text-lg font-bold">{Number(shift.closing_cash).toFixed(2)} AZN</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="ml-4 flex gap-2">
                <button
                  onClick={(e) => handleViewDetails(shift)}
                  className="p-2 border rounded hover:bg-blue-50 transition-all duration-200 hover:scale-110 hover:border-blue-500"
                  title="View details"
                >
                  <Eye size={20} className="transition-colors duration-200 hover:text-blue-600" />
                </button>
                <button
                  onClick={(e) => handleEdit(shift, e)}
                  className="p-2 border rounded hover:bg-gray-50 transition-all duration-200 hover:scale-110 hover:border-primary"
                  title="Edit shift"
                >
                  <Edit size={20} className="transition-colors duration-200 hover:text-primary" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {shifts.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-8">No shifts found</div>
      )}

      {showEditModal && selectedShift && (
        <ShiftEditModal
          shift={selectedShift}
          onClose={() => {
            setShowEditModal(false)
            setSelectedShift(null)
          }}
          onSave={handleSave}
        />
      )}

      {showDetailModal && selectedShift && (
        <ShiftDetailModal
          shift={selectedShift}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedShift(null)
          }}
        />
      )}
    </div>
  )
}
