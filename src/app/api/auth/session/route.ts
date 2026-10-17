import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

// Session store (use Redis/DB in production)
const sessionStore = new Map<string, { userId: string; expiresAt: number }>();
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SESSION_COOKIE = 'bdp_session';

export function createSession(userId: string): string {
  const sessionId = randomUUID();
  sessionStore.set(sessionId, { userId, expiresAt: Date.now() + SESSION_TTL_MS });
  return sessionId;
}

export function getSession(sessionId: string): { userId: string } | null {
  const session = sessionStore.get(sessionId);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessionStore.delete(sessionId);
    return null;
  }
  return { userId: session.userId };
}

// POST /api/auth/session → register or login, returns session cookie
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, phone, email, password, name, role } = body;

    if (action === 'login') {
      // Find user by phone or email
      let user = null;
      if (phone) {
        user = await prisma.user.findFirst({ where: { phone: phone.replace(/\s+/g, '').trim() } });
      } else if (email) {
        user = await prisma.user.findFirst({ where: { email: email.toLowerCase().trim() } });
      }

      if (!user) {
        return NextResponse.json({ success: false, error: 'No account found with these credentials.' }, { status: 401 });
      }

      const sessionId = createSession(user.id);
      const response = NextResponse.json({ success: true, user: sanitizeUser(user) });
      response.cookies.set(SESSION_COOKIE, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_TTL_MS / 1000,
        path: '/',
      });
      return response;
    }

    if (action === 'logout') {
      const cookieStore = await cookies();
      const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
      if (sessionId) sessionStore.delete(sessionId);
      const response = NextResponse.json({ success: true });
      response.cookies.delete(SESSION_COOKIE);
      return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (err: any) {
    console.error('[session]', err);
    return NextResponse.json({ success: false, error: 'Session error.' }, { status: 500 });
  }
}

// GET /api/auth/session → return current authenticated user
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

    if (!sessionId) {
      return NextResponse.json({ success: false, user: null });
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ success: false, user: null });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ success: false, user: null });
    }

    return NextResponse.json({ success: true, user: sanitizeUser(user) });
  } catch (err: any) {
    console.error('[get-session]', err);
    return NextResponse.json({ success: false, user: null });
  }
}

function sanitizeUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    profile_image: user.profile_image,
    verification_status: user.verification_status,
  };
}
