'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Eye, EyeOff, Loader2, User, Mail, Lock, Sparkles, ArrowRight, CheckCircle } from 'lucide-react'

interface AuthModalProps {
  onClose: () => void
  onSuccess: (account: AccountInfo) => void
  initialMode?: 'login' | 'signup'
}

export type AccountInfo = {
  id: string
  email: string
  name: string
  tier: string
  expires: string | null
  usage: number
  dailyUsage: number
}

const BENEFITS = [
  'Your plan follows you on any device',
  'Never lose your generation history',
  'Upgrade once — access everywhere',
]

export default function AuthModal({ onClose, onSuccess, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const firstInputRef = useRef<HTMLInputElement>(null)

  // Focus first input on open / mode change
  useEffect(() => {
    const t = setTimeout(() => firstInputRef.current?.focus(), 80)
    return () => clearTimeout(t)
  }, [mode])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const switchMode = () => {
    setMode(m => m === 'login' ? 'signup' : 'login')
    setError('')
    setName('')
    setEmail('')
    setPassword('')
  }

  const handleSubmit = async () => {
    setError('')
    if (mode === 'signup' && !name.trim()) { setError('Please enter your name'); return }
    if (!email.trim()) { setError('Please enter your email'); return }
    if (!password) { setError('Please enter your password'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }

    setLoading(true)
    let succeeded = false
    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, name: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); return }

      succeeded = true
      setSuccess(true)
      setTimeout(() => onSuccess(data.account), 800)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      // Only clear loading if we didn't succeed (keep spinner during success animation)
      if (!succeeded) setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-md animate-slide-up"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1a1035 50%, #0f172a 100%)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          borderRadius: '1.5rem',
          boxShadow: '0 25px 80px rgba(139, 92, 246, 0.2), 0 0 0 1px rgba(255,255,255,0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Glow bar at top */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, #a855f7, #ec4899, transparent)',
        }} />

        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '200px', height: '200px',
          background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all duration-150"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-8 pt-8 pb-6">

          {/* ── Header ── */}
          <div className="text-center mb-7">
            <div className="relative inline-flex mb-4">
              <div style={{
                width: '60px', height: '60px',
                background: 'linear-gradient(135deg, #7c3aed, #db2777)',
                borderRadius: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
              }}>
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div style={{
                position: 'absolute', inset: '-4px',
                background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(219,39,119,0.3))',
                borderRadius: '1.2rem', zIndex: -1, filter: 'blur(8px)',
              }} />
            </div>

            <h2 className="text-2xl font-extrabold text-white mb-1">
              {mode === 'login' ? 'Welcome back 👋' : 'Create your account'}
            </h2>
            <p className="text-sm text-slate-400">
              {mode === 'login'
                ? 'Log in to access your plan and creations'
                : 'Free to sign up — your plan follows you everywhere'}
            </p>
          </div>

          {/* ── Success State ── */}
          {success ? (
            <div className="text-center py-8">
              <div style={{
                width: '64px', height: '64px',
                background: 'rgba(34,197,94,0.15)',
                border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem',
              }}>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-white font-semibold text-lg">
                {mode === 'login' ? 'Logged in!' : 'Account created!'}
              </p>
              <p className="text-slate-400 text-sm mt-1">Taking you in...</p>
            </div>
          ) : (
            <>
              {/* ── Form ── */}
              <div className="space-y-3">

                {/* Name field — signup only */}
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 ml-1 uppercase tracking-wide">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <input
                        ref={mode === 'signup' ? firstInputRef : undefined}
                        type="text"
                        placeholder="e.g. Kofi Mensah"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        style={{
                          width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem',
                          paddingTop: '0.75rem', paddingBottom: '0.75rem',
                          background: 'rgba(30, 41, 59, 0.8)',
                          border: '1px solid rgba(100, 116, 139, 0.4)',
                          borderRadius: '0.75rem', color: 'white', fontSize: '0.9rem',
                          outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                        }}
                        onFocus={e => {
                          e.target.style.borderColor = 'rgba(168,85,247,0.7)'
                          e.target.style.boxShadow = '0 0 0 3px rgba(168,85,247,0.12)'
                        }}
                        onBlur={e => {
                          e.target.style.borderColor = 'rgba(100, 116, 139, 0.4)'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 ml-1 uppercase tracking-wide">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      ref={mode === 'login' ? firstInputRef : undefined}
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      style={{
                        width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem',
                        paddingTop: '0.75rem', paddingBottom: '0.75rem',
                        background: 'rgba(30, 41, 59, 0.8)',
                        border: '1px solid rgba(100, 116, 139, 0.4)',
                        borderRadius: '0.75rem', color: 'white', fontSize: '0.9rem',
                        outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = 'rgba(168,85,247,0.7)'
                        e.target.style.boxShadow = '0 0 0 3px rgba(168,85,247,0.12)'
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = 'rgba(100, 116, 139, 0.4)'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 ml-1 uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder={mode === 'signup' ? 'Min 6 characters' : 'Your password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      style={{
                        width: '100%', paddingLeft: '2.5rem', paddingRight: '3rem',
                        paddingTop: '0.75rem', paddingBottom: '0.75rem',
                        background: 'rgba(30, 41, 59, 0.8)',
                        border: '1px solid rgba(100, 116, 139, 0.4)',
                        borderRadius: '0.75rem', color: 'white', fontSize: '0.9rem',
                        outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = 'rgba(168,85,247,0.7)'
                        e.target.style.boxShadow = '0 0 0 3px rgba(168,85,247,0.12)'
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = 'rgba(100, 116, 139, 0.4)'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '0.75rem',
                    color: '#fca5a5',
                    fontSize: '0.85rem',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}>
                    ⚠️ {error}
                  </div>
                )}

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    width: '100%', padding: '0.875rem',
                    background: loading ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg, #7c3aed, #db2777)',
                    border: 'none', borderRadius: '0.875rem',
                    color: 'white', fontWeight: 700, fontSize: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.35)',
                    transition: 'all 0.2s', marginTop: '0.5rem',
                  }}
                  onMouseOver={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' }}
                  onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)' }}
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> {mode === 'login' ? 'Logging in...' : 'Creating account...'}</>
                  ) : (
                    <>{mode === 'login' ? 'Log In' : 'Create Account'} <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>

              {/* ── Benefits (signup only) ── */}
              {mode === 'signup' && (
                <div style={{
                  marginTop: '1.25rem', padding: '0.875rem 1rem',
                  background: 'rgba(139,92,246,0.07)',
                  border: '1px solid rgba(139,92,246,0.15)',
                  borderRadius: '0.875rem',
                }}>
                  <div className="space-y-1.5">
                    {BENEFITS.map(b => (
                      <div key={b} className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        {b}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Switch mode ── */}
              <div style={{
                marginTop: '1.25rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid rgba(100,116,139,0.2)',
                textAlign: 'center',
              }}>
                <span className="text-slate-500 text-sm">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                </span>
                <button
                  onClick={switchMode}
                  className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {mode === 'login' ? 'Sign Up Free →' : 'Log In →'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
