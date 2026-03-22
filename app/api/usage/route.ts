import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, findAccountById, isAccountExpired, canAccountGenerate, getAccountRemaining, ACCOUNT_LIMITS } from '@/lib/accounts'

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
      expires: null,
      loggedIn: false,
    })
  }

  const accountId = await verifyToken(token)
  if (!accountId) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const account = await findAccountById(accountId)
  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }

  const expired = isAccountExpired(account)
  const remaining = getAccountRemaining(account)
  const limit = account.tier === 'basic'
    ? ACCOUNT_LIMITS.basic
    : ACCOUNT_LIMITS[account.tier] === Infinity ? null : ACCOUNT_LIMITS[account.tier]

  return NextResponse.json({
    tier: account.tier,
    usage: account.usage,
    dailyUsage: account.dailyUsage,
    limit,
    remaining,
    expired,
    canGenerate: canAccountGenerate(account),
    expires: account.expires,
    loggedIn: true,
  })
}
