import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { openai } from '@/lib/openai';
import { scrubPII } from '@prescriply/shared';
import { logAuditEvent } from '@/lib/audit';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // 1. Whisper Transcription
    // We convert File to a standard Buffer so the OpenAI library can read it
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    
    // Create a virtual file object with required metadata for the OpenAI API
    const file = await OpenAI.toFile(buffer, 'audio.webm', { type: 'audio/webm' });

    const whisperResponse = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
    });

    const rawTranscript = whisperResponse.text;
    if (!rawTranscript) {
      throw new Error('Transcription from Whisper was empty.');
    }

    // 2. Client/Server PII Scrubbing
    const scrubbedTranscript = scrubPII(rawTranscript);

    // 3. Structured Data Extraction via GPT-4o
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an advanced AI Clinical Scribe. Analyze the clinical transcript below and extract the medical data into a structured JSON.
          The output MUST follow this JSON schema exactly:
          {
            "chiefComplaints": ["string"],
            "diagnosis": "string",
            "medicines": [
              {
                "name": "string",
                "dosage": "string (e.g. 1+0+1, 1+1+1, 0+0+1)",
                "duration": "string (e.g. 7 days, 1 month)",
                "note": "string (e.g. After meals, empty stomach)"
              }
            ],
            "advice": "string",
            "investigations": ["string"]
          }`,
        },
        {
          role: 'user',
          content: `Here is the transcript: "${scrubbedTranscript}"`,
        },
      ],
    });

    const gptContent = chatResponse.choices[0]?.message?.content;
    if (!gptContent) {
      throw new Error('GPT-4o response content was empty.');
    }

    const structuredData = JSON.parse(gptContent);

    // 4. Audit Log
    await logAuditEvent({
      doctor_id: user.id,
      action: 'ai_scribe',
      success: true,
      details: `Scrubbed Transcript: ${scrubbedTranscript.substring(0, 150)}...`,
    });

    return NextResponse.json({
      success: true,
      transcript: rawTranscript,
      structuredData,
    });

  } catch (err: any) {
    console.error('AI Scribe Error:', err);

    // Audit failed event
    await logAuditEvent({
      doctor_id: user?.id || 'anonymous',
      action: 'ai_scribe',
      success: false,
      details: err.message || 'Unknown clinical scribe extraction error',
    });

    return NextResponse.json({
      success: false,
      error: err.message || 'Internal AI Scribe Pipeline Failure',
    }, { status: 500 });
  }
}
