'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DocumentTextIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { DocumentViewer } from './components/DocumentViewer'
import { downloadZip } from './utils/zip'
import { DOCUMENT_TYPES } from './types/documents'

const projectSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters'),
  projectType: z.enum(['web', 'mobile', 'desktop', 'ai', 'other']),
  selectedDocuments: z.array(z.string()).min(1, 'Select at least one document to generate'),
})

type ProjectFormData = z.infer<typeof projectSchema>

export default function Home() {
  const [documents, setDocuments] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentDocType, setCurrentDocType] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [generationErrors, setGenerationErrors] = useState<Record<string, string>>({})
  const [isDownloading, setIsDownloading] = useState(false)
  const [isZipReady, setIsZipReady] = useState(false)
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set(DOCUMENT_TYPES.map(d => d.key)))
  const [description, setDescription] = useState('')
  const [type, setType] = useState('web')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectType: 'web',
      description: '',
      selectedDocuments: DOCUMENT_TYPES.map(d => d.key),
    },
  })

  const handleSelectAll = () => {
    const allDocs = DOCUMENT_TYPES.map(d => d.key)
    setSelectedDocs(new Set(allDocs))
    setValue('selectedDocuments', allDocs)
  }

  const handleDeselectAll = () => {
    setSelectedDocs(new Set())
    setValue('selectedDocuments', [])
  }

  const handleToggleDocument = (docKey: string) => {
    const newSelected = new Set(selectedDocs)
    if (newSelected.has(docKey)) {
      newSelected.delete(docKey)
    } else {
      newSelected.add(docKey)
    }
    setSelectedDocs(newSelected)
    setValue('selectedDocuments', Array.from(newSelected))
  }

  const generateDocument = async (documentType: string) => {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          type,
          documentType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate document')
      }

      if (!data.content) {
        throw new Error('No content received from API')
      }

      return data.content
    } catch (error) {
      throw error
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setDocuments({})
    setGenerationErrors({})
    setProgress(0)
    setIsZipReady(false)

    const totalDocuments = DOCUMENT_TYPES.length
    let completedDocuments = 0

    for (const docType of DOCUMENT_TYPES) {
      try {
        const content = await generateDocument(docType.key)
        setDocuments(prev => ({
          ...prev,
          [docType.key]: content
        }))
      } catch (error) {
        console.error(`Error generating ${docType.label}:`, error)
        setGenerationErrors(prev => ({
          ...prev,
          [docType.key]: error instanceof Error ? error.message : 'Failed to generate document'
        }))
      }
      completedDocuments++
      setProgress((completedDocuments / totalDocuments) * 100)
    }

    setIsGenerating(false)
    setIsZipReady(true)
  }

  const handleDownload = async () => {
    if (!isZipReady) return
    
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

        <form onSubmit={onSubmit} className="space-y-6 mb-12">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-200 mb-2">
              Project Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="web">Web Application</option>
              <option value="mobile">Mobile Application</option>
              <option value="desktop">Desktop Application</option>
              <option value="ai">AI/ML Application</option>
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400"
              rows={6}
              placeholder="Describe your project in detail..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-200">
                Select Documents to Generate
              </label>
              <div className="space-x-4">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Deselect All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {DOCUMENT_TYPES.map((doc) => (
                <div key={doc.key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={doc.key}
                    checked={selectedDocs.has(doc.key)}
                    onChange={() => handleToggleDocument(doc.key)}
                    className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                  />
                  <label htmlFor={doc.key} className="ml-2 text-sm text-gray-300">
                    {doc.label}
                  </label>
                </div>
              ))}
            </div>
            {errors.selectedDocuments && (
              <p className="mt-2 text-sm text-red-400">{errors.selectedDocuments.message}</p>
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
            disabled={isGenerating || !description.trim()}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-offset-gray-900 ${
              isGenerating || !description.trim() ? 'cursor-not-allowed' : ''
            }`}
          >
            {isGenerating ? 'Generating Documents...' : 'Generate Documents'}
          </button>
        </form>

        {(Object.keys(documents).length > 0 || Object.keys(generationErrors).length > 0) && (
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Generated Documentation</h2>
              {Object.keys(documents).length > 0 && (
                <button
                  onClick={handleDownload}
                  disabled={isDownloading || !isZipReady || isGenerating}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-offset-gray-900"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  {isDownloading ? 'Downloading...' : 
                   !isZipReady ? `Generating (${Math.round(progress)}%)` : 
                   'Download Knowledge Base'}
                </button>
              )}
            </div>
            <DocumentViewer documents={documents} errors={generationErrors} />
          </div>
        )}
      </div>
    </div>
  )
}
