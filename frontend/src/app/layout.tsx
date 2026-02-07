import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { ChatWrapper } from '@/components/chat/ChatWrapper'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap' // Optimize font loading
})

export const metadata: Metadata = {
  title: 'TaskFlow - Modern Task Management',
  description: 'A sleek black-themed todo application to help you organize your tasks and boost productivity.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} matte-black`}>
        <Providers>
          {children}
          <ChatWrapper />
        </Providers>
      </body>
    </html>
  )
}
