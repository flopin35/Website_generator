// Account store — persisted to Upstash Redis
// Passwords are bcrypt-hashed. JWTs are signed with JWT_SECRET.

import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { getRedis, KEYS } from './redis'

export type Tier = 'free' | 'basic' | 'standard' | 'premium'

export type Account = {
  id: string
  email: string
  passwordHash: string
  name: string
  tier: Tier
  usage: number
  dailyUsage: number
  lastReset: string
  expires: string | null
  createdAt: string
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'doltsite-jwt-secret-change-in-production-2025'
)
const JWT_EXPIRES = '30d'

// ── Persistence (Redis) ───────────────────────────────────────────────────────

export async function saveAccount(account: Account): Promise<void> {
  try {
    const r = getRedis()
    await r.set(KEYS.account(account.id), JSON.stringify(account))
    await r.set(KEYS.accountEmail(account.email), account.id)
  } catch (e) {
    console.error('Failed to save account to Redis:', e)
  }
}

export async function findAccountByEmail(email: string): Promise<Account | null> {
  try {
    const r = getRedis()
    const id = await r.get(KEYS.accountEmail(email.toLowerCase())) as string | null
    if (!id) return null
    return findAccountById(id)
  } catch {
    return null
  }
}

export async function findAccountById(id: string): Promise<Account | null> {
  try {
    const r = getRedis()
    const raw = await r.get(KEYS.account(id))
    if (!raw) return null
    return typeof raw === 'string' ? JSON.parse(raw) : raw as Account
  } catch {
    return null
  }
}

export async function getAllAccounts(): Promise<Account[]> {
  try {
    const r = getRedis()
    const keys: string[] = []
    let cursor = 0
    do {
      const [nextCursor, found] = await r.scan(cursor, { match: 'account:acc-*', count: 100 })
      cursor = Number(nextCursor)
      for (const k of found) {
        if (typeof k === 'string') keys.push(k)
      }
    } while (cursor !== 0)

    if (keys.length === 0) return []
    const raws = await r.mget(...keys)
    return (raws as unknown[])
      .filter(Boolean)
      .map(r => typeof r === 'string' ? JSON.parse(r) : r as Account)
  } catch {
    return []
  }
}

// ── Auth helpers ──────────────────────────────────────────────────────────────

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export async function createToken(accountId: string): Promise<string> {
  return new SignJWT({ sub: accountId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES)
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.sub as string
  } catch {
    return null
  }
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

// ── Usage/limit helpers ───────────────────────────────────────────────────────

export const ACCOUNT_LIMITS: Record<Tier, number> = {
  free: 5,
  basic: 10,
  standard: 200,
  premium: Infinity,
}

export function isAccountExpired(account: Account): boolean {
  if (!account.expires) return false
  return new Date() > new Date(account.expires)
}

export function canAccountGenerate(account: Account): boolean {
  if (isAccountExpired(account)) return false
  if (account.tier === 'basic') {
    if (account.lastReset !== todayStr()) {
      account.dailyUsage = 0
      account.lastReset = todayStr()
    }
    return account.dailyUsage < ACCOUNT_LIMITS.basic
  }
  const limit = ACCOUNT_LIMITS[account.tier]
  return account.usage < limit
}

export async function incrementAccountUsage(account: Account): Promise<Account> {
  if (account.tier === 'basic') {
    if (account.lastReset !== todayStr()) {
      account.dailyUsage = 0
      account.lastReset = todayStr()
    }
    account.dailyUsage += 1
  }
  account.usage += 1
  await saveAccount(account)
  return account
}

export function getAccountRemaining(account: Account): number | null {
  if (account.tier === 'basic') return Math.max(0, ACCOUNT_LIMITS.basic - account.dailyUsage)
  const limit = ACCOUNT_LIMITS[account.tier]
  if (limit === Infinity) return null
  return Math.max(0, limit - account.usage)
}
