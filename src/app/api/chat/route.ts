import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * API route to handle UI connection to Google Gemini and stream the response
 * @param req Incoming request where the prompt is extracted
 * @returns ReadableStream response
 */
export async function POST(req: Request) {
  const { prompt: contents } = await req.json();

  // Call the Google Gemini API to generate content stream
  const response = await ai.models.generateContentStream({
    model: 'gemini-2.0-flash-001',
    contents,
  });

  // Create a ReadableStream to stream the response
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
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
}
