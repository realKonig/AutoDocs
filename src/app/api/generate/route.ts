import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'

const projectSchema = z.object({
  description: z.string().min(10),
  projectType: z.enum(['web', 'mobile', 'desktop', 'ai', 'other']),
  documentType: z.enum(['prd', 'appFlow', 'techStack', 'frontend', 'backend', 'cursorRules', 'implementation', 'bestPractices', 'promptGuide'])
})

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const DOCUMENT_TYPES = [
  { key: 'prd', label: 'Project Requirements Document' },
  { key: 'appFlow', label: 'Application Flow' },
  { key: 'techStack', label: 'Technology Stack' },
  { key: 'frontend', label: 'Frontend Guidelines' },
  { key: 'backend', label: 'Backend Structure' },
  { key: 'cursorRules', label: 'Cursor Rules' },
  { key: 'implementation', label: 'Implementation Plan' },
  { key: 'bestPractices', label: 'Best Practices' },
  { key: 'promptGuide', label: 'Prompt Guide' },
] as const

const DOCUMENT_PROMPTS = {
  prd: (description: string, type: string) => `As an expert product manager, create a comprehensive Project Requirements Document (PRD) for a ${type} project with the following description:

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

  appFlow: (description: string, type: string) => `As an experienced UX architect, create a detailed App Flow Document for a ${type} project with the following description:

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

  techStack: (description: string, type: string) => `As a solutions architect, recommend a comprehensive Technology Stack for a ${type} project with the following description:

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

  frontend: (description: string, type: string) => `As a senior frontend architect, create detailed Frontend Guidelines for a ${type} project with the following description:

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

  backend: (description: string, type: string) => `As a backend architect, create a comprehensive Backend Structure document for a ${type} project with the following description:

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

  cursorRules: (description: string, type: string) => `As an AI development expert, create CursorAI Rules for a ${type} project with the following description:

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

  implementation: (description: string, type: string) => `As a technical project manager, create a detailed Implementation Plan for a ${type} project with the following description:

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

  bestPractices: (description: string, type: string) => `As a senior software engineer, compile comprehensive Best Practices for a ${type} project with the following description:

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

Include specific examples and recommendations tailored to this project type.`,

  promptGuide: (description: string, type: string) => `As an AI development expert, create a comprehensive Prompt Guide for effectively using Cursor AI to build this ${type} project with the following description:

${description}

The guide should include:

1. Best Practices for AI Interaction
   - How to structure prompts for optimal results
   - Tips for providing clear context
   - Ways to break down complex tasks
   - Techniques for iterative refinement

2. Documentation Integration
   - How to reference the generated documents effectively
   - Using project requirements in prompts
   - Maintaining consistency with architecture decisions
   - Incorporating technical specifications

3. Common Development Tasks
   - Component/module creation prompts
   - Testing and validation prompts
   - Debugging assistance prompts
   - Code review and improvement prompts

4. Project-Specific Guidelines
   - Using project terminology correctly
   - Following established patterns
   - Maintaining consistent style
   - Adhering to project constraints

5. Troubleshooting & Refinement
   - Identifying prompt issues
   - Improving unclear responses
   - Handling edge cases
   - Iterating on generated code

6. Examples & Templates
   - Feature implementation prompts
   - Architecture alignment checks
   - Code optimization requests
   - Documentation updates

7. Integration with Development Workflow
   - When to use AI assistance
   - Combining AI with manual development
   - Code review workflow
   - Documentation maintenance

8. Best Practices & Pitfalls
   - What to avoid in prompts
   - Security considerations
   - Performance optimization requests
   - Maintaining code quality

Format the guide with clear sections, examples, and actionable advice. Focus on practical, project-specific guidance that will help developers work effectively with Cursor AI while maintaining alignment with the project's documentation and requirements.`
} as const

export async function POST(request: Request) {
  console.log('Received API request to /api/generate')
  
  try {
    // Parse and validate request body
    const body = await request.json()
    console.log('Request body:', body)
    
    const validatedData = projectSchema.parse(body)
    console.log('Validated data:', validatedData)

    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured')
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    const promptGenerator = DOCUMENT_PROMPTS[validatedData.documentType]
    if (!promptGenerator) {
      return NextResponse.json(
        { error: `Invalid document type: ${validatedData.documentType}` },
        { status: 400 }
      )
    }

    const prompt = promptGenerator(validatedData.description, validatedData.projectType)

    console.log('Making request to OpenAI API for document:', validatedData.documentType)
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert software development documentation writer. Create detailed, well-structured documentation using markdown formatting.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    })

    console.log('Received response from OpenAI')
    
    const content = completion.choices[0]?.message?.content || ''
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