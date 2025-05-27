import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Periskope Chat',
  description: 'A WhatsApp-style chat app',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
