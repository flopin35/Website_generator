import { NextRequest, NextResponse } from 'next/server'
import { getUser, isExpired, canGenerate, getRemainingForUser, LIMITS } from '@/lib/users'

// GET – return current user status
export async function GET(request: NextRequest) {
  const sessionId = request.headers.get('x-session-id') || 'anonymous'
  const user = getUser(sessionId)
  const expired = isExpired(sessionId)
  const remaining = getRemainingForUser(sessionId)

  return NextResponse.json({
    tier: user.tier,
    usage: user.usage,
    dailyUsage: user.dailyUsage,
    limit: user.tier === 'basic' ? LIMITS.basic : (LIMITS[user.tier] === Infinity ? null : LIMITS[user.tier]),
    remaining,
    expired,
    canGenerate: canGenerate(sessionId),
    expires: user.expires,
  })
}
