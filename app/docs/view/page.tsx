'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Markdown from 'react-markdown'

function DocViewContent() {
  const searchParams = useSearchParams()
  const file = searchParams?.get('file') || 'README.md'
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/${file}`)
        if (!response.ok) {
          setError(`Failed to load ${file}`)
          return
        }
        const text = await response.text()
        setContent(text)
      } catch (err) {
        setError(`Error loading documentation: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchDoc()
  }, [file])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <Link href="/docs" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Docs
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">{file.replace('.md', '').replace(/_/g, ' ')}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl px-4 py-8">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <strong>Error:</strong> {error}
          </div>
        )}

        {content && !loading && (
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <Markdown
              components={{
                h1: ({children}) => <h1 className="text-3xl font-bold mb-4 mt-6 text-slate-900">{children}</h1>,
                h2: ({children}) => <h2 className="text-2xl font-bold mb-3 mt-6 pb-2 border-b border-slate-200 text-slate-900">{children}</h2>,
                h3: ({children}) => <h3 className="text-xl font-bold mb-2 mt-4 text-slate-900">{children}</h3>,
                p: ({children}) => <p className="text-slate-700 leading-relaxed mb-3">{children}</p>,
                a: ({children, href}) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">{children}</a>,
                code: ({children}) => <code className="bg-slate-100 px-1.5 py-0.5 rounded text-red-600 font-mono text-sm">{children}</code>,
                pre: ({children}) => <pre className="bg-slate-800 text-slate-50 p-4 rounded overflow-x-auto my-4">{children}</pre>,
                ul: ({children}) => <ul className="list-disc list-inside mb-3 text-slate-700">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal list-inside mb-3 text-slate-700">{children}</ol>,
                li: ({children}) => <li className="mb-1">{children}</li>,
                blockquote: ({children}) => <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-3 text-slate-600 italic">{children}</blockquote>,
                table: ({children}) => <table className="w-full border-collapse border border-slate-300 my-4">{children}</table>,
                thead: ({children}) => <thead className="bg-slate-100">{children}</thead>,
                th: ({children}) => <th className="border border-slate-300 p-2 font-bold text-left">{children}</th>,
                td: ({children}) => <td className="border border-slate-300 p-2">{children}</td>,
              }}
            >
              {content}
            </Markdown>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-12">
        <div className="container mx-auto max-w-4xl px-4 text-center text-slate-600">
          <p>Doltsite Documentation</p>
        </div>
      </footer>
    </div>
  )
}

import { Suspense } from 'react'

export default function DocViewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <DocViewContent />
    </Suspense>
  )
}
