import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { createSession, SESSION_COOKIE, SESSION_TTL_MS } from '@/lib/session';
import { verifyPassword } from '@/lib/authCrypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, email, password } = body;

    let user = null;

    if (phone) {
      const normalizedPhone = phone.replace(/\s+/g, '').trim();
      user = await prisma.user.findFirst({ where: { phone: normalizedPhone } });
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'No account registered with this phone number. Please create an account.' },
          { status: 404 }
        );
      }
    } else if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      user = await prisma.user.findFirst({ where: { email: normalizedEmail } });
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'No account registered with this email address.' },
          { status: 404 }
        );
      }

      if (password) {
        if (!user.password_hash) {
          return NextResponse.json(
            { success: false, error: 'This account uses phone OTP for sign in. Please sign in with phone.' },
            { status: 400 }
          );
        }
        const isValid = verifyPassword(password, user.password_hash);
        if (!isValid) {
          return NextResponse.json(
            { success: false, error: 'Incorrect password. Please try again or use phone OTP.' },
            { status: 401 }
          );
        }
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Phone number or email is required to sign in.' },
        { status: 400 }
      );
    }

    // Role-based target dashboard
    let targetDashboard = '/recipient/dashboard';
    if (user.role === 'donor') targetDashboard = '/donor/dashboard';
    else if (user.role === 'admin') targetDashboard = '/admin/dashboard';
    else if (user.role === 'hospital') targetDashboard = '/admin/blood-banks';

    // Create session cookie
    const sessionId = createSession(user.id);
    const response = NextResponse.json({
      success: true,
      role: user.role,
      redirectUrl: targetDashboard,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        phone: user.phone,
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
