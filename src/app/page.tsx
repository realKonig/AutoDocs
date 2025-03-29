'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DocumentTextIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import DocumentViewer from './components/DocumentViewer'
import { downloadZip } from './utils/zip'

const projectSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters'),
  projectType: z.enum(['web', 'mobile', 'desktop', 'ai', 'other']),
})

type ProjectFormData = z.infer<typeof projectSchema>

interface GeneratedDocuments {
  prd: string
  appFlow: string
  techStack: string
  frontend: string
  backend: string
  cursorRules: string
  implementation: string
  bestPractices: string
}

const DOCUMENT_TYPES = [
  { key: 'prd', label: 'Project Requirements' },
  { key: 'appFlow', label: 'App Flow' },
  { key: 'techStack', label: 'Tech Stack' },
  { key: 'frontend', label: 'Frontend Guidelines' },
  { key: 'backend', label: 'Backend Structure' },
  { key: 'cursorRules', label: 'Cursor Rules' },
  { key: 'implementation', label: 'Implementation Plan' },
  { key: 'bestPractices', label: 'Best Practices' },
] as const

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentDocType, setCurrentDocType] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [documents, setDocuments] = useState<Partial<GeneratedDocuments>>({})
  const [progress, setProgress] = useState<number>(0)
  const [generationErrors, setGenerationErrors] = useState<Record<string, string>>({})
  const [isDownloading, setIsDownloading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  })

  const generateDocument = async (documentType: keyof GeneratedDocuments, projectType: string, description: string) => {
    console.log(`Generating document: ${documentType}`)
    setCurrentDocType(documentType)
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType,
          projectType,
          description,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Failed to generate documentation')
      }

      const result = await response.json()
      if (!result.content) {
        throw new Error('No content received from API')
      }
      return result.content
    } catch (err) {
      console.error(`Error generating ${documentType}:`, err)
      throw err
    }
  }

  const onSubmit = async (data: ProjectFormData) => {
    setIsGenerating(true)
    setError(null)
    setDocuments({})
    setProgress(0)
    setGenerationErrors({})
    
    console.log('Starting document generation with data:', data)
    
    let hasError = false
    
    for (const [index, docType] of DOCUMENT_TYPES.entries()) {
      if (hasError) break
      
      try {
        const content = await generateDocument(
          docType.key as keyof GeneratedDocuments,
          data.projectType,
          data.description
        )
        
        setDocuments(prev => ({
          ...prev,
          [docType.key]: content
        }))
        
        setProgress(((index + 1) / DOCUMENT_TYPES.length) * 100)
      } catch (err) {
        console.error(`Error generating ${docType.key}:`, err)
        setGenerationErrors(prev => ({
          ...prev,
          [docType.key]: err instanceof Error ? err.message : 'Unknown error'
        }))
        hasError = true
      }
    }
    
    setIsGenerating(false)
    setCurrentDocType(null)
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await downloadZip(documents)
    } catch (error) {
      setError('Failed to download Knowledge Base ZIP file')
      console.error('Download error:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <DocumentTextIcon className="h-12 w-12 mx-auto text-blue-400 mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">
            AutoDocs
          </h1>
          <p className="text-xl text-gray-300">
            Generate comprehensive project documentation from your project description
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mb-12">
          <div>
            <label htmlFor="projectType" className="block text-sm font-medium text-gray-200 mb-2">
              Project Type
            </label>
            <select
              id="projectType"
              {...register('projectType')}
              className="w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              defaultValue="web"
            >
              <option value="web">Web Application</option>
              <option value="mobile">Mobile App</option>
              <option value="desktop">Desktop Application</option>
              <option value="ai">AI/ML Project</option>
              <option value="other">Other</option>
            </select>
            {errors.projectType && (
              <p className="mt-1 text-sm text-red-400">{errors.projectType.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-2">
              Project Description
            </label>
            <textarea
              id="description"
              rows={6}
              {...register('description')}
              className="w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400"
              placeholder="Describe your project idea, features, and requirements..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-red-900/50 border border-red-700 p-4">
              <div className="text-sm text-red-400">{error}</div>
            </div>
          )}

          {isGenerating && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-300">
                <span>Generating {currentDocType ? DOCUMENT_TYPES.find(d => d.key === currentDocType)?.label : '...'}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-offset-gray-900"
          >
            {isGenerating ? 'Generating Documentation...' : 'Generate Documentation'}
          </button>
        </form>

        {(Object.keys(documents).length > 0 || Object.keys(generationErrors).length > 0) && (
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Generated Documentation</h2>
              {Object.keys(documents).length > 0 && (
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-offset-gray-900"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  {isDownloading ? 'Downloading...' : 'Download Knowledge Base'}
                </button>
              )}
            </div>
            <DocumentViewer documents={documents} />
            {Object.entries(generationErrors).length > 0 && (
              <div className="mt-4 p-4 rounded-md bg-red-900/50 border border-red-700">
                <h3 className="text-sm font-medium text-red-400 mb-2">Generation Errors:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {Object.entries(generationErrors).map(([docType, error]) => (
                    <li key={docType} className="text-sm text-red-400">
                      {DOCUMENT_TYPES.find(d => d.key === docType)?.label}: {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
