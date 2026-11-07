import { NextRequest, NextResponse } from 'next/server';
import { analyzeBloodReportWithGemini, fallbackHeuristicAnalysis } from '@/lib/gemini';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const MAX_REPORT_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);

    // Rate limiting: 10 report analyses per 10 minutes per IP
    const rateCheck = checkRateLimit(`ai_scan_${ip}`, 10, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Rate limit reached. Please wait ${rateCheck.resetSeconds} seconds before scanning another report.`,
        },
        { status: 429 }
      );
    }

    const contentType = req.headers.get('content-type') || '';

    // Handle JSON body with base64
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { base64Data, mimeType, fileName } = body;

      if (!base64Data) {
        return NextResponse.json(
          { success: false, error: 'No base64 document data provided' },
          { status: 400 }
        );
      }

      // Clean base64 header if included (e.g. data:image/png;base64,...)
      const cleanedBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
      const detectedMime =
        mimeType ||
        (base64Data.includes(';')
          ? base64Data.split(';')[0].replace('data:', '')
          : 'image/jpeg');

      if (!ALLOWED_MIME_TYPES.includes(detectedMime.toLowerCase())) {
        return NextResponse.json(
          {
            success: false,
            error: 'Unsupported document format. Only PDF, JPG, PNG, and WEBP lab reports are accepted.',
          },
          { status: 400 }
        );
      }

      const approxSize = Math.ceil((cleanedBase64.length * 3) / 4);
      if (approxSize > MAX_REPORT_SIZE) {
        return NextResponse.json(
          { success: false, error: 'Report file exceeds the 10 MB size limit.' },
          { status: 400 }
        );
      }

      const analysis = await analyzeBloodReportWithGemini(cleanedBase64, detectedMime, fileName);
      return NextResponse.json({ success: true, data: analysis });
    }

    // Handle multipart FormData
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No file uploaded in form data' },
          { status: 400 }
        );
      }

      if (file.size > MAX_REPORT_SIZE) {
        return NextResponse.json(
          { success: false, error: 'Report file exceeds maximum allowed size of 10 MB.' },
          { status: 400 }
        );
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid file type. Only PDF, JPG, PNG, and WEBP medical documents are accepted.',
          },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const base64Data = buffer.toString('base64');
      const analysis = await analyzeBloodReportWithGemini(base64Data, file.type, file.name);

      return NextResponse.json({ success: true, data: analysis });
    }

    return NextResponse.json(
      { success: false, error: 'Unsupported Content-Type. Send JSON with base64Data or FormData with file.' },
      { status: 415 }
    );
  } catch (error: any) {
    console.error('API /api/ai/analyze-report error:', error);
    const fallback = fallbackHeuristicAnalysis('error-recovery-slip.pdf');
    return NextResponse.json({
      success: true,
      data: fallback,
      warning: error.message,
    });
  }
}
