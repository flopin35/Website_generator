// Payments store — persisted to Upstash Redis

import { getRedis, KEYS } from './redis'

export type PaymentStatus = 'pending' | 'approved' | 'rejected'

export type Payment = {
  id: string
  referenceCode: string
  sessionId: string
  accountEmail?: string
  plan: 'basic' | 'standard' | 'premium'
  amount: string
  momoNumber: string
  submittedAt: string
  status: PaymentStatus
  note?: string
}

export const PLAN_CONFIG = {
  basic:    { amount: '20 GHS',  days: 30, label: 'Basic – 20 GHS/month' },
  standard: { amount: '50 GHS', days: 30, label: 'Standard – 50 GHS/month' },
  premium:  { amount: '250 GHS', days: 30, label: 'Premium – 250 GHS/month' },
} as const

// ── Redis persistence ─────────────────────────────────────────────────────────

export async function savePayment(payment: Payment): Promise<void> {
  try {
    const r = getRedis()
    await r.set(KEYS.payment(payment.id), JSON.stringify(payment))
    await r.zadd(KEYS.allPayments(), {
      score: new Date(payment.submittedAt).getTime(),
      member: payment.id,
    })
  } catch (e) {
    console.error('Failed to save payment to Redis:', e)
  }
}

export async function getPayment(id: string): Promise<Payment | null> {
  try {
    const r = getRedis()
    const raw = await r.get(KEYS.payment(id))
    if (!raw) return null
    return typeof raw === 'string' ? JSON.parse(raw) : raw as Payment
  } catch {
    return null
  }
}

export async function getAllPayments(): Promise<Payment[]> {
  try {
    const r = getRedis()
    const ids = await r.zrange(KEYS.allPayments(), 0, -1, { rev: true })
    if (!ids || ids.length === 0) return []
    const raws = await r.mget(...ids.map((id) => KEYS.payment(id as string)))
    return (raws as unknown[])
      .filter(Boolean)
      .map(r => typeof r === 'string' ? JSON.parse(r) : r as Payment)
  } catch {
    return []
  }
}

export async function updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | null> {
  const payment = await getPayment(id)
  if (!payment) return null
  const updated = { ...payment, ...updates }
  await savePayment(updated)
  return updated
}
