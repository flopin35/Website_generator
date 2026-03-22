import { NextRequest, NextResponse } from 'next/server'
import { findAccountById, findAccountByEmail, saveAccount, todayStr, type Tier } from '@/lib/accounts'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'doltsite-admin-2025'

export async function POST(request: NextRequest) {
  try {
    const { accountId, email, tier, days, adminKey } = await request.json()

    if (adminKey !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if ((!accountId && !email) || !tier || !days) {
      return NextResponse.json({ error: 'accountId or email, tier, and days are required' }, { status: 400 })
    }

    const account = accountId
      ? await findAccountById(accountId)
      : await findAccountByEmail(email)

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const expires = new Date()
    expires.setDate(expires.getDate() + Number(days))

    account.tier = tier as Tier
    account.usage = 0
    account.dailyUsage = 0
    account.lastReset = todayStr()
    account.expires = expires.toISOString()

    await saveAccount(account)

    return NextResponse.json({
      success: true,
      message: `Account upgraded to ${tier}`,
      account: { id: account.id, email: account.email, tier: account.tier, expires: account.expires }
    })
  } catch {
    return NextResponse.json({ error: 'Failed to upgrade account' }, { status: 500 })
  }
}
