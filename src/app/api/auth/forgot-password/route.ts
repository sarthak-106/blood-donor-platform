import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { hashPassword } from '@/lib/authCrypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, newPassword, otpVerified } = body;

    if (!identifier || !newPassword) {
      return NextResponse.json({ success: false, error: 'Identifier and new password are required.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    if (!otpVerified) {
      return NextResponse.json(
        { success: false, error: 'Please verify the OTP sent to your phone/email first.' },
        { status: 403 }
      );
    }

    // Find user
    const normalized = identifier.trim();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: normalized.replace(/\s+/g, '') },
          { email: normalized.toLowerCase() },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Account not found.' }, { status: 404 });
    }

    const newHash = hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash: newHash,
        updated_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true, message: 'Password has been reset successfully. Please sign in.' });
  } catch (err: any) {
    console.error('[forgot-password]', err);
    return NextResponse.json({ success: false, error: 'Failed to reset password.' }, { status: 500 });
  }
}
