import { NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { buildAITutorSystemPrompt } from '@/lib/ai-tutor/system-prompts';

// Agora Conversational AI API endpoint (v2)
// Documentation: https://docs.agora.io/en/conversational-ai/rest-api/join

export async function POST(req: Request) {
  try {
    const { 
      channelName, 
      uid, 
      subjectName, 
      studentName, 
      curriculumBoard, 
      studentLevel, 
      topic,
      voice = 'alloy'
    } = await req.json();

    if (!channelName) {
      return NextResponse.json({ error: 'Missing channelName' }, { status: 400 });
    }

    const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || process.env.AGORA_APP_ID;
    const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
    const AGORA_CUSTOMER_ID = process.env.AGORA_CUSTOMER_ID;
    const AGORA_CUSTOMER_SECRET = process.env.AGORA_CUSTOMER_SECRET;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
      return NextResponse.json(
        { error: 'Agora credentials (AGORA_APP_ID, AGORA_APP_CERTIFICATE) are missing.' },
        { status: 500 }
      );
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured in .env.local.' },
        { status: 500 }
      );
    }

    // 1. Basic Auth credentials: Agora REST APIs require Customer ID & Customer Secret
    // If not separately provided, try App ID and App Certificate as fallback.
    const authUser = AGORA_CUSTOMER_ID || AGORA_APP_ID;
    const authSecret = AGORA_CUSTOMER_SECRET || AGORA_APP_CERTIFICATE;
    const credentials = Buffer.from(`${authUser}:${authSecret}`).toString('base64');

    // 2. Generate a dedicated RTC token for the AI Agent (UID 999999)
    const agentUid = 999999;
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const agentRtcToken = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      agentUid,
      RtcRole.PUBLISHER,
      privilegeExpiredTs
    );

    const agentName = `AI_Tutor_${channelName.replace(/[^a-zA-Z0-9_]/g, '_')}_${Date.now()}`;

    // 3. Build dynamic Socratic curriculum prompt
    const systemPrompt = buildAITutorSystemPrompt({
      studentName: studentName || 'Student',
      curriculumBoard: curriculumBoard || 'ZIMSEC & Cambridge',
      studentLevel: studentLevel || 'O-Level / A-Level',
      subjectName: subjectName || 'General Studies',
      topic: topic,
      mode: 'socratic'
    });

    // 4. Payload for Agora Conversational AI Agent v2 REST API
    const payload = {
      name: agentName,
      properties: {
        channel: channelName,
        token: agentRtcToken,
        agent_rtc_uid: String(agentUid),
        remote_rtc_uids: ['*'],
        idle_timeout: 300,
        asr: {
          language: 'en-US',
        },
        tts: {
          vendor: 'openai',
          params: {
            key: OPENAI_API_KEY,
            model: 'tts-1',
            voice: voice,
          },
        },
        llm: {
          url: 'https://api.openai.com/v1/chat/completions',
          api_key: OPENAI_API_KEY,
          system_messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
          ],
          params: {
            model: 'gpt-4o-mini',
          },
        },
        vad: {
          mode: 'interrupt',
        },
      },
    };

    const response = await fetch(
      `https://api.agora.io/api/conversational-ai-agent/v2/projects/${AGORA_APP_ID}/join`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Convo AI] Agora API error response:', response.status, errorText);

      let parsedErr: any = null;
      try {
        parsedErr = JSON.parse(errorText);
      } catch {}

      if (response.status === 401) {
        return NextResponse.json(
          {
            error:
              'Agora REST API authentication failed. Agora Conversational AI requires RESTful API credentials (AGORA_CUSTOMER_ID and AGORA_CUSTOMER_SECRET) from the Agora Console RESTful API section.',
            requiresRestCredentials: true,
            details: errorText,
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          error: parsedErr?.message || parsedErr?.error || 'Failed to start AI Agent',
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const agentId = data?.agent_id || data?.id || agentName;

    return NextResponse.json({
      success: true,
      agentId,
      agentName,
      agentUid,
    });
  } catch (err: any) {
    console.error('[Convo AI] Server error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE to stop the agent
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const agentId = url.searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
    }

    const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || process.env.AGORA_APP_ID;
    const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
    const AGORA_CUSTOMER_ID = process.env.AGORA_CUSTOMER_ID;
    const AGORA_CUSTOMER_SECRET = process.env.AGORA_CUSTOMER_SECRET;

    if (!AGORA_APP_ID) {
      return NextResponse.json({ error: 'Missing AGORA_APP_ID' }, { status: 500 });
    }

    const authUser = AGORA_CUSTOMER_ID || AGORA_APP_ID;
    const authSecret = AGORA_CUSTOMER_SECRET || AGORA_APP_CERTIFICATE || '';
    const credentials = Buffer.from(`${authUser}:${authSecret}`).toString('base64');

    // Agora v2 stop endpoint is POST .../agents/{agentId}/leave
    const response = await fetch(
      `https://api.agora.io/api/conversational-ai-agent/v2/projects/${AGORA_APP_ID}/agents/${agentId}/leave`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${credentials}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('[Convo AI] Stop agent error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to stop AI agent', details: errorText },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Convo AI] Server delete error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
