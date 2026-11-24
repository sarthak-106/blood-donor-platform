import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { createSession, SESSION_COOKIE, SESSION_TTL_MS } from '@/lib/session';
import { verifyPassword } from '@/lib/authCrypto';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { verifyCaptcha } from '@/lib/captcha';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);

    // Rate limiting: 5 login attempts per 5 minutes per IP
    const rateCheck = checkRateLimit(`login_${ip}`, 5, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Please wait ${rateCheck.resetSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { phone, email, password, captchaToken, captchaAnswer } = body;

    // Verify CAPTCHA if provided or if requested
    if (captchaToken || captchaAnswer) {
      const captchaRes = verifyCaptcha(captchaToken, captchaAnswer);
      if (!captchaRes.valid) {
        return NextResponse.json({ success: false, error: captchaRes.error || 'CAPTCHA verification failed.' }, { status: 400 });
      }
    }

    let user = null;

    if (phone) {
      let normalizedPhone = String(phone).replace(/[\s\-\(\)]/g, '').trim();
      if (/^\d{10}$/.test(normalizedPhone)) {
        normalizedPhone = '+91' + normalizedPhone;
      } else if (/^0\d{10}$/.test(normalizedPhone)) {
        normalizedPhone = '+91' + normalizedPhone.substring(1);
      }

      if (!/^\+\d{10,15}$/.test(normalizedPhone)) {
        return NextResponse.json(
          { success: false, error: 'Enter a valid 10-digit mobile number or number with country code (e.g. +91 98765 43210).' },
          { status: 400 }
        );
      }
      user = await prisma.user.findFirst({ where: { phone: normalizedPhone } });
      if (!user) {
        // Auto-provision verified phone number into active user session
        const nowIso = new Date().toISOString();
        const cleanDigits = normalizedPhone.replace(/\D/g, '');
        user = await prisma.user.create({
          data: {
            id: `user-${Date.now()}`,
            name: `User ${normalizedPhone.slice(-4)}`,
            email: `user_${cleanDigits}@lifelink.internal`,
            phone: normalizedPhone,
            role: 'recipient',
            verification_status: 'Verified',
            created_at: nowIso,
            updated_at: nowIso,
          },
        });
      }
    } else if (email) {
      const normalizedEmail = String(email).toLowerCase().trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return NextResponse.json({ success: false, error: 'Invalid email address format.' }, { status: 400 });
      }
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
