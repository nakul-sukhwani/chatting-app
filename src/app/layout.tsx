import './globals.css'
import type { Metadata } from 'next'
import { SocketProvider } from '@/components/SocketProvider'

export const metadata: Metadata = {
  title: 'Ephemeral Chat',
  description: 'Minimalist, Link-based Real-time Chat',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <SocketProvider>
          {children}
        </SocketProvider>
      </body>
    </html>
  )
}
