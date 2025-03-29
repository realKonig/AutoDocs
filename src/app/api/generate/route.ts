import { NextResponse } from 'next/server'
import { Configuration, OpenAIApi } from 'openai'
import { DocumentType, DOCUMENT_PROMPTS } from '@/app/types/documents'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

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

    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2500,
    })

    const content = completion.data.choices[0]?.message?.content

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