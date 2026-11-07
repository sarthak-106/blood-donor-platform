import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'bdp_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add security headers to ALL responses
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://api.dicebear.com",
      "connect-src 'self' https://generativelanguage.googleapis.com",
      "frame-ancestors 'none'",
    ].join('; ')
  );

  // Exemption: Emergency SOS allows direct access because it requires its own Phone OTP and CAPTCHA
  if (pathname === '/recipient/emergency-sos') {
    return response;
  }

  const isAdminRoute = pathname.startsWith('/admin');
  const isDonorRoute = pathname.startsWith('/donor');
  const isRecipientRoute = pathname.startsWith('/recipient');

  if (!isAdminRoute && !isDonorRoute && !isRecipientRoute) {
    return response;
  }

  // Check session cookie
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;

  if (!sessionToken) {
    const loginUrl = new URL('/auth', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('reason', 'auth_required');
    return NextResponse.redirect(loginUrl);
  }

  // Verify session and role via internal session endpoint
  try {
    const sessionUrl = new URL('/api/auth/session', request.url);
    const sessionRes = await fetch(sessionUrl.toString(), {
      headers: { cookie: `${SESSION_COOKIE}=${sessionToken}` },
    });

    if (!sessionRes.ok) {
      const loginUrl = new URL('/auth', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('reason', 'session_invalid');
      return NextResponse.redirect(loginUrl);
    }

    const sessionData = await sessionRes.json();
    const user = sessionData?.user;

    if (!user) {
      const loginUrl = new URL('/auth', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('reason', 'session_expired');
      return NextResponse.redirect(loginUrl);
    }

    // Role check for Admin routes: ONLY admin
    if (isAdminRoute) {
      if (user.role !== 'admin') {
        const dest = user.role === 'donor' ? '/donor/dashboard' : '/recipient/dashboard';
        return NextResponse.redirect(new URL(dest, request.url));
      }
    }

    // Role check for Donor routes: donor or admin
    if (isDonorRoute) {
      if (user.role !== 'donor' && user.role !== 'admin') {
        return NextResponse.redirect(new URL('/recipient/dashboard', request.url));
      }
    }

    // Role check for Recipient routes: recipient or admin
    if (isRecipientRoute) {
      if (user.role !== 'recipient' && user.role !== 'admin') {
        return NextResponse.redirect(new URL('/donor/dashboard', request.url));
      }
    }
  } catch (err) {
    // If validation fails unexpectedly, redirect to auth
    const loginUrl = new URL('/auth', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
};
