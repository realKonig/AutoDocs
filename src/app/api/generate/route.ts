import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'

const requestSchema = z.object({
  description: z.string().min(10),
  projectType: z.enum(['web', 'mobile', 'desktop', 'ai', 'other']),
  documentType: z.enum(['prd', 'appFlow', 'techStack', 'frontend', 'backend', 'cursorRules', 'implementation', 'bestPractices'])
})

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const DOCUMENT_PROMPTS: Record<string, (projectType: string, description: string) => string> = {
  prd: (projectType, description) => `As an expert product manager, create a comprehensive Project Requirements Document (PRD) for a ${projectType} project with the following description:

${description}

The PRD should include:
1. Project Overview & Vision
2. Problem Statement
3. Target Users/Audience
4. Key Features & Functionalities
5. User Stories & Use Cases
6. Non-Functional Requirements
7. Success Metrics
8. Constraints & Dependencies
9. Future Considerations

Format the response in a clear, structured manner using markdown headings and bullet points where appropriate.`,

  appFlow: (projectType, description) => `As an experienced UX architect, create a detailed App Flow Document for a ${projectType} project with the following description:

${description}

Include:
1. User Journey Maps
2. Core User Flows
3. Screen-to-Screen Navigation
4. State Transitions
5. Error Handling Flows
6. Authentication Flows (if applicable)
7. Key Interaction Patterns
8. Critical Path Analysis

Focus on creating a clear, logical flow that optimizes user experience. Use descriptive steps and consider edge cases.`,

  techStack: (projectType, description) => `As a solutions architect, recommend a comprehensive Technology Stack for a ${projectType} project with the following description:

${description}

Cover:
1. Frontend Framework/Library
2. Backend Technology
3. Database Selection
4. API Architecture
5. DevOps Tools
6. Testing Framework
7. Monitoring Solutions
8. Security Components

For each recommendation:
- Explain why it's suitable for this specific project
- Consider scalability, maintenance, and team expertise
- Include version recommendations
- List alternatives considered`,

  frontend: (projectType, description) => `As a senior frontend architect, create detailed Frontend Guidelines for a ${projectType} project with the following description:

${description}

Include:
1. Component Architecture
2. State Management Strategy
3. Styling Methodology
4. Performance Optimization
5. Accessibility Standards
6. Responsive Design Approach
7. Code Organization
8. Best Practices & Conventions
9. Testing Strategy

Provide specific examples and patterns where relevant.`,

  backend: (projectType, description) => `As a backend architect, create a comprehensive Backend Structure document for a ${projectType} project with the following description:

${description}

Cover:
1. API Design & Endpoints
2. Data Models
3. Authentication & Authorization
4. Business Logic Layer
5. Database Schema
6. Caching Strategy
7. Security Measures
8. Scalability Considerations
9. Error Handling

Include specific patterns, examples, and considerations for this project type.`,

  cursorRules: (projectType, description) => `As an AI development expert, create CursorAI Rules for a ${projectType} project with the following description:

${description}

Define:
1. Code Style Guidelines
2. Project-Specific Patterns
3. Architecture Constraints
4. Naming Conventions
5. File Organization
6. Documentation Requirements
7. Testing Requirements
8. AI-Specific Considerations

Format as a .cursorrules configuration that can be used by AI coding assistants.`,

  implementation: (projectType, description) => `As a technical project manager, create a detailed Implementation Plan for a ${projectType} project with the following description:

${description}

Include:
1. Project Phases
2. Dependencies & Prerequisites
3. Resource Requirements
4. Timeline Estimates
5. Risk Assessment
6. Quality Gates
7. Deployment Strategy
8. Rollback Plans
9. Success Criteria

Provide a realistic, phased approach with clear milestones and deliverables.`,

  bestPractices: (projectType, description) => `As a senior software engineer, compile comprehensive Best Practices for a ${projectType} project with the following description:

${description}

Cover:
1. Code Quality Standards
2. Security Guidelines
3. Performance Optimization
4. Testing Strategy
5. Documentation Requirements
6. Deployment Procedures
7. Monitoring & Logging
8. Maintenance Procedures
9. Collaboration Guidelines

Include specific examples and recommendations tailored to this project type.`
}

export async function POST(request: Request) {
  console.log('Received API request to /api/generate')
  
  try {
    // Parse and validate request body
    const body = await request.json()
    console.log('Request body:', body)
    
    const validatedData = requestSchema.parse(body)
    console.log('Validated data:', validatedData)

    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured')
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    const promptGenerator = DOCUMENT_PROMPTS[validatedData.documentType]
    const prompt = promptGenerator(validatedData.projectType, validatedData.description)

    console.log('Making request to OpenAI API for document:', validatedData.documentType)
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert software architect and technical writer. Generate detailed, well-structured documentation that follows industry best practices. Use markdown formatting for better readability."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    })

    console.log('Received response from OpenAI')
    
    const content = completion.choices[0].message.content || ''
    console.log('Generated content length:', content.length)

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error in API route:', error)
    
    // Handle different types of errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: 'OpenAI API error', message: error.message },
        { status: error.status || 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 