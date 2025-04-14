// src/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  console.log(`API Route /api/chat POST request received at: ${new Date().toISOString()}`);
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const provider = body.provider ?? 'unknown';
    const model = body.model ?? 'unknown';

    console.log("API Route Processing:", { provider, model, messageCount: messages.length });

    // --- Placeholder logic ---
    const responseContent = `Backend OK: Received ${messages.length} messages for ${provider}/${model}. (Implementation pending)`;
    // -------------------------

    return NextResponse.json({
      message: { role: 'assistant', content: responseContent }
    });

  } catch (error: unknown) {
    console.error("Error inside /api/chat POST route:", error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
    return NextResponse.json(
      { error: `API Route Error: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Fix: Remove the unused parameter entirely
export async function GET() {
  console.log(`API Route /api/chat GET request received at: ${new Date().toISOString()}`);
  return NextResponse.json({ error: 'Method Not Allowed. Please use POST.' }, { status: 405 });
}