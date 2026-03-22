// Shared Redis client (Upstash)
// Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.local / Vercel env vars

import { Redis } from '@upstash/redis'

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn(
    '[redis] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set — ' +
    'falling back to in-memory store (data will not persist across restarts)'
  )
}

// Redis instance — automatically uses env vars
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? 'http://localhost',
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? 'local',
})

export const KEYS = {
  account: (id: string) => `account:${id}`,
  accountEmail: (email: string) => `account_email:${email.toLowerCase()}`,
  allAccounts: () => `accounts:all`,
  payment: (id: string) => `payment:${id}`,
  allPayments: () => `payments:all`,
}
