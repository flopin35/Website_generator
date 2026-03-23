import { NextRequest, NextResponse } from 'next/server'
import { findAccountById, verifyJWT, isAccountExpired, getRemainingGenerations } from '@/lib/accounts-db'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('doltsite-token')?.value
  if (!token) return NextResponse.json({ account: null })

  const accountId = await verifyJWT(token)
  if (!accountId) return NextResponse.json({ account: null })

  const account = await findAccountById(accountId)
  if (!account) return NextResponse.json({ account: null })

  const expired = isAccountExpired(account)
  const remaining = getRemainingGenerations(account)

  return NextResponse.json({
    account: {
      id: account.id,
      email: account.email,
      name: account.name,
      tier: account.tier,
      expires: account.expires,
      usage: account.usage,
      dailyUsage: account.dailyUsage,
      expired,
      remaining,
    },
  })
}

// POST /api/auth/me — logout (clear cookie)
export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('doltsite-token', '', { maxAge: 0, path: '/' })
  return response
}
