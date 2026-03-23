// Account service using PostgreSQL (Prisma) instead of Redis
// Ensures permanent, reliable user data storage

import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { prisma } from './db'

export type Tier = 'free' | 'basic' | 'standard' | 'premium'

export type AccountInfo = {
  id: string
  email: string
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

// ── Account limits per tier ────────────────────────────────────────────────────

export const ACCOUNT_LIMITS: Record<Tier, number> = {
  free: 3,        // 3 gens per day (free tier)
  basic: 10,      // 10 gens per day (20 GHS/month)
  standard: 200,  // 200 gens per month (50 GHS/month)
  premium: Infinity, // Unlimited (250 GHS/month)
}

// ── Database operations (PostgreSQL via Prisma) ────────────────────────────────

export async function findAccountByEmail(email: string): Promise<AccountInfo | null> {
  try {
    const account = await prisma.account.findUnique({
      where: { email: email.toLowerCase() },
    })
    if (!account) return null
    return mapToAccountInfo(account)
  } catch (e) {
    console.error('Failed to find account:', e)
    return null
  }
}

export async function findAccountById(id: string): Promise<AccountInfo | null> {
  try {
    const account = await prisma.account.findUnique({
      where: { id },
    })
    if (!account) return null
    return mapToAccountInfo(account)
  } catch (e) {
    console.error('Failed to find account:', e)
    return null
  }
}

export async function saveAccount(account: AccountInfo): Promise<void> {
  try {
    await prisma.account.upsert({
      where: { id: account.id },
      update: {
        email: account.email.toLowerCase(),
        name: account.name,
        tier: account.tier,
        usage: account.usage,
        dailyUsage: account.dailyUsage,
        lastReset: new Date(account.lastReset),
        expires: account.expires ? new Date(account.expires) : null,
      },
      create: {
        id: account.id,
        email: account.email.toLowerCase(),
        name: account.name,
        tier: account.tier,
        usage: account.usage,
        dailyUsage: account.dailyUsage,
        lastReset: new Date(account.lastReset),
        expires: account.expires ? new Date(account.expires) : null,
        // passwordHash would be set separately during signup
        passwordHash: '',
      },
    })
  } catch (e) {
    console.error('Failed to save account:', e)
  }
}

export async function createAccount(
  email: string,
  name: string,
  password: string
): Promise<AccountInfo | null> {
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const account = await prisma.account.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash: hashedPassword,
        tier: 'free',
        usage: 0,
        dailyUsage: 0,
        lastReset: new Date(),
      },
    })
    return mapToAccountInfo(account)
  } catch (e) {
    console.error('Failed to create account:', e)
    return null
  }
}

export async function verifyPassword(email: string, password: string): Promise<boolean> {
  try {
    const account = await prisma.account.findUnique({
      where: { email: email.toLowerCase() },
    })
    if (!account) return false
    return await bcrypt.compare(password, account.passwordHash)
  } catch {
    return false
  }
}

// ── Usage tracking ────────────────────────────────────────────────────────────

export function isAccountExpired(account: AccountInfo): boolean {
  if (!account.expires) return false
  return new Date() > new Date(account.expires)
}

export function canAccountGenerate(account: AccountInfo): boolean {
  // Check subscription validity (expires in past?)
  if (account.expires && new Date() > new Date(account.expires)) {
    return false
  }

  // Premium tier → always allowed (if subscription valid)
  if (account.tier === 'premium') {
    return true
  }

  // Free/Basic/Standard → check generation limit
  return account.dailyUsage < ACCOUNT_LIMITS[account.tier]
}

export function getRemainingGenerations(account: AccountInfo): number {
  if (account.tier === 'free' || account.tier === 'basic') {
    return Math.max(0, ACCOUNT_LIMITS[account.tier] - account.dailyUsage)
  }
  if (account.tier === 'standard') {
    return Math.max(0, ACCOUNT_LIMITS.standard - account.usage)
  }
  return Infinity
}

export async function incrementUsage(accountId: string): Promise<AccountInfo | null> {
  try {
    const account = await prisma.account.findUnique({ where: { id: accountId } })
    if (!account) return null

    // Check if daily reset is needed (for free/basic)
    const now = new Date()
    const lastReset = new Date(account.lastReset)
    const daysPassed = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24))

    let dailyUsage = account.dailyUsage
    let lastResetTime = lastReset

    if (daysPassed > 0) {
      // Reset daily counter
      dailyUsage = 0
      lastResetTime = now
    }

    // Increment usage
    const updated = await prisma.account.update({
      where: { id: accountId },
      data: {
        usage: account.usage + 1,
        dailyUsage: dailyUsage + 1,
        lastReset: lastResetTime,
      },
    })

    return mapToAccountInfo(updated)
  } catch (e) {
    console.error('Failed to increment usage:', e)
    return null
  }
}

// ── JWT handling ──────────────────────────────────────────────────────────────

export async function generateJWT(accountId: string): Promise<string> {
  return await new SignJWT({ sub: accountId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(JWT_EXPIRES)
    .sign(JWT_SECRET)
}

export async function verifyJWT(token: string): Promise<string | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload.sub as string
  } catch {
    return null
  }
}

// ── Helper functions ──────────────────────────────────────────────────────────

function mapToAccountInfo(account: any): AccountInfo {
  return {
    id: account.id,
    email: account.email,
    name: account.name,
    tier: account.tier as Tier,
    usage: account.usage,
    dailyUsage: account.dailyUsage,
    lastReset: account.lastReset.toISOString(),
    expires: account.expires ? account.expires.toISOString() : null,
    createdAt: account.createdAt.toISOString(),
  }
}

// ── Cleanup old sessions ──────────────────────────────────────────────────────

export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })
  } catch (e) {
    console.error('Failed to cleanup sessions:', e)
  }
}
