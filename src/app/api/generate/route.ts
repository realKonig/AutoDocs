import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { DocumentType, DOCUMENT_PROMPTS } from '@/app/types/documents'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { description, type, documentType } = await req.json()

    if (!description || !type || !documentType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const prompt = DOCUMENT_PROMPTS[documentType as DocumentType](description, type)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2500,
    })

    const content = completion.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'Failed to generate content' },
        { status: 500 }
      )
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error generating document:', error)
    return NextResponse.json(
      { error: 'Failed to generate document' },
      { status: 500 }
    )
  }
} 