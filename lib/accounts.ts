// Account store — persisted to .data/accounts.json
// Passwords are bcrypt-hashed. JWTs are signed with JWT_SECRET.

import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import type { Tier } from './users'

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

const DATA_DIR = path.join(process.cwd(), '.data')
const ACCOUNTS_FILE = path.join(DATA_DIR, 'accounts.json')

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'doltsite-jwt-secret-change-in-production-2025'
)
const JWT_EXPIRES = '30d'

// ── Persistence ──────────────────────────────────────────────────────────────

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function loadAccounts(): Record<string, Account> {
  try {
    ensureDataDir()
    if (!fs.existsSync(ACCOUNTS_FILE)) return {}
    return JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf-8'))
  } catch {
    return {}
  }
}

function saveAccounts(data: Record<string, Account>) {
  try {
    ensureDataDir()
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (e) {
    console.error('Failed to save accounts:', e)
  }
}

let _accounts: Record<string, Account> | null = null

export function getAccountsStore(): Record<string, Account> {
  if (!_accounts) _accounts = loadAccounts()
  return _accounts
}

export function saveAccount(account: Account) {
  const store = getAccountsStore()
  store[account.id] = account
  saveAccounts(store)
}

// ── Lookup helpers ────────────────────────────────────────────────────────────

export function findAccountByEmail(email: string): Account | null {
  const store = getAccountsStore()
  return Object.values(store).find(a => a.email.toLowerCase() === email.toLowerCase()) ?? null
}

export function findAccountById(id: string): Account | null {
  return getAccountsStore()[id] ?? null
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

// ── Usage/limit helpers (mirror lib/users.ts but for accounts) ───────────────

export const ACCOUNT_LIMITS: Record<Tier, number> = {
  free: 2,
  basic: 3,
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
    // reset daily counter if it's a new day
    if (account.lastReset !== todayStr()) {
      account.dailyUsage = 0
      account.lastReset = todayStr()
      saveAccount(account)
    }
    return account.dailyUsage < ACCOUNT_LIMITS.basic
  }
  const limit = ACCOUNT_LIMITS[account.tier]
  return account.usage < limit
}

export function incrementAccountUsage(account: Account): Account {
  if (account.tier === 'basic') {
    if (account.lastReset !== todayStr()) {
      account.dailyUsage = 0
      account.lastReset = todayStr()
    }
    account.dailyUsage += 1
  }
  account.usage += 1
  saveAccount(account)
  return account
}

export function getAccountRemaining(account: Account): number | null {
  if (account.tier === 'basic') return Math.max(0, ACCOUNT_LIMITS.basic - account.dailyUsage)
  const limit = ACCOUNT_LIMITS[account.tier]
  if (limit === Infinity) return null
  return Math.max(0, limit - account.usage)
}
