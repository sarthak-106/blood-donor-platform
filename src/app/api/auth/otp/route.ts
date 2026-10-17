import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { randomInt } from 'crypto';

// In-memory OTP store (in production use Redis or a DB table)
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

// Rate limiting: max 3 OTP requests per phone per 10 minutes
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, action } = body;

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ success: false, error: 'Valid phone number is required.' }, { status: 400 });
    }

    // Sanitize phone
    const normalizedPhone = phone.replace(/\s+/g, '').trim();
    if (!/^\+\d{10,15}$/.test(normalizedPhone)) {
      return NextResponse.json(
        { success: false, error: 'Phone number must include country code (e.g. +91 98765 43210).' },
        { status: 400 }
      );
    }

    // Rate limiting
    const now = Date.now();
    const rateKey = `rl_${normalizedPhone}`;
    const rateEntry = rateLimitStore.get(rateKey);

    if (rateEntry) {
      if (now - rateEntry.windowStart < RATE_WINDOW_MS) {
        if (rateEntry.count >= RATE_LIMIT) {
          const waitMin = Math.ceil((RATE_WINDOW_MS - (now - rateEntry.windowStart)) / 60000);
          return NextResponse.json(
            { success: false, error: `Too many OTP requests. Please wait ${waitMin} minute(s) before trying again.` },
            { status: 429 }
          );
        }
        rateEntry.count++;
      } else {
        rateLimitStore.set(rateKey, { count: 1, windowStart: now });
      }
    } else {
      rateLimitStore.set(rateKey, { count: 1, windowStart: now });
    }

    // Generate 6-digit OTP
    const otp = String(randomInt(100000, 999999));
    const expiresAt = now + OTP_TTL_MS;

    otpStore.set(normalizedPhone, { otp, expiresAt, attempts: 0 });

    // In production: send via SMS gateway (Twilio, MSG91, Fast2SMS for India, etc.)
    // For now, log to console — in dev mode the OTP is returned in response for testing
    console.log(`[OTP] Phone: ${normalizedPhone} → Code: ${otp} (expires in 5 min)`);

    const isDev = process.env.NODE_ENV === 'development';

    return NextResponse.json({
      success: true,
      message: `OTP sent to ${normalizedPhone}. Valid for 5 minutes.`,
      // Only reveal OTP in development mode for testing
      ...(isDev && { devOtp: otp }),
    });
  } catch (err: any) {
    console.error('[send-otp]', err);
    return NextResponse.json({ success: false, error: 'Failed to send OTP. Please try again.' }, { status: 500 });
  }
}

// Verify OTP — POST to same route with { phone, otp, action: 'verify' }
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json({ success: false, error: 'Phone and OTP are required.' }, { status: 400 });
    }

    const normalizedPhone = phone.replace(/\s+/g, '').trim();
    const stored = otpStore.get(normalizedPhone);

    if (!stored) {
      return NextResponse.json(
        { success: false, error: 'No OTP found for this number. Please request a new one.' },
        { status: 400 }
      );
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(normalizedPhone);
      return NextResponse.json(
        { success: false, error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (stored.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(normalizedPhone);
      return NextResponse.json(
        { success: false, error: 'Too many incorrect attempts. Please request a new OTP.' },
        { status: 400 }
      );
    }

    if (stored.otp !== String(otp).trim()) {
      stored.attempts++;
      const remaining = MAX_ATTEMPTS - stored.attempts;
      return NextResponse.json(
        { success: false, error: `Incorrect OTP. ${remaining} attempt(s) remaining.` },
        { status: 400 }
      );
    }

    // OTP valid — delete it to prevent reuse
    otpStore.delete(normalizedPhone);

    return NextResponse.json({ success: true, message: 'Phone number verified successfully.' });
  } catch (err: any) {
    console.error('[verify-otp]', err);
    return NextResponse.json({ success: false, error: 'Verification failed. Please try again.' }, { status: 500 });
  }
}
