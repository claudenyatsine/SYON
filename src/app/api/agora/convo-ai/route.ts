import { NextResponse } from 'next/server';

// Agora Conversational AI API endpoint
// Documentation: https://docs.agora.io/en/conversational-ai/

export async function POST(req: Request) {
  try {
    const { channelName, uid } = await req.json();

    if (!channelName || !uid) {
      return NextResponse.json({ error: 'Missing channelName or uid' }, { status: 400 });
    }

    const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || process.env.AGORA_APP_ID;
    const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE; // Server-side only
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Server-side only

    if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE || !OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Missing environment variables for Convo AI' }, { status: 500 });
    }

    // Generate a unique agent name for this session
    const agentName = `AI_Tutor_${channelName}_${Date.now()}`;

    // 1. Prepare the payload for Agora's Convo AI REST API
    // We are passing the OpenAI API key securely from the backend to Agora,
    // so the client never sees it.
    const payload = {
      appId: AGORA_APP_ID,
      channelName: channelName,
      // We pass 0 so the agent picks a random available UID
      uid: 0,
      agentName: agentName,
      idleTimeout: 300, // Terminate agent if no one speaks for 5 mins
      llm: {
        provider: "openai",
        apiKey: OPENAI_API_KEY,
        model: "gpt-4o",
        systemPrompt: "You are an AI teaching assistant inside a live online classroom for Dr Max LMS. You should be helpful, concise, and encourage students. If someone asks you a question, answer it clearly but keep your responses relatively brief so you don't dominate the voice channel.",
      },
      tts: {
        provider: "openai",
        voice: "alloy"
      },
      stt: {
        provider: "openai"
      }
    };

    // 2. We must use Basic Auth with our App ID and App Certificate
    const credentials = Buffer.from(`${AGORA_APP_ID}:${AGORA_APP_CERTIFICATE}`).toString('base64');

    // 3. Call Agora's REST API to spawn the agent into the channel
    const response = await fetch(`https://api.agora.io/v1/projects/${AGORA_APP_ID}/convo-ai/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[Convo AI] Agora API error:', errorData);
      return NextResponse.json({ error: 'Failed to start AI agent', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    
    // The response includes the agent_id, which we need to stop it later
    return NextResponse.json({ success: true, agentId: data.agent_id, agentName });
    
  } catch (err: any) {
    console.error('[Convo AI] Server error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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

        if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
            return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
        }

        const credentials = Buffer.from(`${AGORA_APP_ID}:${AGORA_APP_CERTIFICATE}`).toString('base64');

        const response = await fetch(`https://api.agora.io/v1/projects/${AGORA_APP_ID}/convo-ai/agents/${agentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Basic ${credentials}`
            }
        });

        if (!response.ok) {
            const errorData = await response.text();
            return NextResponse.json({ error: 'Failed to stop AI agent', details: errorData }, { status: response.status });
        }

        return NextResponse.json({ success: true });

    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
