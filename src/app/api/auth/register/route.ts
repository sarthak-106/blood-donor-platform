import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { createSession, SESSION_COOKIE, SESSION_TTL_MS } from '@/lib/session';
import { hashPassword } from '@/lib/authCrypto';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import os from 'os';
import { randomUUID } from 'crypto';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { verifyCaptcha } from '@/lib/captcha';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

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
    const ip = getClientIp(req.headers);
    const rateCheck = checkRateLimit(`register_${ip}`, 10, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many registration attempts. Please wait ${rateCheck.resetSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const formData = await req.formData();

    const captchaToken = formData.get('captcha_token') as string | null;
    const captchaAnswer = formData.get('captcha_answer') as string | null;
    if (captchaToken || captchaAnswer) {
      const captchaRes = verifyCaptcha(captchaToken, captchaAnswer);
      if (!captchaRes.valid) {
        return NextResponse.json({ success: false, error: captchaRes.error || 'CAPTCHA verification failed.' }, { status: 400 });
      }
    }

    const role = formData.get('role') as string;
    const name = (formData.get('name') as string)?.trim();
    const rawPhone = (formData.get('phone') as string) || '';
    const phone = normalizePhoneNumber(rawPhone);
    const email = (formData.get('email') as string)?.toLowerCase().trim() || null;
    const password = (formData.get('password') as string) || null;
    const consent = formData.get('consent');

    if (role === 'donor' && !consent) {
      return NextResponse.json(
        { success: false, error: 'You must confirm that the information provided is accurate and agree to the privacy policy.' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!role || !name || !phone) {
      return NextResponse.json({ success: false, error: 'Name and phone number are required.' }, { status: 400 });
    }

    if (!/^\+\d{10,15}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: 'Enter a valid 10-digit mobile number or number with country code (e.g. +91 98765 43210).' },
        { status: 400 }
      );
    }

    // Check for existing user by phone
    const existingByPhone = await prisma.user.findFirst({ where: { phone } });

    // Hash password if supplied
    const passwordHash = password ? hashPassword(password) : null;
    const now = new Date().toISOString();
    const refNumber = `BDP-${Date.now().toString(36).toUpperCase()}`;

    // Process file upload (Mandatory for recipient blood request)
    let savedDocMeta: { fileName: string; fileSize: number; mimeType: string; securePath: string } | null = null;
    const requestDocFile = formData.get('request_document') as File | null;

    if (role === 'recipient') {
      if (!requestDocFile || requestDocFile.size === 0) {
        return NextResponse.json(
          { success: false, error: 'Upload Blood Request Form is mandatory. Please attach a doctor prescription, hospital requisition slip, or medical authorization.' },
          { status: 400 }
        );
      }
    }

    if (requestDocFile && requestDocFile.size > 0) {
      if (requestDocFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: 'Uploaded document exceeds maximum allowed size of 5 MB.' },
          { status: 400 }
        );
      }
      if (!ALLOWED_MIME_TYPES.includes(requestDocFile.type)) {
        return NextResponse.json(
          { success: false, error: 'Invalid document type. Only PDF, JPG, JPEG, and PNG files are accepted.' },
          { status: 400 }
        );
      }

      // Save to private storage (use os.tmpdir() on serverless platforms)
      const storageDir = path.join(os.tmpdir(), 'blood_documents');
      try {
        await mkdir(storageDir, { recursive: true });
        const fileExt = path.extname(requestDocFile.name) || '.bin';
        const secureFileName = `${randomUUID()}${fileExt}`;
        const filePath = path.join(storageDir, secureFileName);
        const arrayBuffer = await requestDocFile.arrayBuffer();
        await writeFile(filePath, Buffer.from(arrayBuffer));
        savedDocMeta = {
          fileName: requestDocFile.name,
          fileSize: requestDocFile.size,
          mimeType: requestDocFile.type,
          securePath: secureFileName,
        };
      } catch (fileErr) {
        console.error('File write warning in serverless:', fileErr);
        savedDocMeta = {
          fileName: requestDocFile.name,
          fileSize: requestDocFile.size,
          mimeType: requestDocFile.type,
          securePath: `doc-${randomUUID()}`,
        };
      }
    }

    // Use a transaction to create or update user and related profiles atomically
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create or Update User
      let user = existingByPhone;
      if (user) {
        user = await tx.user.update({
          where: { id: user.id },
          data: {
            name,
            role,
            password_hash: passwordHash || user.password_hash,
            verification_status: 'Verified',
            updated_at: now,
          },
        });
      } else {
        const cleanDigits = phone.replace(/\D/g, '');
        user = await tx.user.create({
          data: {
            name,
            email: email || `user_${cleanDigits}@blooddonor.internal`,
            phone,
            password_hash: passwordHash,
            role,
            verification_status: 'Verified',
            created_at: now,
            updated_at: now,
          },
        });
      }

      // 2. If Donor, create or update Donor profile
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

        const existingDonor = await tx.donor.findFirst({ where: { user_id: user.id } });
        if (existingDonor) {
          await tx.donor.update({
            where: { id: existingDonor.id },
            data: {
              name,
              phone,
              blood_group: rareBloodType ? `Rare: ${rareBloodType}` : bloodGroup,
              city: city || state,
              area,
              pin_code: pinCode,
              availability,
              emergency_ready: true,
              bio: preferredHospital ? `Preferred hospital: ${preferredHospital}` : existingDonor.bio,
              updated_at: now,
            },
          });
        } else {
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
              verification_status: 'Verified',
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
      }

      // 3. If Recipient, create Recipient profile & initial BloodRequest
      if (role === 'recipient') {
        const relationship = (formData.get('relationship') as string) || 'Self';
        const bloodGroup = (formData.get('blood_group') as string) || 'Unknown';
        const quantityUnits = parseInt((formData.get('quantity_units') as string) || '1', 10);
        const hospital = (formData.get('hospital') as string)?.trim() || '';
        const city = (formData.get('city') as string)?.trim() || '';
        const state = (formData.get('state') as string)?.trim() || '';
        const urgency = (formData.get('urgency') as string) || 'Normal';
        const notes = (formData.get('notes') as string)?.trim() || null;

        // Recipient Profile
        await tx.recipientProfile.create({
          data: {
            user_id: user.id,
            patient_name: name,
            relationship,
            created_at: now,
            updated_at: now,
          },
        });

        // Blood Request
        const bloodRequest = await tx.bloodRequest.create({
          data: {
            id: refNumber,
            requester_id: user.id,
            requester_name: name,
            requester_phone: phone,
            patient_name: name,
            blood_group: bloodGroup,
            hospital: hospital || `${city} General Hospital`,
            city: city || state,
            quantity_units: quantityUnits,
            urgency,
            status: 'Open',
            is_emergency_sos: urgency === 'Critical',
            contact_number: phone,
            notes,
            prescription_file_name: savedDocMeta?.fileName || null,
            prescription_file_url: savedDocMeta?.securePath ? `/api/documents/${savedDocMeta.securePath}` : null,
            created_at: now,
            updated_at: now,
          },
        });

        // Protected document record
        if (savedDocMeta) {
          await tx.bloodRequestDocument.create({
            data: {
              request_id: bloodRequest.id,
              file_name: savedDocMeta.fileName,
              file_size: savedDocMeta.fileSize,
              mime_type: savedDocMeta.mimeType,
              secure_path: savedDocMeta.securePath,
              uploaded_at: now,
            },
          });
        }
      }

      // 4. Record successful verification log
      await tx.verificationRecord.create({
        data: {
          identifier: phone,
          otp_code: 'VERIFIED',
          type: 'phone_verification',
          attempts: 1,
          expires_at: now,
          verified: true,
          created_at: now,
        },
      });

      return user;
    });

    // Create session cookie
    const sessionId = createSession(result.id, result.role);
    const response = NextResponse.json({
      success: true,
      userId: result.id,
      role: result.role,
      refNumber,
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
        { success: false, error: 'An account with this email or phone number already exists.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
