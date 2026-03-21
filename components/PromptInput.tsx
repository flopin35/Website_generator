'use client'

interface DescriptionInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
}

const EXAMPLES = [
  'Create a modern restaurant website in Accra with online menu',
  'Create a tech startup landing page with dark theme and animations',
  'Create a school website with contact section and staff gallery',
  'Create a photography portfolio with minimal white theme',
  'Create an online store selling handmade jewellery',
]

export default function DescriptionInput({ value, onChange, onSubmit }: DescriptionInputProps) {
  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.ctrlKey) onSubmit()
        }}
        placeholder="Type what you want to create... (e.g. Create a modern restaurant website in Accra)"
        rows={4}
        className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none text-sm leading-relaxed"
      />

      {/* Example prompts */}
      <div>
        <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">✨ Try an example:</p>
        <div className="flex flex-col gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => onChange(ex)}
              className="text-left text-xs text-slate-400 hover:text-purple-300 hover:bg-purple-500/10 px-2.5 py-1.5 rounded-md border border-transparent hover:border-purple-500/30 transition-all duration-150 truncate"
            >
              → {ex}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-600">💡 Press <kbd className="px-1 py-0.5 bg-slate-700 rounded text-slate-400 text-[10px]">Ctrl+Enter</kbd> to generate instantly</p>
    </div>
  )
}
