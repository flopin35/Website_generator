import { NextRequest, NextResponse } from 'next/server'
import { findAccountByEmail, verifyPassword, createToken } from '@/lib/accounts'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const account = await findAccountByEmail(email)
    if (!account) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const valid = await verifyPassword(password, account.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const token = await createToken(account.id)

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
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
    return response
  } catch (e) {
    console.error('Login error:', e)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
