'use client'

import { X, Zap, Star, Crown, MessageCircle } from 'lucide-react'

interface PricingModalProps {
  onClose: () => void
  reason?: 'limit' | 'expired'
}

const WHATSAPP_NUMBER = '0240104225' // ← Replace with your real number
const MOMO_NUMBER = '0509002402(Telecel)'       // ← Replace with your real MoMo number

const plans = [
  {
    icon: <Zap className="w-5 h-5" />,
    name: 'Basic',
    price: '20 GHS',
    period: '/ month',
    color: 'from-blue-500 to-cyan-500',
    border: 'border-blue-500/40',
    features: [
      '3 website generations/day',
      'All 6 templates',
      'ZIP download',
      'Prompt-driven customization',
    ],
  },
  {
    icon: <Star className="w-5 h-5" />,
    name: 'Standard',
    price: '100 GHS',
    period: '/ month',
    color: 'from-purple-500 to-pink-500',
    border: 'border-purple-500/60',
    popular: true,
    features: [
      '200 website generations/month',
      'All 6 templates',
      'ZIP download',
      'Priority support',
      'Prompt-driven customization',
    ],
  },
  {
    icon: <Crown className="w-5 h-5" />,
    name: 'Premium',
    price: '250 GHS',
    period: '/ month',
    color: 'from-yellow-500 to-orange-500',
    border: 'border-yellow-500/40',
    features: [
      'Unlimited generations',
      'All 6 templates',
      'ZIP download',
      'Priority support',
      'Early access to new features',
      'Direct consultation session',
    ],
  },
]

export default function PricingModal({ onClose, reason = 'limit' }: PricingModalProps) {
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi! I want to upgrade my Doltsite account. Here is my payment proof:')}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-8 pb-0 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            {reason === 'expired' ? 'Subscription Expired' : "You've reached your free limit"}
          </div>
          <h2 className="text-3xl font-bold mb-2">Unlock Full Access 🚀</h2>
          <p className="text-slate-400 mb-2">
            {reason === 'expired'
              ? 'Your plan has expired. Renew to keep generating.'
              : 'You used your 2 free generations. Upgrade to continue.'}
          </p>
          <p className="text-xs text-green-400 font-medium">⚡ Instant activation after payment confirmation.</p>
        </div>

        {/* Plans */}
        <div className="p-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border-2 ${plan.border} bg-slate-800/60 p-5 flex flex-col gap-3 ${plan.popular ? 'ring-2 ring-purple-500/50' : ''}`}
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
                <div className="font-bold text-lg">{plan.name}</div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-extrabold">{plan.price}</span>
                  <span className="text-slate-400 text-sm">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-1.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-green-400 mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-2 w-full py-2.5 rounded-lg bg-gradient-to-r ${plan.color} text-white font-semibold text-sm text-center hover:opacity-90 transition-opacity block`}
              >
                Choose {plan.name}
              </a>
            </div>
          ))}
        </div>

        {/* Payment Instructions */}
        <div className="mx-8 mb-4 p-5 bg-slate-800 border border-slate-700 rounded-xl">
          <h3 className="font-bold text-base mb-3 flex items-center gap-2">
            💳 How to Pay
          </h3>
          <div className="space-y-2 text-sm text-slate-300">
            <p>1. Choose your plan above and note the amount</p>
            <p>
              2. Send payment via <span className="text-yellow-400 font-semibold">MoMo</span>:{' '}
              <span className="font-mono bg-slate-700 px-2 py-0.5 rounded text-white">{MOMO_NUMBER}</span>
            </p>
            <p>3. Take a screenshot of your payment confirmation</p>
            <p>4. Send proof via WhatsApp to get instant access</p>
          </div>
        </div>

        {/* WhatsApp CTA */}
        <div className="px-8 pb-8">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-green-500 hover:bg-green-400 text-white font-bold text-lg transition-colors shadow-lg shadow-green-500/30"
          >
            <MessageCircle className="w-6 h-6" />
            Send Payment Proof on WhatsApp
          </a>
          <p className="text-center text-xs text-slate-500 mt-3">
            After confirming your payment, your account will be activated instantly.
          </p>
        </div>
      </div>
    </div>
  )
}
