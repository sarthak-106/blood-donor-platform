import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession, SESSION_COOKIE } from '@/lib/session';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: fileId } = await params;

    // Security check: user must be authenticated
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be signed in to access medical documents.' },
        { status: 401 }
      );
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session expired. Please sign in again.' },
        { status: 401 }
      );
    }

    // Sanitize fileId to prevent path traversal
    const safeFileId = path.basename(fileId);
    const filePath = path.join(process.cwd(), 'storage', 'documents', safeFileId);

    const fileBuffer = await readFile(filePath);

    // Determine mime type
    let mimeType = 'application/octet-stream';
    if (safeFileId.endsWith('.pdf')) mimeType = 'application/pdf';
    else if (safeFileId.endsWith('.png')) mimeType = 'image/png';
    else if (safeFileId.endsWith('.jpg') || safeFileId.endsWith('.jpeg')) mimeType = 'image/jpeg';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${safeFileId}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (err: any) {
    if (err?.code === 'ENOENT') {
      return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to access document.' }, { status: 500 });
  }
}
