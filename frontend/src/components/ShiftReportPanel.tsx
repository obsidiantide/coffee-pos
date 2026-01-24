import { useState } from 'react'
import { api } from '@/lib/api'
import { Calendar, TrendingUp, DollarSign, Download } from 'lucide-react'

interface ReportData {
  total_shifts: number
  total_sales: number
  cash_sales: number
  card_sales: number
  total_expenses: number
  total_depot: number
  opening_cash: number
  closing_cash: number
  net_profit: number
}

export default function ShiftReportPanel() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)

  const generateReport = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.get('/shifts/period-report/', {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      })
      setReport(data)
    } catch (err) {
      console.error('Failed to generate report', err)
      alert('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-6 space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Calendar size={24} className="text-primary" />
          Period Report
        </h2>
      </div>

      {/* Date Selection */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border rounded px-3 py-2 transition-all duration-200 focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border rounded px-3 py-2 transition-all duration-200 focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={generateReport}
            disabled={loading}
            className="button w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="spinner"></div>
                Loading...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Download size={18} />
                Generate Report
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Report Display */}
      {report && (
        <div className="mt-6 space-y-4 animate-fadeInScale">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={20} className="text-blue-600" />
              <h3 className="text-lg font-semibold">Summary</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Shifts:</span>
                <span className="font-bold">{report.total_shifts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Period:</span>
                <span className="font-medium">{new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 transition-all duration-200 hover:shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={16} className="text-green-600" />
                <div className="text-xs text-gray-600">Total Sales</div>
              </div>
              <div className="text-2xl font-bold text-green-700">{report.total_sales.toFixed(2)} AZN</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 transition-all duration-200 hover:shadow-md">
              <div className="text-xs text-gray-600 mb-2">Cash Sales</div>
              <div className="text-xl font-bold text-blue-700">{report.cash_sales.toFixed(2)} AZN</div>
              <div className="text-xs text-gray-500 mt-1">
                {report.total_sales > 0 ? ((report.cash_sales / report.total_sales) * 100).toFixed(1) : 0}%
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 transition-all duration-200 hover:shadow-md">
              <div className="text-xs text-gray-600 mb-2">Card Sales</div>
              <div className="text-xl font-bold text-purple-700">{report.card_sales.toFixed(2)} AZN</div>
              <div className="text-xs text-gray-500 mt-1">
                {report.total_sales > 0 ? ((report.card_sales / report.total_sales) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-xs text-gray-600 mb-2">Total Expenses</div>
              <div className="text-xl font-bold text-red-700">{report.total_expenses.toFixed(2)} AZN</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="text-xs text-gray-600 mb-2">Total Depot</div>
              <div className="text-xl font-bold text-yellow-700">{report.total_depot.toFixed(2)} AZN</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-100 to-blue-100 p-5 rounded-lg border-2 border-green-300">
            <h3 className="text-lg font-semibold mb-3">Financial Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Opening Cash (First Shift):</span>
                <span className="font-medium">{report.opening_cash.toFixed(2)} AZN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Total Revenue:</span>
                <span className="font-medium text-green-600">+{report.total_sales.toFixed(2)} AZN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Total Expenses:</span>
                <span className="font-medium text-red-600">-{report.total_expenses.toFixed(2)} AZN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Total Depot:</span>
                <span className="font-medium text-yellow-600">-{report.total_depot.toFixed(2)} AZN</span>
              </div>
              <div className="border-t-2 border-gray-400 pt-2 mt-2 flex justify-between">
                <span className="font-bold text-lg">Net Profit:</span>
                <span className={`font-bold text-2xl ${report.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {report.net_profit >= 0 ? '+' : ''}{report.net_profit.toFixed(2)} AZN
                </span>
              </div>
              {report.closing_cash !== undefined && (
                <div className="flex justify-between bg-white/50 px-3 py-2 rounded">
                  <span className="font-semibold">Closing Cash (Last Shift):</span>
                  <span className="font-bold">{report.closing_cash.toFixed(2)} AZN</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
