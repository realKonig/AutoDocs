import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { DocumentType, DOCUMENT_PROMPTS } from '@/app/types/documents'

// Increase timeout to 2 minutes
export const maxDuration = 120;

// Configure response options
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const { description, type, documentType } = await req.json();

    if (!description || !type || !documentType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const prompt = DOCUMENT_PROMPTS[documentType as DocumentType](description, type);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2500,
    });

    clearTimeout(timeoutId);

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'Failed to generate content' },
        { status: 500 }
      );
    }

    return new NextResponse(
      JSON.stringify({ content }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Error generating document:', error);
    
    // Handle specific error types
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { 
          error: 'OpenAI API error',
          message: error.message,
          type: error.type,
          status: error.status
        },
        { status: error.status || 500 }
      );
    }

    // Handle timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timed out', message: 'The request took too long to complete' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to generate document',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 