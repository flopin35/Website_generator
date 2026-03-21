'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles, Download, Eye, Zap, LogIn, LogOut, User, ChevronDown } from 'lucide-react'
import DoltsiteLogo from '@/components/DoltsiteLogo'
import DescriptionInput from '@/components/PromptInput'
import PreviewWindow from '@/components/PreviewWindow'
import LoadingSpinner from '@/components/LoadingSpinner'
import PaymentFlow from '@/components/PaymentFlow'
import AuthModal, { type AccountInfo } from '@/components/AuthModal'

const FREE_LIMIT = 2

function getSessionId() {
  if (typeof window === 'undefined') return 'ssr'
  let id = localStorage.getItem('doltsite-session')
  if (!id) {
    id = 'sess-' + Math.random().toString(36).slice(2) + Date.now()
    localStorage.setItem('doltsite-session', id)
  }
  return id
}

/** Auto-enhance short inputs: "restaurant" → "Create a modern website for restaurant" */
function enhanceDescription(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return trimmed
  const alreadyStartsWithCreate = /^create\b/i.test(trimmed)
  if (alreadyStartsWithCreate || trimmed.length > 40) return trimmed
  return `Create a modern website for ${trimmed}`
}

export default function Home() {
  const [description, setDescription] = useState<string>('')
  const [generatedHtml, setGeneratedHtml] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [showPricing, setShowPricing] = useState(false)
  const [pricingReason, setPricingReason] = useState<'limit' | 'expired'>('limit')
  const [usage, setUsage] = useState(0)
  const [tier, setTier] = useState<string>('free')
  const [account, setAccount] = useState<AccountInfo | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const sessionId = useRef<string>('')

  useEffect(() => {
    sessionId.current = getSessionId()
    // Check if already logged in
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.account) {
          setAccount(data.account)
          setTier(data.account.tier ?? 'free')
          setUsage(data.account.usage ?? 0)
          if (data.account.expired) { setPricingReason('expired'); setShowPricing(true) }
        } else {
          // Fall back to session-based usage
          fetch('/api/usage', { headers: { 'x-session-id': sessionId.current } })
            .then(r => r.json())
            .then(d => {
              setUsage(d.usage ?? 0)
              setTier(d.tier ?? 'free')
              if (d.expired) { setPricingReason('expired'); setShowPricing(true) }
            })
            .catch(() => {})
        }
      })
      .catch(() => {})
  }, [])

  const handleAuthSuccess = (acc: AccountInfo) => {
    setAccount(acc)
    setTier(acc.tier ?? 'free')
    setUsage(acc.usage ?? 0)
    setShowAuth(false)
    setShowAccountMenu(false)
    // Sync full account state from server (picks up usage, expiry, etc.)
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.account) {
          setAccount(d.account)
          setTier(d.account.tier ?? 'free')
          setUsage(d.account.usage ?? 0)
        }
      })
      .catch(() => {})
  }

  const handleLogout = async () => {
    await fetch('/api/auth/me', { method: 'POST' }) // clears cookie
    setAccount(null)
    setTier('free')
    setUsage(0)
    setShowAccountMenu(false)
    // Refresh session usage
    fetch('/api/usage', { headers: { 'x-session-id': sessionId.current } })
      .then(r => r.json())
      .then(d => { setUsage(d.usage ?? 0); setTier(d.tier ?? 'free') })
      .catch(() => {})
  }

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please enter what you want to create')
      return
    }

    // Require account before even calling the API
    if (!account) {
      setAuthMode('signup')
      setShowAuth(true)
      return
    }

    const enhancedDescription = enhanceDescription(description)
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId.current,
        },
        body: JSON.stringify({ description: enhancedDescription }),
      })

      const data = await response.json()

      if (response.status === 401) {
        // Session expired or cookie cleared — show login modal
        setAuthMode('login')
        setShowAuth(true)
        return
      }

      if (response.status === 403) {
        setPricingReason(data.error === 'subscription_expired' ? 'expired' : 'limit')
        setShowPricing(true)
        return
      }

      if (!response.ok) throw new Error(data.error || 'Failed to generate website')

      setGeneratedHtml(data.html)
      setUsage(data.usage ?? usage + 1)
      setTier(data.tier ?? tier)

      // Refresh account state if logged in
      if (account) {
        fetch('/api/auth/me').then(r => r.json()).then(d => {
          if (d.account) { setAccount(d.account); setUsage(d.account.usage ?? 0) }
        }).catch(() => {})
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!generatedHtml) { setError('No website to download. Generate one first!'); return }
    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      zip.file('index.html', generatedHtml)
      const readme = [
        '# Generated Website',
        '',
        'Generated using Doltsite — AI Website Builder',
        '',
        '## Getting Started',
        '1. Open `index.html` in your browser',
        '2. Customize as needed',
        '',
        'For more information, visit Doltsite',
      ].join('\n')
      zip.file('README.md', readme)
      const blob = await zip.generateAsync({ type: 'blob' })

      // Use a native anchor download — no file-saver dependency needed
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'doltsite-website.zip'
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)
    } catch (err) {
      console.error('Download error:', err)
      setError('Failed to download website. Please try again.')
    }
  }

  const isFree = tier === 'free'
  const remaining = isFree ? Math.max(0, FREE_LIMIT - usage) : null

  return (
    <div className="min-h-screen">
      {showPricing && <PaymentFlow onClose={() => setShowPricing(false)} sessionId={sessionId.current} reason={pricingReason} />}
      {showAuth && <AuthModal initialMode={authMode} onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />}

      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DoltsiteLogo size={42} />
              <div>
                <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent leading-none">
                  Doltsite
                </h1>
                <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase leading-none mt-0.5">AI Website Builder</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Usage badge */}
              {isFree && (
                <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${remaining === 0 ? 'bg-red-500/10 border-red-500/40 text-red-400' : 'bg-slate-700 border-slate-600 text-slate-300'}`}>
                  <Zap className="w-3 h-3" />
                  {remaining} free left
                </div>
              )}
              {!isFree && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-purple-500/10 border-purple-500/40 text-purple-300">
                  <Sparkles className="w-3 h-3" /> {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
                </div>
              )}

              {/* Account menu or login buttons */}
              {account ? (
                <div className="relative">
                  <button
                    onClick={() => setShowAccountMenu(!showAccountMenu)}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                      {account.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline max-w-[100px] truncate">{account.name}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                  {showAccountMenu && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                      <div className="p-4 border-b border-slate-700">
                        <p className="font-semibold text-white truncate">{account.name}</p>
                        <p className="text-xs text-slate-400 truncate">{account.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border capitalize ${
                            tier === 'free' ? 'bg-slate-600/40 border-slate-500/40 text-slate-300' :
                            tier === 'basic' ? 'bg-blue-500/10 border-blue-500/40 text-blue-400' :
                            tier === 'standard' ? 'bg-purple-500/10 border-purple-500/40 text-purple-400' :
                            'bg-yellow-500/10 border-yellow-500/40 text-yellow-400'
                          }`}>
                            {tier} Plan
                          </span>
                          {account.expires && (
                            <span className="text-xs text-slate-500">
                              Expires {new Date(account.expires).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => { setShowAccountMenu(false); setPricingReason('limit'); setShowPricing(true) }}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-purple-400 hover:bg-purple-500/10 transition-colors flex items-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" /> Upgrade Plan
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" /> Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={() => { setAuthMode('login'); setShowAuth(true) }}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg transition-colors"
                  >
                    <LogIn className="w-4 h-4" /> Log In
                  </button>
                  <button
                    onClick={() => { setAuthMode('signup'); setShowAuth(true) }}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-white bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" /> Sign Up
                  </button>
                </>
              )}

              <button
                onClick={() => { setPricingReason('limit'); setShowPricing(true) }}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-semibold rounded-lg transition-all"
              >
                Upgrade 🚀
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-5">
            <DoltsiteLogo size={56} />
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-3 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Turn your idea into a website
          </h2>
          <p className="text-lg text-slate-400 mb-2 max-w-xl mx-auto">
            in seconds — no design skills needed.
          </p>
          {isFree && remaining !== null && remaining > 0 && account && (
            <p className="text-sm text-yellow-400 mt-3">
              ⚡ {remaining} free generation{remaining !== 1 ? 's' : ''} remaining —{' '}
              <button onClick={() => setShowPricing(true)} className="underline hover:text-yellow-300">Upgrade for unlimited</button>
            </p>
          )}
          {isFree && remaining === 0 && account && (
            <p className="text-sm text-red-400 mt-3">
              🚫 Free limit reached —{' '}
              <button onClick={() => setShowPricing(true)} className="underline hover:text-red-300">Upgrade to continue</button>
            </p>
          )}
          {!account && (
            <p className="text-sm text-slate-400 mt-3">
              🔒 Free account required —{' '}
              <button onClick={() => { setAuthMode('signup'); setShowAuth(true) }} className="text-purple-400 hover:text-purple-300 underline font-semibold">Sign up free</button>
              {' '}or{' '}
              <button onClick={() => { setAuthMode('login'); setShowAuth(true) }} className="text-purple-400 hover:text-purple-300 underline font-semibold">log in</button>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 sticky top-24">

              {/* Magic feel label */}
              <div className="mb-4">
                <p className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  What do you want to create?
                </p>
                <p className="text-xs text-slate-500 mt-1">AI will pick the best layout for you</p>
              </div>

              <DescriptionInput value={description} onChange={setDescription} onSubmit={handleGenerate} />

              <button
                onClick={handleGenerate}
                disabled={loading || !description.trim()}
                className={`w-full mt-5 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-base ${
                  account
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                    : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-purple-600 hover:to-pink-600'
                }`}
              >
                {loading
                  ? (<><LoadingSpinner />Generating...</>)
                  : account
                    ? (<><Zap className="w-5 h-5" />🚀 Generate Instantly</>)
                    : (<><LogIn className="w-5 h-5" />Sign Up to Generate</>)
                }
              </button>

              {!account && (
                <p className="text-center text-xs text-slate-500 mt-2">
                  Free account required ·{' '}
                  <button onClick={() => { setAuthMode('signup'); setShowAuth(true) }} className="text-purple-400 hover:text-purple-300 font-semibold">
                    Sign up free →
                  </button>
                </p>
              )}

              {generatedHtml && (
                <button
                  onClick={handleDownload}
                  className="w-full mt-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download ZIP
                </button>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                  ⚠️ {error}
                </div>
              )}

              {/* Mini pricing teaser */}
              <div className="mt-6 p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
                <p className="text-xs font-semibold text-purple-300 mb-2">🚀 Unlock Full Access</p>
                <div className="space-y-1 text-xs text-slate-400">
                  <div className="flex justify-between"><span>Basic</span><span className="text-white font-medium">20 GHS/month · 3/day</span></div>
                  <div className="flex justify-between"><span>Standard</span><span className="text-white font-medium">100 GHS/month</span></div>
                  <div className="flex justify-between"><span>Premium</span><span className="text-white font-medium">250 GHS/month</span></div>
                </div>
                <button
                  onClick={() => setShowPricing(true)}
                  className="mt-3 w-full py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  View Plans →
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:col-span-2">
            {generatedHtml ? (
              <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <div className="bg-slate-700 px-6 py-3 flex items-center gap-2 border-b border-slate-700">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <h3 className="font-semibold">Live Preview</h3>
                </div>
                <PreviewWindow html={generatedHtml} />
              </div>
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 flex flex-col items-center justify-center min-h-96 text-center">
                <Sparkles className="w-16 h-16 text-slate-600 mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-slate-400 mb-2">Your website will appear here</h3>
                <p className="text-slate-500 text-sm max-w-xs">
                  Type what you want to create and click <span className="text-purple-400 font-semibold">🚀 Generate Instantly</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Upgrade Button */}
      <button
        onClick={() => { setPricingReason('limit'); setShowPricing(true) }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-full shadow-xl shadow-purple-500/40 transition-all hover:scale-105"
      >
        <Sparkles className="w-5 h-5" />
        <span className="hidden sm:inline">Upgrade Plan</span>
      </button>
    </div>
  )
}
