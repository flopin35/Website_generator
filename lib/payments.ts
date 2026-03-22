// Payments store — persisted to Upstash Redis

import { redis, KEYS } from './redis'

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
  standard: { amount: '100 GHS', days: 30, label: 'Standard – 100 GHS/month' },
  premium:  { amount: '250 GHS', days: 30, label: 'Premium – 250 GHS/month' },
} as const

// ── Redis persistence ─────────────────────────────────────────────────────────

export async function savePayment(payment: Payment): Promise<void> {
  try {
    await redis.set(KEYS.payment(payment.id), JSON.stringify(payment))
    // Add to sorted set by timestamp for ordered listing
    await redis.zadd(KEYS.allPayments(), {
      score: new Date(payment.submittedAt).getTime(),
      member: payment.id,
    })
  } catch (e) {
    console.error('Failed to save payment to Redis:', e)
  }
}

export async function getPayment(id: string): Promise<Payment | null> {
  try {
    const raw = await redis.get<string>(KEYS.payment(id))
    if (!raw) return null
    return typeof raw === 'string' ? JSON.parse(raw) : raw as Payment
  } catch {
    return null
  }
}

export async function getAllPayments(): Promise<Payment[]> {
  try {
    // Get all payment IDs ordered by time descending
    const ids = await redis.zrange(KEYS.allPayments(), 0, -1, { rev: true })
    if (!ids || ids.length === 0) return []
    const raws = await redis.mget<string[]>(...ids.map((id) => KEYS.payment(id as string)))
    return raws
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
