'use client'

const templates = [
  { id: 'ecommerce', name: ' E-Commerce', description: 'Online store with products and checkout' },
  { id: 'portfolio', name: ' Portfolio', description: 'Showcase your work and projects' },
  { id: 'landing', name: ' Landing Page', description: 'Convert visitors into customers' },
  { id: 'blog', name: ' Blog', description: 'Share your thoughts and stories' },
  { id: 'saas', name: ' SaaS', description: 'Software service landing page' },
  { id: 'corporate', name: ' Corporate', description: 'Professional business website' },
]

export default function TemplateSelector({ selected, onChange }: { selected: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {templates.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            padding: '0.75rem 1rem',
            textAlign: 'left',
            borderRadius: '0.5rem',
            border: selected === t.id ? '2px solid #a855f7' : '2px solid rgba(255,255,255,0.1)',
            background: selected === t.id ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.05)',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{t.name}</div>
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>{t.description}</div>
        </button>
      ))}
    </div>
  )
}