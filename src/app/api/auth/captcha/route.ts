import { NextResponse } from 'next/server';
import { generateCaptcha } from '@/lib/captcha';

export async function GET() {
  try {
    const challenge = generateCaptcha();
    return NextResponse.json({
      success: true,
      token: challenge.token,
      question: challenge.question,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Failed to generate CAPTCHA' }, { status: 500 });
  }
}
