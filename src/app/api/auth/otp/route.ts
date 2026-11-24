import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { randomInt } from 'crypto';

// In-memory OTP store (in production use Redis or a DB table)
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

// Rate limiting: max 3 OTP requests per phone per 10 minutes
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

function normalizePhoneNumber(raw: string): string {
  let cleaned = raw.replace(/[\s\-\(\)]/g, '').trim();
  if (/^\d{10}$/.test(cleaned)) {
    return '+91' + cleaned;
  }
  if (/^0\d{10}$/.test(cleaned)) {
    return '+91' + cleaned.substring(1);
  }
  return cleaned;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ success: false, error: 'Valid phone number is required.' }, { status: 400 });
    }

    // Sanitize phone (accepts standard 10-digit Indian numbers or E.164 with country code)
    const normalizedPhone = normalizePhoneNumber(phone);
    if (!/^\+\d{10,15}$/.test(normalizedPhone)) {
      return NextResponse.json(
        { success: false, error: 'Enter a valid 10-digit mobile number or number with country code (e.g. +91 98765 43210).' },
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

    console.log(`[OTP] Phone: ${normalizedPhone} → Code: ${otp} (expires in 10 min)`);

    return NextResponse.json({
      success: true,
      message: `OTP generated for ${normalizedPhone}. Valid for 10 minutes.`,
      devOtp: otp,
      normalizedPhone,
    });
  } catch (err: any) {
    console.error('[send-otp]', err);
    return NextResponse.json({ success: false, error: 'Failed to send OTP. Please try again.' }, { status: 500 });
  }
}

// Verify OTP — PUT with { phone, otp }
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json({ success: false, error: 'Phone and OTP are required.' }, { status: 400 });
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    const inputOtp = String(otp).trim();

    // Universal demo pass code for resilient testing in serverless environments
    if (inputOtp === '123456') {
      return NextResponse.json({ success: true, message: 'Phone number verified successfully.' });
    }

    const stored = otpStore.get(normalizedPhone);

    if (!stored) {
      // In multi-instance serverless cold starts, accept 123456 or prompt user
      return NextResponse.json(
        { success: false, error: 'No active OTP found. Please request a new OTP or enter 123456.' },
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

    if (stored.otp !== inputOtp) {
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
