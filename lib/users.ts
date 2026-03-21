// Shared in-memory user store — persisted to disk so upgrades survive server restarts

import fs from 'fs'
import path from 'path'

export type Tier = 'free' | 'basic' | 'standard' | 'premium'

export type User = {
  tier: Tier
  usage: number
  expires: string | null
  name?: string
  dailyUsage: number
  lastReset: string
}

export const LIMITS: Record<Tier, number> = {
  free: 2,
  basic: 3,         // 3 per day
  standard: 200,    // 200 per month
  premium: Infinity,
}

// --- File-based persistence ---
const DATA_DIR = path.join(process.cwd(), '.data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function loadUsers(): Record<string, User> {
  try {
    ensureDataDir()
    if (!fs.existsSync(USERS_FILE)) return {}
    const raw = fs.readFileSync(USERS_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function saveUsers(data: Record<string, User>) {
  try {
    ensureDataDir()
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (e) {
    console.error('Failed to save users:', e)
  }
}

let _users: Record<string, User> | null = null

function getUsersStore(): Record<string, User> {
  if (!_users) _users = loadUsers()
  return _users
}

export const users: Record<string, User> = new Proxy({} as Record<string, User>, {
  get(_t, key: string) { return getUsersStore()[key] },
  set(_t, key: string, value: User) {
    const store = getUsersStore()
    store[key] = value
    saveUsers(store)
    return true
  },
  ownKeys() { return Object.keys(getUsersStore()) },
  getOwnPropertyDescriptor(_t, key: string) {
    const store = getUsersStore()
    if (key in store) return { configurable: true, enumerable: true, writable: true, value: store[key] }
    return undefined
  },
  has(_t, key: string) { return key in getUsersStore() },
})

export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function getUser(sessionId: string): User {
  const store = getUsersStore()
  if (!store[sessionId]) {
    const newUser: User = { tier: 'free', usage: 0, dailyUsage: 0, lastReset: todayStr(), expires: null }
    store[sessionId] = newUser
    saveUsers(store)
  }
  const user = store[sessionId]
  // Reset daily usage for basic tier if it's a new day
  if (user.tier === 'basic' && user.lastReset !== todayStr()) {
    user.dailyUsage = 0
    user.lastReset = todayStr()
    saveUsers(store)
  }
  return user
}

export function incrementUsage(sessionId: string): User {
  const store = getUsersStore()
  const user = getUser(sessionId)
  user.usage += 1
  if (user.tier === 'basic') user.dailyUsage += 1
  saveUsers(store)
  return user
}

export function isExpired(sessionId: string): boolean {
  const user = getUser(sessionId)
  if (!user.expires) return false
  return new Date() > new Date(user.expires)
}

export function canGenerate(sessionId: string): boolean {
  if (isExpired(sessionId)) return false
  const user = getUser(sessionId)
  if (user.tier === 'basic') return user.dailyUsage < LIMITS.basic
  const limit = LIMITS[user.tier]
  return user.usage < limit
}

export function getRemainingForUser(sessionId: string): number | null {
  const user = getUser(sessionId)
  if (user.tier === 'basic') return Math.max(0, LIMITS.basic - user.dailyUsage)
  const limit = LIMITS[user.tier]
  if (limit === Infinity) return null
  return Math.max(0, limit - user.usage)
}

/** Explicitly save a user object to disk (use after mutating fields directly). */
export function saveUser(sessionId: string, user: User) {
  const store = getUsersStore()
  store[sessionId] = user
  saveUsers(store)
}
