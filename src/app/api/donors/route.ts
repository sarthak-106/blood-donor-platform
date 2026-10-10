import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { BloodGroup, DonorAvailability } from '@/lib/types';
import { prisma } from '@/lib/prismaClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bloodGroup = searchParams.get('bloodGroup') as BloodGroup | undefined;
    const includeCompatible = searchParams.get('includeCompatible') === 'true';
    const city = searchParams.get('city') || undefined;
    const availability = (searchParams.get('availability') as DonorAvailability) || undefined;
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
    const searchQuery = searchParams.get('q') || undefined;

    // Try fetching from Prisma DB
    try {
      const where: any = {};
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
          data: dbDonors,
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
      data: donors,
      source: 'memory_store',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = db.createDonor(body);

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
