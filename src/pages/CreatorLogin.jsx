import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { creatorAuthClient } from '@/lib/creatorAuth'

export default function CreatorLogin() {
  const navigate  = useNavigate()
  const [email,   setEmail]   = useState('')
  const [password, setPassword] = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: authError } = await creatorAuthClient.signIn.email({ email, password })
      if (authError) {
        setError(authError.message ?? 'Invalid email or password')
      } else {
        navigate('/portal')
      }
    } catch (e) {
      setError(e?.message ?? 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D10] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center shadow-[0_0_20px_rgba(108,92,231,.5)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="font-syne text-[20px] font-extrabold text-white tracking-tight">Creator Engine</span>
        </div>

        <div className="bg-[#111116] border border-white/[0.07] rounded-2xl shadow-2xl p-6">
          <div className="mb-5">
            <h1 className="font-syne text-[18px] font-bold text-white">Creator Portal</h1>
            <p className="text-[12px] text-white/30 mt-0.5">Sign in to view your profile and tasks</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@email.com"
                className="w-full bg-[#1A1A22] border border-white/[0.07] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-[#1A1A22] border border-white/[0.07] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
              />
            </div>

            {error && (
              <div className="text-[12px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold transition-all shadow-[0_0_20px_rgba(108,92,231,.35)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-white/15 mt-4 font-mono">
          Staff?{' '}
          <a href="/internal" className="text-white/25 hover:text-white/50 underline transition-colors">
            Internal login →
          </a>
        </p>
      </div>
    </div>
  )
}
