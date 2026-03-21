import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/users'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'doltsite-admin-2025'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, tier, days, adminKey } = await request.json()

    if (adminKey !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!sessionId || !tier || !days) {
      return NextResponse.json({ error: 'sessionId, tier, and days are required' }, { status: 400 })
    }

    const user = getUser(sessionId)
    const expires = new Date()
    expires.setDate(expires.getDate() + Number(days))

    user.tier = tier
    user.usage = 0
    user.dailyUsage = 0
    user.expires = expires.toISOString()

    return NextResponse.json({
      success: true,
      message: `User upgraded to ${tier}`,
      user: { tier: user.tier, usage: user.usage, expires: user.expires }
    })
  } catch {
    return NextResponse.json({ error: 'Failed to upgrade user' }, { status: 500 })
  }
}
