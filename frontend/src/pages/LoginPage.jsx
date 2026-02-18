import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const { login, signup, continueAsGuest } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode]       = useState('login') // 'login' | 'signup'
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]       = useState('')
  const [error, setError]     = useState('')
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
      setError(err.message?.replace('Firebase: ', '').replace(/\(auth.*\)/, '') || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGuest = () => {
    continueAsGuest()
    navigate('/chat')
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-sm relative animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
              <Sparkles size={18} className="text-accent" />
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">Retail Doc Intel</span>
          </div>
          <p className="text-white/40 text-sm">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  className="input-field pl-10"
                  placeholder="Display name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            )}

            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                className="input-field pl-10"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="password"
                className="input-field pl-10"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-red-400/90 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 mt-1"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign in' : 'Create account'}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-white/20 text-xs">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={handleGuest}
            className="btn-ghost w-full flex items-center justify-center gap-2 py-2.5 border border-border"
          >
            Continue as Guest
          </button>
        </div>

        {/* Toggle */}
        <p className="text-center text-white/30 text-sm mt-4">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            className="text-accent hover:text-accent-light transition-colors"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
