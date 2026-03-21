// Shared payments store — persisted to a JSON file so data survives server restarts

import fs from 'fs'
import path from 'path'

export type PaymentStatus = 'pending' | 'approved' | 'rejected'

export type Payment = {
  id: string
  referenceCode: string
  sessionId: string
  accountEmail?: string        // set when user is logged in
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

// --- File-based persistence ---
const DATA_DIR = path.join(process.cwd(), '.data')
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function loadPayments(): Record<string, Payment> {
  try {
    ensureDataDir()
    if (!fs.existsSync(PAYMENTS_FILE)) return {}
    const raw = fs.readFileSync(PAYMENTS_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function savePayments(data: Record<string, Payment>) {
  try {
    ensureDataDir()
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (e) {
    console.error('Failed to save payments:', e)
  }
}

// In-memory cache, loaded from disk on first use
let _payments: Record<string, Payment> | null = null

export function getPayments(): Record<string, Payment> {
  if (!_payments) _payments = loadPayments()
  return _payments
}

export function savePayment(payment: Payment) {
  const store = getPayments()
  store[payment.id] = payment
  savePayments(store)
}

// Keep a backward-compatible `payments` export as a Proxy so existing code works
export const payments = new Proxy({} as Record<string, Payment>, {
  get(_t, key: string) {
    return getPayments()[key]
  },
  set(_t, key: string, value: Payment) {
    const store = getPayments()
    store[key] = value
    savePayments(store)
    return true
  },
  ownKeys() {
    return Object.keys(getPayments())
  },
  getOwnPropertyDescriptor(_t, key: string) {
    const store = getPayments()
    if (key in store) return { configurable: true, enumerable: true, writable: true, value: store[key] }
    return undefined
  },
  has(_t, key: string) {
    return key in getPayments()
  },
})
