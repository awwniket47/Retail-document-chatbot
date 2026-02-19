import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, User, ArrowRight, Sparkles, FileText, Bot } from 'lucide-react'

export default function LoginPage() {
  const { login, signup, continueAsGuest } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await signup(email, password, name)
      }
      navigate('/chat')
    } catch (err) {
      setError(
        err.message?.replace('Firebase: ', '').replace(/\(auth.*\)/, '') ||
          'Authentication failed'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleGuest = () => {
    continueAsGuest()
    navigate('/chat')
  }

  return (
<div className="min-h-screen bg-gradient-to-br from-[#0B1C2D] via-[#0F2A40] to-[#0A1623] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Animated Gradient Glow */}
      <div className="absolute w-[700px] h-[700px] bg-purple-600/10 rounded-full blur-[150px] animate-pulse top-1/4 left-1/2 -translate-x-1/2" />

      <div className="w-full max-w-md relative animate-fade-in">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <Bot size={20} className="text-white" />
            </div>
            <span className="text-white font-semibold text-xl tracking-tight">
              Retail Document Intelligence
            </span>
          </div>

          <p className="text-gray-400 text-sm">
            AI-powered insights from retail documents
          </p>

          <div className="flex justify-center gap-6 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <FileText size={14} /> Smart Parsing
            </div>
            <div className="flex items-center gap-1">
              <Sparkles size={14} /> Context Q&A
            </div>
            <div className="flex items-center gap-1">
              <Bot size={14} /> Retail AI
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-2xl p-7">

          <form onSubmit={handleSubmit} className="space-y-4">

            {mode === 'signup' && (
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  placeholder="Display name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition shadow-lg"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In to Dashboard' : 'Create Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-500 text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            onClick={handleGuest}
            className="w-full border border-white/10 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl transition"
          >
            Explore as Guest
          </button>
        </div>

        {/* Toggle */}
        <p className="text-center text-gray-400 text-sm mt-5">
          {mode === 'login'
            ? "Don't have an account? "
            : 'Already have an account? '}
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setError('')
            }}
            className="text-purple-400 hover:text-purple-300 transition"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
