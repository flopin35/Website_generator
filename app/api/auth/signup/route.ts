import { NextRequest, NextResponse } from 'next/server'
import {
  findAccountByEmail, createAccount, generateJWT,
} from '@/lib/accounts-db'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }
    const existing = await findAccountByEmail(email)
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    const account = await createAccount(email.toLowerCase().trim(), name.trim(), password)
    if (!account) {
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }

    const token = await generateJWT(account.id)

    const response = NextResponse.json({
      success: true,
      account: {
        id: account.id,
        email: account.email,
        name: account.name,
        tier: account.tier,
        expires: account.expires,
        usage: account.usage,
        dailyUsage: account.dailyUsage,
      },
    })
    response.cookies.set('doltsite-token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
    return response
  } catch (e) {
    console.error('Signup error:', e)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
