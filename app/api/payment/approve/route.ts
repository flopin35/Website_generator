import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { findAccountById } from '@/lib/accounts-db'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'doltsite-admin-2025'

// GET — list all payments (admin only)
export async function GET(request: NextRequest) {
  const key = request.headers.get('x-admin-key')
  if (key !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payments = await prisma.payment.findMany({
    include: { account: true },
    orderBy: { submittedAt: 'desc' },
  })
  return NextResponse.json({ payments })
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

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { account: true },
    })
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (action === 'approve') {
      // Mark payment as completed
      await prisma.payment.update({
        where: { id: paymentId },
        data: { 
          status: 'completed',
          completedAt: new Date(),
          ...(note ? { note } : {})
        },
      })

      // Calculate subscription expiry
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + payment.durationDays)

      // Upgrade the account
      await prisma.account.update({
        where: { id: payment.accountId },
        data: {
          tier: payment.tier as any,
          subscriptionStatus: 'active',
          subscriptionExpiresAt: expiresAt,
          generationsUsed: 0, // Reset usage on upgrade
          lastResetAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        message: `Payment approved. Account upgraded to ${payment.tier}.`,
        expires: expiresAt.toISOString(),
      })
    } else {
      // Reject payment
      await prisma.payment.update({
        where: { id: paymentId },
        data: { 
          status: 'failed',
          ...(note ? { note } : {})
        },
      })
      return NextResponse.json({ success: true, message: 'Payment rejected.' })
    }
  } catch (e) {
    console.error('Payment approve error:', e)
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
  }
}
