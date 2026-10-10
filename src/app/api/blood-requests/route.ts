import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { BloodGroup, RequestStatus } from '@/lib/types';
import { prisma } from '@/lib/prismaClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bloodGroup = searchParams.get('bloodGroup') as BloodGroup | undefined;
    const urgency = searchParams.get('urgency') || undefined;
    const status = searchParams.get('status') as RequestStatus | undefined;
    const city = searchParams.get('city') || undefined;

    // Try fetching from Prisma DB first
    try {
      const where: any = {};
      if (bloodGroup) where.blood_group = bloodGroup;
      if (urgency) where.urgency = urgency;
      if (status) where.status = status;
      if (city) where.city = { contains: city };

      const dbRequests = await prisma.bloodRequest.findMany({
        where,
        orderBy: { created_at: 'desc' },
      });

      if (dbRequests && dbRequests.length > 0) {
        return NextResponse.json({
          success: true,
          count: dbRequests.length,
          data: dbRequests,
          source: 'prisma_database',
        });
      }
    } catch (dbErr) {
      console.warn('Prisma query skipped, using memory store:', dbErr);
    }

    // Fallback to in-memory state
    const requests = db.getBloodRequests({
      bloodGroup,
      urgency,
      status,
      city,
    });

    return NextResponse.json({
      success: true,
      count: requests.length,
      data: requests,
      source: 'memory_store',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newReq = db.createBloodRequest(body);

    // Also persist into Prisma database asynchronously
    try {
      await prisma.bloodRequest.upsert({
        where: { id: newReq.id },
        update: {},
        create: {
          id: newReq.id,
          requester_id: newReq.requester_id,
          requester_name: newReq.requester_name,
          requester_phone: newReq.requester_phone,
          patient_name: newReq.patient_name,
          blood_group: newReq.blood_group,
          hospital: newReq.hospital,
          city: newReq.city,
          quantity_units: Number(newReq.quantity_units),
          urgency: newReq.urgency,
          status: newReq.status,
          is_emergency_sos: Boolean(newReq.is_emergency_sos),
          contact_number: newReq.contact_number,
          notes: newReq.notes || null,
          prescription_file_name: newReq.prescription_file_name || null,
          prescription_file_url: newReq.prescription_file_url || null,
          created_at: newReq.created_at,
          updated_at: newReq.updated_at,
        },
      });
    } catch (prismaErr) {
      console.warn('Prisma persistence note:', prismaErr);
    }

    return NextResponse.json({ success: true, data: newReq }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
