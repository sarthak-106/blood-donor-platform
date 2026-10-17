import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { createSession } from '../session/route';

const SESSION_COOKIE = 'bdp_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const role = formData.get('role') as string;
    const name = (formData.get('name') as string)?.trim();
    const phone = (formData.get('phone') as string)?.replace(/\s+/g, '').trim();
    const email = (formData.get('email') as string)?.toLowerCase().trim() || null;

    // Validate required fields
    if (!role || !name || !phone) {
      return NextResponse.json({ success: false, error: 'Name and phone number are required.' }, { status: 400 });
    }

    if (!/^\+\d{10,15}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: 'Phone must include country code (e.g. +919876543210).' },
        { status: 400 }
      );
    }

    // Check for existing user
    const existingByPhone = await prisma.user.findFirst({ where: { phone } });
    if (existingByPhone) {
      return NextResponse.json(
        { success: false, error: 'An account with this phone number already exists. Please sign in.' },
        { status: 409 }
      );
    }

    if (email) {
      const existingByEmail = await prisma.user.findFirst({ where: { email } });
      if (existingByEmail) {
        return NextResponse.json(
          { success: false, error: 'An account with this email already exists. Please sign in.' },
          { status: 409 }
        );
      }
    }

    const now = new Date().toISOString();

    // Use a transaction to create user + donor profile atomically
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email: email || `noemail_${Date.now()}@placeholder.bdp`,
          phone,
          role,
          verification_status: 'Unverified',
          created_at: now,
          updated_at: now,
        },
      });

      // If donor, create donor profile
      if (role === 'donor') {
        const bloodGroup = (formData.get('blood_group') as string) || 'O+';
        const rareBloodType = (formData.get('rare_blood_type') as string)?.trim() || null;
        const city = (formData.get('city') as string)?.trim() || '';
        const state = (formData.get('state') as string)?.trim() || '';
        const area = (formData.get('area') as string)?.trim() || '';
        const pinCode = (formData.get('pin_code') as string)?.trim() || '';
        const dob = (formData.get('date_of_birth') as string) || null;
        const gender = (formData.get('gender') as string) || null;
        const availability = (formData.get('availability') as string) || 'Available';
        const preferredHospital = (formData.get('preferred_hospital') as string)?.trim() || null;

        await tx.donor.create({
          data: {
            user_id: user.id,
            name,
            email: email || '',
            phone,
            blood_group: rareBloodType ? `Rare: ${rareBloodType}` : bloodGroup,
            date_of_birth: dob,
            gender,
            city: city || state,
            area,
            pin_code: pinCode,
            availability,
            verification_status: 'Unverified',
            rating: 5.0,
            review_count: 0,
            emergency_ready: true,
            response_rate_percent: 100,
            avg_response_time: '15 mins',
            bio: preferredHospital ? `Preferred hospital: ${preferredHospital}` : null,
            updated_at: now,
          },
        });
      }

      return user;
    });

    // Create session
    const sessionId = createSession(result.id);
    const response = NextResponse.json({
      success: true,
      userId: result.id,
      role: result.role,
      message: 'Account created successfully!',
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
    console.error('[register]', err);
    if (err?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'An account with this email or phone already exists.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
