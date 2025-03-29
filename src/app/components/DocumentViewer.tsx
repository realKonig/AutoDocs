'use client'

import { useState } from 'react'
import { Tab } from '@headlessui/react'
import { DocumentTextIcon, CodeBracketIcon, CommandLineIcon, WrenchScrewdriverIcon, ServerIcon, CursorArrowRaysIcon, CalendarIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { marked } from 'marked'

interface DocumentViewerProps {
  documents: Partial<{
    prd: string
    appFlow: string
    techStack: string
    frontend: string
    backend: string
    cursorRules: string
    implementation: string
    bestPractices: string
  }>
}

const tabs = [
  { name: 'PRD', icon: DocumentTextIcon, key: 'prd' },
  { name: 'App Flow', icon: CodeBracketIcon, key: 'appFlow' },
  { name: 'Tech Stack', icon: CommandLineIcon, key: 'techStack' },
  { name: 'Frontend', icon: WrenchScrewdriverIcon, key: 'frontend' },
  { name: 'Backend', icon: ServerIcon, key: 'backend' },
  { name: 'Cursor Rules', icon: CursorArrowRaysIcon, key: 'cursorRules' },
  { name: 'Implementation', icon: CalendarIcon, key: 'implementation' },
  { name: 'Best Practices', icon: CheckCircleIcon, key: 'bestPractices' },
] as const

export default function DocumentViewer({ documents }: DocumentViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Filter tabs to only show documents that have been generated
  const availableTabs = tabs.filter(tab => documents[tab.key as keyof typeof documents])

  if (availableTabs.length === 0) {
    return (
      <div className="text-center text-gray-400">
        No documents generated yet.
      </div>
    )
  }

  const renderContent = (content: string | undefined) => {
    if (!content) {
      return (
        <div className="text-center text-gray-400">
          Document not generated yet.
        </div>
      )
    }

    // Split content into paragraphs and render with proper formatting
    return (
      <div className="prose prose-invert max-w-none">
        {content.split('\n').map((paragraph, index) => {
          if (!paragraph.trim()) return null
          return (
            <div 
              key={index} 
              className="mb-4"
              dangerouslySetInnerHTML={{ 
                __html: marked(paragraph, { breaks: true })
              }} 
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="w-full">
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-800 p-1">
          {availableTabs.map((tab) => (
            <Tab
              key={tab.key}
              className={({ selected }) =>
                `w-full flex items-center justify-center rounded-lg py-2.5 text-sm font-medium leading-5
                ${
                  selected
                    ? 'bg-gray-700 text-blue-400 shadow-inner'
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
                }`
              }
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.name}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          {availableTabs.map((tab) => (
            <Tab.Panel
              key={tab.key}
              className={`rounded-xl bg-gray-800 p-6 shadow-lg ring-1 ring-white/10`}
            >
              {renderContent(documents[tab.key as keyof typeof documents])}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
} 