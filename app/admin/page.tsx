'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Clock, RefreshCw, Lock, LogOut, Users, DollarSign, AlertCircle } from 'lucide-react'
import DoltsiteLogo from '@/components/DoltsiteLogo'

type Payment = {
  id: string
  referenceCode: string
  sessionId: string
  accountEmail?: string
  plan: string
  amount: string
  momoNumber: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
  note?: string
}

const PLAN_COLORS: Record<string, string> = {
  basic: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  standard: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  premium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchPayments = useCallback(async (key: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/payment/approve', {
        headers: { 'x-admin-key': key },
      })
      if (res.status === 401) { setAuthed(false); return }
      const data = await res.json()
      setPayments(data.payments || [])
    } catch {
      showToast('Failed to fetch payments', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleLogin = async () => {
    setAuthError('')
    const res = await fetch('/api/payment/approve', {
      headers: { 'x-admin-key': password },
    })
    if (res.ok) {
      setAuthed(true)
      const data = await res.json()
      setPayments(data.payments || [])
    } else {
      setAuthError('Wrong password. Try again.')
    }
  }

  const handleAction = async (paymentId: string, action: 'approve' | 'reject') => {
    setActionLoading(paymentId + action)
    try {
      const res = await fetch('/api/payment/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': password },
        body: JSON.stringify({ paymentId, action }),
      })
      const data = await res.json()
      if (res.ok) {
        showToast(data.message, 'success')
        fetchPayments(password)
      } else {
        showToast(data.error || 'Action failed', 'error')
      }
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    if (!authed) return
    const interval = setInterval(() => fetchPayments(password), 15000)
    return () => clearInterval(interval)
  }, [authed, password, fetchPayments])

  const pending = payments.filter(p => p.status === 'pending')
  const approved = payments.filter(p => p.status === 'approved')
  const rejected = payments.filter(p => p.status === 'rejected')

  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <DoltsiteLogo size={44} />
            <div>
              <h1 className="font-extrabold text-lg leading-none">Doltsite</h1>
              <p className="text-slate-400 text-xs mt-0.5">Admin · Payment Management</p>
            </div>
          </div>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 mb-3"
          />
          {authError && <p className="text-red-400 text-sm mb-3">{authError}</p>}
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-semibold rounded-lg transition-opacity"
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl font-medium shadow-xl text-sm ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <DoltsiteLogo size={34} />
          <span className="font-bold text-lg">Doltsite Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchPayments(password)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={() => { setAuthed(false); setPassword('') }}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Pending', count: pending.length, icon: <Clock className="w-5 h-5" />, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
            { label: 'Approved', count: approved.length, icon: <CheckCircle className="w-5 h-5" />, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' },
            { label: 'Rejected', count: rejected.length, icon: <XCircle className="w-5 h-5" />, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border p-4 flex items-center gap-4 ${s.bg}`}>
              <div className={s.color}>{s.icon}</div>
              <div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
                <div className="text-slate-400 text-sm">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pending — shown first and prominently */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            Pending Payments
            {pending.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-yellow-400/20 text-yellow-400 rounded-full text-xs font-bold">
                {pending.length} awaiting
              </span>
            )}
          </h2>
          {pending.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center text-slate-500">
              No pending payments right now. Page auto-refreshes every 15s.
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map(p => (
                <PaymentCard
                  key={p.id}
                  payment={p}
                  onApprove={() => handleAction(p.id, 'approve')}
                  onReject={() => handleAction(p.id, 'reject')}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          )}
        </section>

        {/* History */}
        {(approved.length > 0 || rejected.length > 0) && (
          <section>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-400" /> Payment History
            </h2>
            <div className="space-y-3">
              {[...approved, ...rejected]
                .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                .map(p => (
                  <PaymentCard key={p.id} payment={p} readOnly />
                ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

function PaymentCard({
  payment: p,
  onApprove,
  onReject,
  actionLoading,
  readOnly = false,
}: {
  payment: Payment
  onApprove?: () => void
  onReject?: () => void
  actionLoading?: string | null
  readOnly?: boolean
}) {
  const date = new Date(p.submittedAt).toLocaleString()
  const planColor = PLAN_COLORS[p.plan] || 'text-slate-400 bg-slate-400/10 border-slate-400/30'

  return (
    <div className={`bg-slate-800 border rounded-xl p-5 ${
      p.status === 'pending' ? 'border-yellow-500/30' :
      p.status === 'approved' ? 'border-green-500/20' : 'border-red-500/20'
    }`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          {/* Reference + Plan */}
          <div className="flex items-center gap-3 flex-wrap">
            <code className="font-mono text-lg font-bold text-white bg-slate-700 px-3 py-1 rounded-lg">
              {p.referenceCode}
            </code>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border capitalize ${planColor}`}>
              {p.plan}
            </span>
            <span className="text-green-400 font-bold">{p.amount}</span>
            {p.status !== 'pending' && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                p.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {p.status.toUpperCase()}
              </span>
            )}
          </div>
          {/* MoMo number */}
          <div className="text-sm text-slate-400">
            📱 MoMo: <span className="text-white font-mono">{p.momoNumber || <em className="text-slate-500">Not submitted yet</em>}</span>
          </div>
          {/* Account email */}
          {p.accountEmail && (
            <div className="text-sm text-slate-400">
              📧 Account: <span className="text-purple-300 font-mono">{p.accountEmail}</span>
            </div>
          )}
          {/* Session ID */}
          <div className="text-xs text-slate-500 font-mono">Session: {p.sessionId}</div>
          {/* Time */}
          <div className="text-xs text-slate-500">Submitted: {date}</div>
          {p.note && <div className="text-xs text-slate-400 italic">Note: {p.note}</div>}
        </div>

        {/* Actions */}
        {!readOnly && p.status === 'pending' && (
          <div className="flex gap-2">
            <button
              onClick={onApprove}
              disabled={!!actionLoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              {actionLoading === p.id + 'approve' ? 'Activating...' : 'Approve'}
            </button>
            <button
              onClick={onReject}
              disabled={!!actionLoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/40 disabled:opacity-50 text-red-400 font-semibold rounded-lg text-sm transition-colors"
            >
              <XCircle className="w-4 h-4" />
              {actionLoading === p.id + 'reject' ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
