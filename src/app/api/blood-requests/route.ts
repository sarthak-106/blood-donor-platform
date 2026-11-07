import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { BloodGroup, RequestStatus } from '@/lib/types';
import { prisma } from '@/lib/prismaClient';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { verifyCaptcha } from '@/lib/captcha';
import { getSession, SESSION_COOKIE } from '@/lib/session';
import { ALL_BLOOD_GROUPS } from '@/lib/compatibility';
import { dispatchEmergencySosAlerts } from '@/lib/notifications';

export async function GET(request: NextRequest) {
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

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const body = await request.json();

    const {
      patient_name,
      blood_group,
      hospital,
      city,
      quantity_units,
      urgency,
      requester_phone,
      contact_number,
      is_emergency_sos,
      captchaToken,
      captchaAnswer,
      otp_verified,
      prescription_file_name,
      prescription_file_url,
    } = body;

    // 1. Validation of common fields
    if (!patient_name || typeof patient_name !== 'string' || patient_name.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Valid patient name is required.' }, { status: 400 });
    }

    if (!blood_group || !ALL_BLOOD_GROUPS.includes(blood_group)) {
      return NextResponse.json({ success: false, error: 'Valid blood group is required.' }, { status: 400 });
    }

    if (!hospital || typeof hospital !== 'string' || hospital.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Valid hospital name is required.' }, { status: 400 });
    }

    if (!city || typeof city !== 'string' || city.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Valid city name is required.' }, { status: 400 });
    }

    const units = Number(quantity_units);
    if (!Number.isInteger(units) || units < 1 || units > 50) {
      return NextResponse.json({ success: false, error: 'Units must be an integer between 1 and 50.' }, { status: 400 });
    }

    const phone = (requester_phone || contact_number || '').replace(/\s+/g, '').trim();
    if (!/^\+\d{10,15}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: 'Valid requester phone number with country code is required.' },
        { status: 400 }
      );
    }

    // 1b. Prescription / Requisition document is mandatory
    if (!prescription_file_name && !prescription_file_url) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Hospital Requisition or Doctor Prescription document is required. Please upload it before submitting.',
        },
        { status: 400 }
      );
    }

    // 2. Emergency SOS route security checks
    if (is_emergency_sos) {
      // Rate limiting: 3 SOS requests per 10 minutes per IP
      const rateCheck = checkRateLimit(`sos_${ip}`, 3, 10 * 60 * 1000);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: `Too many SOS broadcasts. Please wait ${rateCheck.resetSeconds} seconds before trying again.`,
          },
          { status: 429 }
        );
      }

      // CAPTCHA verification
      if (captchaToken || captchaAnswer) {
        const captchaRes = verifyCaptcha(captchaToken, captchaAnswer);
        if (!captchaRes.valid) {
          return NextResponse.json(
            { success: false, error: captchaRes.error || 'CAPTCHA verification failed.' },
            { status: 400 }
          );
        }
      }

      // Phone OTP verification check
      if (!otp_verified) {
        return NextResponse.json(
          { success: false, error: 'Phone number verification via OTP is required for Emergency SOS requests.' },
          { status: 400 }
        );
      }
    } else {
      // 3. Routine request: Requires authenticated session (role: recipient or admin)
      const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
      if (!sessionCookie) {
        return NextResponse.json(
          { success: false, error: 'Authentication required. Please sign in to create routine blood requests.' },
          { status: 401 }
        );
      }

      const session = getSession(sessionCookie);
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Session expired. Please sign in again.' },
          { status: 401 }
        );
      }

      const user = await prisma.user.findUnique({ where: { id: session.userId } });
      if (!user || (user.role !== 'recipient' && user.role !== 'admin')) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized. Only recipients or admins can create blood requests.' },
          { status: 403 }
        );
      }
    }

    // Create the request
    const newReq = db.createBloodRequest({
      ...body,
      quantity_units: units,
      requester_phone: phone,
      contact_number: phone,
      urgency: urgency || (is_emergency_sos ? 'Critical' : 'Normal'),
    });

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

    // Trigger SMS and WhatsApp notifications for Emergency SOS
    if (newReq.is_emergency_sos || newReq.urgency === 'Critical') {
      try {
        await dispatchEmergencySosAlerts({
          requestId: newReq.id,
          patientName: newReq.patient_name,
          bloodGroup: newReq.blood_group,
          hospital: newReq.hospital,
          city: newReq.city,
          units: Number(newReq.quantity_units),
          contactNumber: newReq.contact_number,
        });
      } catch (dispatchErr) {
        console.warn('SOS SMS/WhatsApp dispatch warning:', dispatchErr);
      }
    }

    return NextResponse.json({ success: true, data: newReq }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
