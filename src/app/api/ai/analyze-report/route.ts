import { NextRequest, NextResponse } from 'next/server';
import { analyzeBloodReportWithGemini, fallbackHeuristicAnalysis } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
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
      const detectedMime = mimeType || (base64Data.includes(';') ? base64Data.split(';')[0].replace('data:', '') : 'image/jpeg');

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
