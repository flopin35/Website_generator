import { NextRequest, NextResponse } from 'next/server'
import { getAllPayments, savePayment, PLAN_CONFIG, type Payment } from '@/lib/payments'
import { verifyToken, findAccountById } from '@/lib/accounts'

function generateRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'DOLT-'
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

// POST — user picks a plan, gets a reference code
export async function POST(request: NextRequest) {
  try {
    const { sessionId, plan } = await request.json()

    if (!sessionId || !plan || !PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]) {
      return NextResponse.json({ error: 'sessionId and valid plan are required' }, { status: 400 })
    }

    const config = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]

    // Resolve account email if user is logged in
    const token = request.cookies.get('doltsite-token')?.value
    let accountEmail: string | undefined
    if (token) {
      const accountId = await verifyToken(token)
      const account = accountId ? await findAccountById(accountId) : null
      if (account) accountEmail = account.email
    }

    // Return existing pending payment if one exists
    const allPayments = await getAllPayments()
    const existing = allPayments.find(
      (p: Payment) => p.sessionId === sessionId && p.status === 'pending'
    )
    if (existing) {
      return NextResponse.json({
        referenceCode: existing.referenceCode,
        amount: existing.amount,
        plan: existing.plan,
        alreadyPending: true,
      })
    }

    const referenceCode = generateRef()
    const id = 'pay-' + Date.now() + '-' + Math.random().toString(36).slice(2)

    const newPayment: Payment = {
      id,
      referenceCode,
      sessionId,
      accountEmail,
      plan: plan as 'basic' | 'standard' | 'premium',
      amount: config.amount,
      momoNumber: '',
      submittedAt: new Date().toISOString(),
      status: 'pending',
    }
    await savePayment(newPayment)

    return NextResponse.json({
      referenceCode,
      amount: config.amount,
      label: config.label,
      plan,
      paymentId: id,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 })
  }
}

// PATCH — user submits their MoMo number after paying
export async function PATCH(request: NextRequest) {
  try {
    const { referenceCode, momoNumber } = await request.json()

    if (!referenceCode || !momoNumber) {
      return NextResponse.json({ error: 'referenceCode and momoNumber are required' }, { status: 400 })
    }

    const allPayments = await getAllPayments()
    const payment = allPayments.find((p: Payment) => p.referenceCode === referenceCode)
    if (!payment) {
      return NextResponse.json({ error: 'Reference code not found. Please check and try again.' }, { status: 404 })
    }
    if (payment.status === 'approved') {
      return NextResponse.json({ error: 'This payment has already been approved.' }, { status: 400 })
    }

    payment.momoNumber = momoNumber
    payment.submittedAt = new Date().toISOString()
    await savePayment(payment)

    return NextResponse.json({ success: true, message: 'Payment proof submitted! You will be activated shortly.' })
  } catch {
    return NextResponse.json({ error: 'Failed to submit payment proof' }, { status: 500 })
  }
}
