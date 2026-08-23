'use client'

import React, { useEffect, useState } from 'react'
import { getStudentResources, Resource } from '@/app/actions/resources'

// Category configuration mapping
const CATEGORIES = [
  { id: 'all', label: 'All Resources', icon: '📚' },
  { id: 'past_paper', label: 'Past Papers', icon: '📝' },
  { id: 'notes', label: 'Revision Notes', icon: '📄' },
  { id: 'voice_note', label: 'Voice Notes', icon: '🎙️' },
  { id: 'powerpoint', label: 'Presentations', icon: '📊' },
  { id: 'recording', label: 'Class Recordings', icon: '🎥' },
]

export default function ResourceLibrary() {
  const [resources, setResources] = useState<Resource[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const data = await getStudentResources()
      setResources(data)
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading library...</div>
  }

  // 1. Filter by Active Tab
  const filteredResources = resources.filter(
    (r) => activeTab === 'all' || r.type === activeTab
  )

  // 2. Group by Subject Group Title (e.g., "A-Level Mathematics")
  const groupedResources: { [key: string]: Resource[] } = {}
  filteredResources.forEach((resource) => {
    const subject = resource.subjects
    const subjectKey = subject ? `${subject.level} ${subject.name}` : 'General Resources'
    if (!groupedResources[subjectKey]) {
      groupedResources[subjectKey] = []
    }
    groupedResources[subjectKey].push(resource)
  })

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Resource Library</h1>
        <p className="text-muted-foreground">Access study materials, recordings, and references for your enrolled courses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Navigation Sidebar */}
        <aside className="space-y-1 bg-card border rounded-lg p-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === cat.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </aside>

        {/* Resource Display Area */}
        <main className="md:col-span-3 space-y-8">
          {filteredResources.length === 0 ? (
            /* EXACT PROVIDED EMPTY STATE */
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-16 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-library h-12 w-12 mx-auto text-muted-foreground/20 mb-4">
                <path d="m16 6 4 14"></path>
                <path d="M12 6v14"></path>
                <path d="M8 8v12"></path>
                <path d="M4 4v16"></path>
              </svg>
              <h3 className="text-lg font-medium">Your library is currently empty</h3>
              <p className="text-muted-foreground">Tutors haven't uploaded any resources yet.</p>
            </div>
          ) : (
            Object.entries(groupedResources).map(([subjectName, items]) => (
              <section key={subjectName} className="space-y-4">
                <div className="border-b pb-2">
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">{subjectName}</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex flex-col justify-between p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-2xl" role="img" aria-label="file icon">
                            {item.type === 'past_paper' && '📝'}
                            {item.type === 'notes' && '📄'}
                            {item.type === 'voice_note' && '🎙️'}
                            {item.type === 'powerpoint' && '📊'}
                            {item.type === 'recording' && '🎥'}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground capitalize">
                            {item.type.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="font-semibold text-base leading-snug line-clamp-1">{item.title}</h4>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {item.file_size || item.duration || 'Resource File'}
                        </span>
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 h-8 px-3 transition-colors"
                        >
                          {item.type === 'recording' || item.type === 'voice_note' ? 'Play / View' : 'Download'}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </main>
      </div>
    </div>
  )
}
