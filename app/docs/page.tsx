'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen, Rocket, Settings, TestTube, Zap } from 'lucide-react'

export default function DocsPage() {
  const guides = [
    {
      id: 'quick-start',
      title: 'Quick Start',
      description: 'Get Doltsite running locally in 5 minutes',
      icon: Rocket,
      file: 'QUICK_START.md',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'readme',
      title: 'Project Overview',
      description: 'Complete project structure and features',
      icon: BookOpen,
      file: 'README.md',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'production',
      title: 'Production Guide',
      description: 'Architecture, environment config, and deployment',
      icon: Settings,
      file: 'PRODUCTION_STATUS.md',
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 'deployment',
      title: 'Deployment to Vercel',
      description: 'Step-by-step guide to deploy to production',
      icon: Rocket,
      file: 'DEPLOYMENT_GUIDE.md',
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 'testing',
      title: 'Testing & Verification',
      description: 'Complete testing checklist before production',
      icon: TestTube,
      file: 'TESTING_GUIDE.md',
      color: 'from-indigo-500 to-blue-500',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Documentation</h1>
          </div>
          <p className="text-lg text-slate-600">Learn how to use, develop, test, and deploy Doltsite</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <div className="grid gap-6">
          {guides.map((guide) => {
            const Icon = guide.icon
            return (
              <a
                key={guide.id}
                href={`/docs/view?file=${guide.file}`}
                className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white p-6 transition-all hover:border-slate-300 hover:shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-5" style={{backgroundImage: `linear-gradient(to right, var(--color-start), var(--color-end))`}} />
                
                <div className="relative flex items-start gap-4">
                  <div className={`rounded-lg bg-gradient-to-br ${guide.color} p-3 text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {guide.title}
                    </h2>
                    <p className="mt-1 text-slate-600">{guide.description}</p>
                    <div className="mt-4 flex items-center gap-2 text-blue-600 font-medium">
                      Read Guide <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </a>
            )
          })}
        </div>

        {/* Quick Links */}
        <div className="mt-12 rounded-lg border border-slate-200 bg-blue-50 p-6">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Quick Links</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            <li>
              <a href="https://github.com/flopin35/Website_generator" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium">
                📦 GitHub Repository
              </a>
            </li>
            <li>
              <a href="https://console.upstash.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium">
                🔐 Upstash Redis Console
              </a>
            </li>
            <li>
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium">
                🤖 OpenAI API Keys
              </a>
            </li>
            <li>
              <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium">
                🚀 Vercel Dashboard
              </a>
            </li>
          </ul>
        </div>

        {/* Key Info */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-slate-900">Local Development</h3>
            <p className="mt-2 text-sm text-slate-600">
              Start with <strong>Quick Start</strong> guide to get running in 5 minutes.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-slate-900">Before Production</h3>
            <p className="mt-2 text-sm text-slate-600">
              Review <strong>Testing Guide</strong> and <strong>Production Guide</strong> before deploying.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-slate-900">Deploy to Vercel</h3>
            <p className="mt-2 text-sm text-slate-600">
              Follow the <strong>Deployment Guide</strong> for step-by-step instructions.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-12">
        <div className="container mx-auto max-w-4xl px-4 text-center text-slate-600">
          <p>Doltsite Documentation • Last Updated January 2025</p>
        </div>
      </footer>
    </div>
  )
}
