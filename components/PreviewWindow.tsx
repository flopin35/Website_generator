'use client'

export default function PreviewWindow({ html }: { html: string }) {
  return (
    <iframe
      srcDoc={html}
      style={{ width: '100%', height: '600px', border: 'none', background: 'white' }}
      title="Preview"
      sandbox="allow-same-origin"
    />
  )
}