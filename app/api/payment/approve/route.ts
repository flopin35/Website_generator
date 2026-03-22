import { NextRequest, NextResponse } from 'next/server'
import { getAllPayments, updatePayment, PLAN_CONFIG } from '@/lib/payments'
import { findAccountByEmail, saveAccount, todayStr, type Tier } from '@/lib/accounts'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'doltsite-admin-2025'

// GET — list all payments (admin only)
export async function GET(request: NextRequest) {
  const key = request.headers.get('x-admin-key')
  if (key !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const list = await getAllPayments()
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

    const allPayments = await getAllPayments()
    const payment = allPayments.find(p => p.id === paymentId)
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (action === 'approve') {
      await updatePayment(paymentId, { status: 'approved', ...(note ? { note } : {}) })

      const days = PLAN_CONFIG[payment.plan].days
      const expires = new Date()
      expires.setDate(expires.getDate() + days)
      const expiresStr = expires.toISOString()

      // Upgrade the linked account if one exists
      if (payment.accountEmail) {
        const account = await findAccountByEmail(payment.accountEmail)
        if (account) {
          account.tier = payment.plan as Tier
          account.usage = 0
          account.dailyUsage = 0
          account.lastReset = todayStr()
          account.expires = expiresStr
          await saveAccount(account)
        }
      }

      return NextResponse.json({
        success: true,
        message: `Payment approved. Account upgraded to ${payment.plan}.`,
        expires: expiresStr,
      })
    } else {
      await updatePayment(paymentId, { status: 'rejected', ...(note ? { note } : {}) })
      return NextResponse.json({ success: true, message: 'Payment rejected.' })
    }
  } catch (e) {
    console.error('Payment approve error:', e)
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
  }
}
