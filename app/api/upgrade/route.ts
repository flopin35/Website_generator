import { NextRequest, NextResponse } from 'next/server'
import { findAccountById, findAccountByEmail } from '@/lib/accounts-db'
import { prisma } from '@/lib/db'

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

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + Number(days))

    // Update account with new tier and reset usage
    const updated = await prisma.account.update({
      where: { id: account.id },
      data: {
        tier: tier as any,
        subscriptionStatus: 'active',
        subscriptionExpiresAt: expiresAt,
        generationsUsed: 0,
        lastResetAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: `Account upgraded to ${tier}`,
      account: { 
        id: updated.id, 
        email: updated.email, 
        tier: updated.tier, 
        subscriptionExpiresAt: updated.subscriptionExpiresAt?.toISOString() 
      }
    })
  } catch {
    return NextResponse.json({ error: 'Failed to upgrade account' }, { status: 500 })
  }
}
