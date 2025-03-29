import JSZip from 'jszip'

export interface DocumentData {
  prd: string
  appFlow: string
  techStack: string
  frontend: string
  backend: string
  cursorRules: string
  implementation: string
  bestPractices: string
  promptGuide: string
}

export const createKnowledgeBaseZip = async (documents: Partial<DocumentData>) => {
  const zip = new JSZip()
  const knowledgeBase = zip.folder('Knowledge Base')

  if (!knowledgeBase) {
    throw new Error('Failed to create Knowledge Base folder')
  }

  // Map of document keys to their file names
  const documentFiles = {
    prd: 'Project_Requirements.md',
    appFlow: 'Application_Flow.md',
    techStack: 'Technology_Stack.md',
    frontend: 'Frontend_Guidelines.md',
    backend: 'Backend_Structure.md',
    cursorRules: 'Cursor_Rules.md',
    implementation: 'Implementation_Plan.md',
    bestPractices: 'Best_Practices.md',
    promptGuide: 'Prompt_Guide.md',
  }

  // Add each document to the ZIP if it exists
  Object.entries(documentFiles).forEach(([key, fileName]) => {
    const content = documents[key as keyof DocumentData]
    if (content) {
      knowledgeBase.file(fileName, content)
    }
  })

  // Generate the ZIP file
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  return zipBlob
}

export const downloadZip = async (documents: Partial<DocumentData>) => {
  try {
    const zipBlob = await createKnowledgeBaseZip(documents)
    
    // Create a download link and trigger the download
    const url = window.URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Knowledge_Base.zip'
    document.body.appendChild(a)
    a.click()
    
    // Clean up
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Error creating ZIP file:', error)
    throw error
  }
} 