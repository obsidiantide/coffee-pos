import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/store/auth'
import { Coffee, ShoppingCart, Calendar, LayoutGrid, FileText, Clock, LogOut } from 'lucide-react'
import Login from '@/pages/Login'
import Pos from '@/pages/Pos'
import TodaysOrders from '@/pages/TodaysOrders'
import LoadingSpinner from '@/components/LoadingSpinner'

const AdminMenu = lazy(() => import('@/pages/admin/Menu'))
const AdminOrders = lazy(() => import('@/pages/admin/Orders'))
const AdminReports = lazy(() => import('@/pages/admin/Reports'))
const AdminShifts = lazy(() => import('@/pages/admin/Shifts'))

function Protected({ children, role }: { children: JSX.Element; role?: 'barista' | 'admin' }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/pos'} replace />
  return children
}

function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="w-full bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={user?.role === 'admin' ? '/admin' : '/pos'} className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300" style={{ background: '#6B4423' }}>
              <Coffee className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold gradient-text">Coffee POS</span>
          </Link>

          {/* Navigation Links */}
          {user?.role === 'barista' && (
            <div className="flex gap-2">
              <Link 
                to="/pos" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive('/pos') 
                    ? 'text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={isActive('/pos') ? { background: '#6B4423' } : {}}
              >
                <ShoppingCart size={18} />
                POS
              </Link>
              <Link 
                to="/orders" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive('/orders') 
                    ? 'text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={isActive('/orders') ? { background: '#6B4423' } : {}}
              >
                <Calendar size={18} />
                Today
              </Link>
            </div>
          )}

          {user?.role === 'admin' && (
            <div className="flex gap-2">
              <Link 
                to="/admin" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive('/admin') 
                    ? 'text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={isActive('/admin') ? { background: '#6B4423' } : {}}
              >
                <LayoutGrid size={18} />
                Menu
              </Link>
              <Link 
                to="/admin/orders" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive('/admin/orders') 
                    ? 'text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={isActive('/admin/orders') ? { background: '#6B4423' } : {}}
              >
                <ShoppingCart size={18} />
                Orders
              </Link>
              <Link 
                to="/admin/shifts" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive('/admin/shifts') 
                    ? 'text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={isActive('/admin/shifts') ? { background: '#6B4423' } : {}}
              >
                <Clock size={18} />
                Shifts
              </Link>
              <Link 
                to="/admin/reports" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive('/admin/reports') 
                    ? 'text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={isActive('/admin/reports') ? { background: '#6B4423' } : {}}
              >
                <FileText size={18} />
                Reports
              </Link>
            </div>
          )}

          {/* User Info & Logout */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="px-4 py-2 rounded-lg border" style={{ background: '#F5F5F5', borderColor: '#E0E0E0' }}>
                  <span className="text-sm font-medium" style={{ color: '#2C2C2C' }}>{user.username}</span>
                  <span className="text-xs ml-2" style={{ color: '#757575' }}>· {user.role}</span>
                </div>
                <button 
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200" 
                  onClick={async () => { await logout(); navigate('/login') }}
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="button">Login</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { user } = useAuth()
  useEffect(() => {}, [user])
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/pos'} replace /> : <Navigate to="/login" replace />} />
          <Route path="/pos" element={<Protected role="barista"><Pos /></Protected>} />
          <Route path="/orders" element={<Protected role="barista"><TodaysOrders /></Protected>} />
          <Route path="/admin" element={<Protected role="admin"><AdminMenu /></Protected>} />
          <Route path="/admin/orders" element={<Protected role="admin"><AdminOrders /></Protected>} />
          <Route path="/admin/shifts" element={<Protected role="admin"><AdminShifts /></Protected>} />
          <Route path="/admin/reports" element={<Protected role="admin"><AdminReports /></Protected>} />
        </Routes>
        </Suspense>
      </div>
    </div>
  )
}
