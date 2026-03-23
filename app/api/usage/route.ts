import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, findAccountById, isAccountExpired, canAccountGenerate, getRemainingGenerations, ACCOUNT_LIMITS } from '@/lib/accounts-db'

// GET – return current account status
export async function GET(request: NextRequest) {
  const token = request.cookies.get('doltsite-token')?.value
  if (!token) {
    // Not logged in — return free tier defaults
    return NextResponse.json({
      tier: 'free',
      usage: 0,
      dailyUsage: 0,
      limit: ACCOUNT_LIMITS.free,
      remaining: ACCOUNT_LIMITS.free,
      expired: false,
      canGenerate: true,
      subscriptionExpiresAt: null,
      loggedIn: false,
    })
  }

  const accountId = await verifyJWT(token)
  if (!accountId) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const account = await findAccountById(accountId)
  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }

  const expired = isAccountExpired(account)
  const remaining = getRemainingGenerations(account)
  const limit = account.tier === 'free'
    ? ACCOUNT_LIMITS.free
    : account.tier === 'basic'
    ? ACCOUNT_LIMITS.basic
    : account.tier === 'standard'
    ? ACCOUNT_LIMITS.standard
    : null

  return NextResponse.json({
    tier: account.tier,
    usage: account.usage,
    dailyUsage: account.dailyUsage,
    limit,
    remaining,
    expired,
    canGenerate: canAccountGenerate(account),
    subscriptionExpiresAt: account.expires,
    loggedIn: true,
  })
}
