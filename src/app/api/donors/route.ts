import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { BloodGroup, DonorAvailability } from '@/lib/types';
import { prisma } from '@/lib/prismaClient';
import { getSession, SESSION_COOKIE } from '@/lib/session';
import { ALL_BLOOD_GROUPS } from '@/lib/compatibility';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bloodGroup = searchParams.get('bloodGroup') as BloodGroup | undefined;
    const includeCompatible = searchParams.get('includeCompatible') === 'true';
    const city = searchParams.get('city') || undefined;
    const availability = (searchParams.get('availability') as DonorAvailability) || undefined;
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
    const searchQuery = searchParams.get('q') || undefined;

    const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
    const session = sessionCookie ? getSession(sessionCookie) : null;
    const isAuthenticated = Boolean(session && session.userId);

    const sanitizeDonor = (d: any) => {
      if (isAuthenticated) return { ...d, isContactMasked: false };
      const rawPhone = d.phone || '';
      const cleanPhone = String(rawPhone).trim();
      const maskedPhone = cleanPhone.length > 4 ? `+91 ••••• ••${cleanPhone.slice(-4)}` : '+91 ••••• •••••';
      let maskedEmail = '';
      if (d.email && String(d.email).includes('@')) {
        const [u, dom] = String(d.email).split('@');
        maskedEmail = `${u.slice(0, 2)}•••@${dom}`;
      }
      return {
        ...d,
        phone: maskedPhone,
        email: maskedEmail,
        isContactMasked: true,
        latitude: d.latitude ? Math.round(Number(d.latitude) * 100) / 100 : null,
        longitude: d.longitude ? Math.round(Number(d.longitude) * 100) / 100 : null,
      };
    };

    // Try fetching from Prisma DB
    try {
      const where: any = {
        visibility: { not: 'Private' },
      };
      if (bloodGroup && bloodGroup !== ('All' as any)) {
        where.blood_group = bloodGroup;
      }
      if (city) {
        where.city = { contains: city };
      }
      if (availability) {
        where.availability = availability;
      }
      if (verifiedOnly) {
        where.verification_status = 'Verified';
      }

      const dbDonors = await prisma.donor.findMany({
        where,
        orderBy: { rating: 'desc' },
      });

      if (dbDonors && dbDonors.length > 0) {
        return NextResponse.json({
          success: true,
          count: dbDonors.length,
          data: dbDonors.map(sanitizeDonor),
          source: 'prisma_database',
        });
      }
    } catch (dbErr) {
      console.warn('Prisma donor query skipped, using memory store:', dbErr);
    }

    // Fallback to in-memory state
    const donors = db.getDonors({
      bloodGroup: bloodGroup && bloodGroup !== ('All' as any) ? bloodGroup : undefined,
      includeCompatible,
      city,
      availability,
      verifiedOnly,
      searchQuery,
    });

    return NextResponse.json({
      success: true,
      count: donors.length,
      data: donors.map(sanitizeDonor),
      source: 'memory_store',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Role check: Only authenticated donor or admin can create/modify donor profile
    const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    const session = getSession(sessionCookie);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Session expired.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || (user.role !== 'donor' && user.role !== 'admin')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Only donor or admin accounts can perform this action.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ success: false, error: 'Donor name is required.' }, { status: 400 });
    }

    if (!body.blood_group || !ALL_BLOOD_GROUPS.includes(body.blood_group)) {
      return NextResponse.json({ success: false, error: 'Valid blood group is required.' }, { status: 400 });
    }

    if (!body.city || typeof body.city !== 'string') {
      return NextResponse.json({ success: false, error: 'City is required.' }, { status: 400 });
    }

    const created = db.createDonor({
      ...body,
      user_id: user.id,
    });

    // Also persist into Prisma database asynchronously
    try {
      await prisma.donor.upsert({
        where: { id: created.id },
        update: {},
        create: {
          id: created.id,
          user_id: created.user_id,
          name: created.name,
          email: created.email || '',
          phone: created.phone || '',
          blood_group: created.blood_group,
          city: created.city,
          area: created.area,
          pin_code: created.pin_code,
          latitude: created.latitude || null,
          longitude: created.longitude || null,
          availability: created.availability,
          total_donations: created.total_donations,
          verification_status: created.verification_status,
          rating: created.rating,
          badge_title: created.badge_title || null,
          bio: created.bio || null,
          emergency_ready: created.emergency_ready,
          response_rate_percent: created.response_rate_percent,
          avg_response_time: created.avg_response_time,
          updated_at: created.updated_at,
        },
      });
    } catch (prismaErr) {
      console.warn('Prisma donor persistence note:', prismaErr);
    }

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
