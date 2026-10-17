import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { createSession } from '../session/route';

const SESSION_COOKIE = 'bdp_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone number is required.' }, { status: 400 });
    }

    const normalizedPhone = phone.replace(/\s+/g, '').trim();

    // Look up user by phone
    const user = await prisma.user.findFirst({ where: { phone: normalizedPhone } });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this phone number. Please register first.' },
        { status: 404 }
      );
    }

    // Create session
    const sessionId = createSession(user.id);
    const response = NextResponse.json({
      success: true,
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        verification_status: user.verification_status,
      },
    });
    response.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_TTL_MS / 1000,
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error('[login]', err);
    return NextResponse.json({ success: false, error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
