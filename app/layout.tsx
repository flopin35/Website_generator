import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Doltsite - AI Website Builder',
  description: 'Generate beautiful, custom websites instantly with AI. Pick a template, enter a prompt, download your site.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><defs><linearGradient id='g' x1='0' y1='0' x2='40' y2='40' gradientUnits='userSpaceOnUse'><stop offset='0%25' stop-color='%23a855f7'/><stop offset='100%25' stop-color='%23ec4899'/></linearGradient></defs><rect width='40' height='40' rx='10' fill='url(%23g)'/><text x='7' y='29' font-family='system-ui' font-weight='800' font-size='24' fill='white'>D</text><path d='M28 6 L24 16 H27.5 L23 26 L32 13 H28 L32 6 Z' fill='white' opacity='0.9'/></svg>",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}