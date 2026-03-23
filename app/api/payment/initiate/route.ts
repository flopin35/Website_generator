import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyJWT, findAccountById } from '@/lib/accounts-db'

const PLAN_CONFIG: Record<string, { label: string; amount: string; days: number }> = {
  basic: { label: 'Basic (20 GHS/month)', amount: '20 GHS', days: 30 },
  standard: { label: 'Standard (50 GHS/month)', amount: '50 GHS', days: 30 },
  premium: { label: 'Premium (250 GHS/month)', amount: '250 GHS', days: 30 },
}

function generateRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'DOLT-'
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

// POST — user picks a plan, gets a reference code
export async function POST(request: NextRequest) {
  try {
    const { plan, accountId } = await request.json()

    if (!plan || !PLAN_CONFIG[plan]) {
      return NextResponse.json({ error: 'Valid plan is required (basic|standard|premium)' }, { status: 400 })
    }

    const config = PLAN_CONFIG[plan]
    let account = null

    // If accountId provided, validate it
    if (accountId) {
      account = await findAccountById(accountId)
      if (!account) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 })
      }
    } else {
      // Try to get from token
      const token = request.cookies.get('doltsite-token')?.value
      if (token) {
        const id = await verifyJWT(token)
        if (id) account = await findAccountById(id)
      }
    }

    // Check if pending payment exists for this account
    if (account) {
      const existing = await prisma.payment.findFirst({
        where: {
          accountId: account.id,
          status: 'pending',
        },
      })
      if (existing) {
        return NextResponse.json({
          paymentId: existing.id,
          reference: 'DOLT-' + existing.id.substring(0, 6).toUpperCase(),
          amount: config.amount,
          plan,
          alreadyPending: true,
        })
      }
    }

    // Create new payment
    const newPayment = await prisma.payment.create({
      data: {
        accountId: account?.id || '', // Empty string if not logged in
        amount: config.amount,
        tier: plan as any,
        durationDays: config.days,
        reference: generateRef(),
        status: 'pending',
      },
    })

    return NextResponse.json({
      paymentId: newPayment.id,
      reference: newPayment.reference,
      amount: config.amount,
      label: config.label,
      plan,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 })
  }
}

// PATCH — user submits their MoMo number and proof
export async function PATCH(request: NextRequest) {
  try {
    const { paymentId, reference, momoNumber } = await request.json()

    if ((!paymentId && !reference) || !momoNumber) {
      return NextResponse.json({ error: 'paymentId (or reference) and momoNumber are required' }, { status: 400 })
    }

    const payment = await prisma.payment.findFirst({
      where: paymentId ? { id: paymentId } : { reference },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }
    if (payment.status !== 'pending') {
      return NextResponse.json({ error: 'This payment is not pending' }, { status: 400 })
    }

    // Update payment with MoMo number and submission date
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        reference: momoNumber, // Store MoMo number in reference or note
        submittedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, message: 'Payment proof submitted! Admin will activate shortly.' })
  } catch {
    return NextResponse.json({ error: 'Failed to submit payment proof' }, { status: 500 })
  }
}
