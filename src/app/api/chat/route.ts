import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * API route to handle UI connection to Google Gemini and stream the response
 * @param req Incoming request where the prompt is extracted
 * @returns ReadableStream response
 */
export async function POST(req: Request) {
  try {
    const { prompt: message, history } = await req.json();

    // Call the Google Gemini API to create a chat session
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: history,
      config: {
        systemInstruction:
          'Your name is Neubrai. Act as a human brain. Be concise and helpful.',
      },
    });

    // Send chat stream message to the API
    const messageStream = await chat.sendMessageStream({ message });

    // Create a ReadableStream to stream the response
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of messageStream) {
          const textEncoder = new TextEncoder();
          const encodedChunk = textEncoder.encode(chunk.text);

          // Enqueue the chunk to the stream
          controller.enqueue(encodedChunk);
        }

        controller.close();
      },
    });

    // Return the stream as a response
    return new Response(stream, {
      headers: {
        Connection: 'keep-alive',
        'Content-Encoding': 'none',
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-store',
      },
    });
  } catch (error: any) {
    console.error('Gemini API error:', error?.message || 'Unknown error');
    return new Response('Internal Server Error', { status: 500 });
  }
}
