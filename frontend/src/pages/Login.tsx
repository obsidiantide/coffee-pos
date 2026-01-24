import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/store/auth'
import { Coffee, Lock, User } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(username, password)
      const role = useAuth.getState().user?.role
      navigate(role === 'admin' ? '/admin' : '/pos', { replace: true })
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ background: '#6B4423' }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ background: '#8B6F47', animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ background: '#E0E0E0', animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8 animate-bounceIn">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-lg" style={{ background: '#6B4423' }}>
            <Coffee size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#2C2C2C' }}>Coffee POS</h1>
          <p style={{ color: '#757575' }}>Welcome back! Please sign in to continue</p>
        </div>

        {/* Login Form */}
        <form onSubmit={onSubmit} className="card p-8 space-y-6 animate-slideInUp shadow-2xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold gradient-text">Sign In</h2>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded animate-fadeIn">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg transition-all duration-200" 
                  style={{ outline: 'none' }}
                  onFocus={(e) => e.target.style.borderColor = '#6B4423'}
                  onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                  placeholder="Enter your username"
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="password" 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg transition-all duration-200" 
                  style={{ outline: 'none' }}
                  onFocus={(e) => e.target.style.borderColor = '#6B4423'}
                  onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                  placeholder="Enter your password"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>
          </div>

          <button 
            className="button w-full py-4 text-lg hover-glow" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="spinner"></div>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-white/60 text-sm mt-6 animate-fadeIn">Powered by Coffee POS System</p>
      </div>
    </div>
  )
}
