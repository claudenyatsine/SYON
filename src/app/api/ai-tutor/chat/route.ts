import { NextResponse } from 'next/server';
import { buildAITutorSystemPrompt, AITutorContext } from '@/lib/ai-tutor/system-prompts';
import { getSmartCurriculumResponse } from '@/lib/ai-tutor/curriculum-knowledge';

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const tutorContext: AITutorContext = context || {};
    const systemPrompt = buildAITutorSystemPrompt(tutorContext);

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    // 1. Try OpenAI if API key starts with 'sk-'
    if (OPENAI_API_KEY && OPENAI_API_KEY.startsWith('sk-')) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages.map((m: any) => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content,
              })),
            ],
            temperature: 0.7,
            max_tokens: 1500,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.choices?.[0]?.message?.content || 'I am ready to help you learn! What topic shall we explore?';
          return NextResponse.json({ reply, model: 'gpt-4o-mini' });
        }
      } catch (e) {
        console.warn('[AI Tutor Chat] OpenAI attempt failed, trying fallback...', e);
      }
    }

    // 2. Fallback / Gemini API
    const googleKey = (GEMINI_API_KEY && !GEMINI_API_KEY.startsWith('your_')) 
      ? GEMINI_API_KEY 
      : (OPENAI_API_KEY && OPENAI_API_KEY.startsWith('AIza') ? OPENAI_API_KEY : null);

    if (googleKey) {
      try {
        const contents = [
          {
            role: 'user',
            parts: [{ text: `System Instruction:\n${systemPrompt}\n\nPlease acknowledge and assist the student based on their conversation history.` }],
          },
          {
            role: 'model',
            parts: [{ text: "Understood. I am Dr Max AI Tutor, ready to guide the student with clear, curriculum-aligned Socratic explanations." }],
          },
          ...messages.map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
          })),
        ];

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1500,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return NextResponse.json({ reply, model: 'gemini-1.5-flash' });
          }
        }
      } catch (e) {
        console.warn('[AI Tutor Chat] Gemini call failed:', e);
      }
    }

    // 3. Intelligent Curriculum-Aligned Response Engine
    const lastUserMsg = messages[messages.length - 1]?.content || '';
    const isFirstMessage = messages.length <= 1;

    let responseContent = getSmartCurriculumResponse(
      tutorContext.subjectName || 'General Studies',
      lastUserMsg,
      tutorContext.mode || 'socratic'
    );

    // Only add a brief greeting on the very first turn if desired
    if (isFirstMessage && tutorContext.studentName) {
      const firstName = tutorContext.studentName.split(' ')[0];
      responseContent = `Hello ${firstName}! Let's dive into **${tutorContext.subjectName || 'your course'}**.\n\n${responseContent}`;
    }

    return NextResponse.json({
      reply: responseContent,
      model: 'dr-max-curriculum-engine',
    });
  } catch (err: any) {
    console.error('[AI Tutor Chat Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
