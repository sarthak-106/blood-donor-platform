import { NextResponse } from 'next/server';
import { deduceBloodTypeFromAntigens, RBC_COMPATIBILITY } from '@/lib/compatibility';
import { getGeminiClient } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { hasAntigenA, hasAntigenB, hasRhFactor, clinicalQuestion } = body;

    const result = deduceBloodTypeFromAntigens({
      hasAntigenA: Boolean(hasAntigenA),
      hasAntigenB: Boolean(hasAntigenB),
      hasRhFactor: Boolean(hasRhFactor),
    });

    let aiAdvice: string | null = null;
    const ai = getGeminiClient();

    if (clinicalQuestion && ai) {
      try {
        const prompt = `You are a clinical transfusion medicine consultant for an Indian blood bank.
The patient or donor has been determined to have blood group ${result.bloodGroup}.
Compatibilities:
- Can receive packed RBCs from: ${RBC_COMPATIBILITY[result.bloodGroup].canReceiveFrom.join(', ')}
- Can donate packed RBCs to: ${RBC_COMPATIBILITY[result.bloodGroup].canDonateTo.join(', ')}

User question: "${clinicalQuestion}"

Provide a concise, helpful 2-3 sentence answer following the Indian National Blood Transfusion Council (NBTC) guidelines. Emphasize that lab crossmatching is mandatory before transfusion.`;

        const interaction = await ai.interactions.create({
          model: 'gemini-3.8-flash',
          store: false,
          input: prompt,
        });

        aiAdvice = interaction.output_text || null;
      } catch (err: any) {
        console.warn('Gemini advice generation skipped:', err.message);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        compatibility: RBC_COMPATIBILITY[result.bloodGroup],
        aiClinicalAdvice: aiAdvice,
      },
      disclaimer: 'For educational screening only. Certified laboratory testing and cross-matching required before transfusion.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
