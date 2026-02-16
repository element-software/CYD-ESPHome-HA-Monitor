import type { Metadata } from 'next'
import './globals.css'
import '@material-design-icons/font/index.css'

export const metadata: Metadata = {
  title: 'CYD HAMon Config Generator',
  description: 'Generate ESPHome YAML configurations for CYD Home Assistant Monitor',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
