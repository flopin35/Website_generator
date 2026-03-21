'use client'

import { useState } from 'react'
import { X, Copy, CheckCircle, Loader2, Zap, Star, Crown, ArrowRight, Phone } from 'lucide-react'

interface PaymentFlowProps {
  onClose: () => void
  sessionId: string
  reason?: 'limit' | 'expired'
}

const MOMO_NUMBER = '0509002402'
const MOMO_NETWORK = 'Telecel'

const PLANS = [
  {
    id: 'basic',
    icon: <Zap className="w-5 h-5" />,
    name: 'Basic',
    price: '20 GHS',
    period: '/ month',
    color: 'from-blue-500 to-cyan-500',
    border: 'border-blue-500/40',
    ring: 'ring-blue-500/30',
    features: ['3 website generations/day', 'All templates', 'ZIP download'],
  },
  {
    id: 'standard',
    icon: <Star className="w-5 h-5" />,
    name: 'Standard',
    price: '100 GHS',
    period: '/ month',
    color: 'from-purple-500 to-pink-500',
    border: 'border-purple-500/60',
    ring: 'ring-purple-500/40',
    popular: true,
    features: ['200 generations/month', 'All templates', 'ZIP download', 'Priority support'],
  },
  {
    id: 'premium',
    icon: <Crown className="w-5 h-5" />,
    name: 'Premium',
    price: '250 GHS',
    period: '/ month',
    color: 'from-yellow-500 to-orange-500',
    border: 'border-yellow-500/40',
    ring: 'ring-yellow-500/30',
    features: ['Unlimited generations', 'All templates', 'ZIP download', 'Priority support', 'Direct consultation'],
  },
]

type Step = 'select' | 'pay' | 'done'

export default function PaymentFlow({ onClose, sessionId, reason = 'limit' }: PaymentFlowProps) {
  const [step, setStep] = useState<Step>('select')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [referenceCode, setReferenceCode] = useState('')
  const [amount, setAmount] = useState('')
  const [momoNumber, setMomoNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId)
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, plan: planId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to initiate payment')
      setReferenceCode(data.referenceCode)
      setAmount(data.amount)
      setStep('pay')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!momoNumber.trim()) { setError('Please enter your MoMo number'); return }
    if (momoNumber.trim().length < 10) { setError('Please enter a valid MoMo number (at least 10 digits)'); return }
    setSubmitLoading(true)
    setError('')
    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referenceCode, momoNumber: momoNumber.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit. Please try again.')
      setStep('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const stepIndex = { select: 0, pay: 1, done: 2 }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors z-10">
          <X className="w-5 h-5" />
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-6 pt-6 pb-0">
          {(['select', 'pay', 'done'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s ? 'bg-purple-500 text-white' :
                stepIndex[step] > i ? 'bg-green-500 text-white' :
                'bg-slate-700 text-slate-400'
              }`}>
                {stepIndex[step] > i ? '✓' : i + 1}
              </div>
              {i < 2 && <div className={`h-px w-8 transition-all ${stepIndex[step] > i ? 'bg-green-500' : 'bg-slate-700'}`} />}
            </div>
          ))}
          <span className="ml-2 text-xs text-slate-400">
            {step === 'select' ? 'Choose Plan' : step === 'pay' ? 'Send & Confirm' : 'Submitted'}
          </span>
        </div>

        <div className="p-6">

          {/* ── STEP 1: Choose Plan ── */}
          {step === 'select' && (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-1">Unlock Full Access 🚀</h2>
                <p className="text-slate-400 text-sm">
                  {reason === 'expired'
                    ? 'Your plan expired. Renew to continue.'
                    : "You've used your free generations. Upgrade to keep going."}
                </p>
                <p className="text-xs text-green-400 mt-1">⚡ Activated within 30 minutes after confirmation</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {PLANS.map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loading}
                    className={`relative text-left rounded-xl border-2 ${plan.border} bg-slate-800/60 p-5 flex flex-col gap-3 hover:ring-2 ${plan.ring} transition-all disabled:opacity-50 cursor-pointer`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold text-white whitespace-nowrap">
                        Most Popular
                      </div>
                    )}
                    <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${plan.color} w-fit text-white`}>
                      {plan.icon}
                    </div>
                    <div>
                      <div className="font-bold">{plan.name}</div>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-xl font-extrabold">{plan.price}</span>
                        <span className="text-slate-400 text-xs">{plan.period}</span>
                      </div>
                    </div>
                    <ul className="space-y-1 flex-1">
                      {plan.features.map(f => (
                        <li key={f} className="text-xs text-slate-300 flex gap-1.5">
                          <span className="text-green-400 shrink-0">✓</span>{f}
                        </li>
                      ))}
                    </ul>
                    <div className={`flex items-center justify-center gap-1 py-2 rounded-lg bg-gradient-to-r ${plan.color} text-white text-sm font-semibold`}>
                      {loading && selectedPlan === plan.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <><ArrowRight className="w-4 h-4" /> Select Plan</>}
                    </div>
                  </button>
                ))}
              </div>
              {error && <p className="mt-4 text-red-400 text-sm text-center">⚠️ {error}</p>}
            </>
          )}

          {/* ── STEP 2: Send Payment + Enter MoMo number ── */}
          {step === 'pay' && (
            <>
              <h2 className="text-xl font-bold mb-1">Send & Confirm Payment</h2>
              <p className="text-slate-400 text-sm mb-5">Complete both steps below, then click Submit</p>

              <div className="space-y-4">

                {/* A — Send MoMo */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                    <span className="font-semibold">Send <span className="text-green-400 font-bold">{amount}</span> via MoMo ({MOMO_NETWORK})</span>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-700 rounded-lg px-4 py-3">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-mono text-white flex-1 text-lg font-bold">{MOMO_NUMBER}</span>
                    <button
                      onClick={() => copyToClipboard(MOMO_NUMBER, 'momo')}
                      className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 shrink-0"
                    >
                      {copied === 'momo' ? <><CheckCircle className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Network: <span className="text-slate-300">{MOMO_NETWORK}</span></p>
                </div>

                {/* B — Reference code */}
                <div className="bg-slate-800 border border-yellow-500/40 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold text-black shrink-0">2</div>
                    <span className="font-semibold">Add this code in the payment <span className="text-yellow-400">reference/note</span></span>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-700 rounded-lg px-4 py-3">
                    <span className="font-mono text-yellow-400 text-2xl font-bold flex-1 tracking-widest">{referenceCode}</span>
                    <button
                      onClick={() => copyToClipboard(referenceCode, 'ref')}
                      className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 shrink-0"
                    >
                      {copied === 'ref' ? <><CheckCircle className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>
                  <p className="text-xs text-yellow-600 mt-2">⚠️ This is how we identify your payment. Do not skip this step.</p>
                </div>

                {/* C — Enter MoMo number */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                    <span className="font-semibold">Enter the MoMo number you paid <span className="text-green-400">from</span></span>
                  </div>
                  <input
                    type="tel"
                    placeholder="e.g. 0551234567"
                    value={momoNumber}
                    onChange={e => setMomoNumber(e.target.value)}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 font-mono"
                  />
                  <p className="text-xs text-slate-500 mt-2">This helps our admin verify your payment quickly</p>
                </div>

                {error && <p className="text-red-400 text-sm">⚠️ {error}</p>}

                <button
                  onClick={handleSubmit}
                  disabled={submitLoading || !momoNumber.trim()}
                  className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-opacity flex items-center justify-center gap-2 text-base"
                >
                  {submitLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    : <>✅ I've paid — Submit for Activation</>}
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3: Done ── */}
          {step === 'done' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Payment Submitted! 🎉</h2>
              <p className="text-slate-400 mb-2">Your reference code is:</p>
              <code className="font-mono text-2xl font-bold text-yellow-400 tracking-widest block mb-4">{referenceCode}</code>
              <p className="text-slate-400 text-sm mb-2">
                We'll verify your MoMo payment and activate your account.
              </p>
              <p className="text-white font-semibold mb-6">Usually within <span className="text-green-400">30 minutes</span>.</p>
              <p className="text-xs text-slate-500">Keep this reference code saved in case you need to follow up.</p>
              <button
                onClick={onClose}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 rounded-xl font-semibold transition-opacity text-white"
              >
                Close & Wait for Activation
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
