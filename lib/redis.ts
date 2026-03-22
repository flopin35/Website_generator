// Shared Redis client (Upstash) — lazy initialization
// Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.local / Vercel env vars

import { Redis } from '@upstash/redis'

let _redis: Redis | null = null

export function getRedis(): Redis {
  if (_redis) return _redis

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    console.warn(
      '[redis] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set — ' +
      'data will NOT persist across restarts. Add these to Vercel env vars.'
    )
  }

  _redis = new Redis({
    url: url ?? 'http://localhost',
    token: token ?? 'no-token',
  })

  return _redis
}

export const KEYS = {
  account: (id: string) => `account:${id}`,
  accountEmail: (email: string) => `account_email:${email.toLowerCase()}`,
  allAccounts: () => `accounts:all`,
  payment: (id: string) => `payment:${id}`,
  allPayments: () => `payments:all`,
}
