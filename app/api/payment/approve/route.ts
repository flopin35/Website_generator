import { NextRequest, NextResponse } from 'next/server'
import { getPayments, savePayment, PLAN_CONFIG } from '@/lib/payments'
import { getUser, saveUser } from '@/lib/users'
import { findAccountByEmail, getAccountsStore, saveAccount, todayStr } from '@/lib/accounts'
import type { Tier } from '@/lib/users'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'doltsite-admin-2025'

// GET — list all payments (admin only)
export async function GET(request: NextRequest) {
  const key = request.headers.get('x-admin-key')
  if (key !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const store = getPayments()
  const list = Object.values(store).sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  )
  return NextResponse.json({ payments: list })
}

// POST — approve or reject a payment (admin only)
export async function POST(request: NextRequest) {
  try {
    const key = request.headers.get('x-admin-key')
    if (key !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { paymentId, action, note } = await request.json()

    if (!paymentId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'paymentId and action (approve|reject) required' }, { status: 400 })
    }

    const store = getPayments()
    const payment = store[paymentId]
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (action === 'approve') {
      payment.status = 'approved'
      if (note) payment.note = note
      savePayment(payment)

      const days = PLAN_CONFIG[payment.plan].days
      const expires = new Date()
      expires.setDate(expires.getDate() + days)
      const expiresStr = expires.toISOString()

      // Upgrade session-based user
      const user = getUser(payment.sessionId)
      user.tier = payment.plan
      user.usage = 0
      user.dailyUsage = 0
      user.expires = expiresStr
      saveUser(payment.sessionId, user)

      // Also upgrade the linked account if one exists
      if (payment.accountEmail) {
        const account = findAccountByEmail(payment.accountEmail)
        if (account) {
          account.tier = payment.plan as Tier
          account.usage = 0
          account.dailyUsage = 0
          account.lastReset = todayStr()
          account.expires = expiresStr
          saveAccount(account)
        }
      }

      return NextResponse.json({
        success: true,
        message: `Payment approved. User upgraded to ${payment.plan}.`,
        user: { tier: user.tier, expires: user.expires },
      })
    } else {
      payment.status = 'rejected'
      if (note) payment.note = note
      savePayment(payment)   // ← persist payment status
      return NextResponse.json({ success: true, message: 'Payment rejected.' })
    }
  } catch {
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
  }
}
