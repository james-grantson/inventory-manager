import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Inventory Manager',
  description: 'Inventory management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body className={inter.className}>
        <nav className="navbar">
          <div className="container">
            <a href="/" className="navbar-brand"> Inventory Manager</a>
          </div>
        </nav>
        <main className="py-4">
          {children}
        </main>
      </body>
    </html>
  )
}
