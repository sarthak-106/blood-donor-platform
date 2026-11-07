import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { cookies } from 'next/headers';
import { getSession, deleteSession, SESSION_COOKIE } from '@/lib/session';
import { db } from '@/lib/db';

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Session expired' }, { status: 401 });
    }

    const userId = session.userId;

    // Delete associated Prisma records safely
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        if (user.phone || user.email) {
          const identifiers = [user.phone, user.email].filter(Boolean);
          await prisma.verificationRecord.deleteMany({
            where: { identifier: { in: identifiers } },
          });
        }
      }
      await prisma.donor.deleteMany({ where: { user_id: userId } });
      await prisma.recipientProfile.deleteMany({ where: { user_id: userId } });
      await prisma.user.deleteMany({ where: { id: userId } });
    } catch (dbErr) {
      console.warn('Prisma account deletion note:', dbErr);
    }

    // Also remove from in-memory store
    try {
      const donor = db.getDonorByUserId(userId);
      if (donor) {
        db.deleteDonor(donor.id);
      }
    } catch (e) {
      console.warn('In-memory donor delete note:', e);
    }

    // Destroy session and cookie
    deleteSession(sessionId);
    const response = NextResponse.json({
      success: true,
      message: 'Account and associated donor profile have been permanently deleted.',
    });
    response.cookies.delete(SESSION_COOKIE);

    return response;
  } catch (err: any) {
    console.error('[delete-account]', err);
    return NextResponse.json({ success: false, error: 'Failed to delete account. Please try again.' }, { status: 500 });
  }
}
