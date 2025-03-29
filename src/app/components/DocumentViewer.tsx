'use client'

import { useState } from 'react'
import { marked } from 'marked'
import { DOCUMENT_TYPES } from '../types/documents'

interface DocumentViewerProps {
  documents: Record<string, string>
  errors: Record<string, string>
}

export function DocumentViewer({ documents, errors }: DocumentViewerProps) {
  const [activeTab, setActiveTab] = useState<string | null>(
    Object.keys(documents)[0] || null
  )

  const availableTabs = DOCUMENT_TYPES.filter(
    docType => documents[docType.key] || errors[docType.key]
  )

  const renderContent = (docType: string) => {
    if (errors[docType]) {
      return (
        <div className="p-4 rounded-md bg-red-900/50 border border-red-700">
          <p className="text-red-400">{errors[docType]}</p>
        </div>
      )
    }

    if (!documents[docType]) {
      return (
        <div className="p-4 text-gray-400">
          No content available for this document.
        </div>
      )
    }

    return (
      <div
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{
          __html: marked(documents[docType], { breaks: true }),
        }}
      />
    )
  }

  if (availableTabs.length === 0) {
    return null
  }

  return (
    <div className="mt-8">
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          {availableTabs.map((docType) => (
            <button
              key={docType.key}
              onClick={() => setActiveTab(docType.key)}
              className={`whitespace-nowrap py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === docType.key
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              {docType.label}
              {errors[docType.key] && (
                <span className="ml-2 text-red-500">⚠️</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-8 prose prose-invert max-w-none">
        {activeTab && renderContent(activeTab)}
      </div>
    </div>
  )
} 