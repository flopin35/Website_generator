import { NextRequest, NextResponse } from 'next/server'
import {
  findAccountByEmail, saveAccount, hashPassword, createToken, todayStr,
} from '@/lib/accounts'

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
    if (findAccountByEmail(email)) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    const id = 'acc-' + Date.now() + '-' + Math.random().toString(36).slice(2)
    const passwordHash = await hashPassword(password)

    const account = {
      id,
      email: email.toLowerCase().trim(),
      passwordHash,
      name: name.trim(),
      tier: 'free' as const,
      usage: 0,
      dailyUsage: 0,
      lastReset: todayStr(),
      expires: null,
      createdAt: new Date().toISOString(),
    }

    saveAccount(account)
    const token = await createToken(id)

    const response = NextResponse.json({
      success: true,
      account: {
        id,
        email: account.email,
        name: account.name,
        tier: account.tier,
        expires: null,
        usage: 0,
        dailyUsage: 0,
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
