import { Inter } from 'next/font/google'
import './globals.css'
import BackendStatus from '@/app/components/BackendStatus'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'Inventory Manager',
  description: 'Professional inventory management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="font-sans antialiased bg-gray-50">
        {children}
        <BackendStatus />
      </body>
    </html>
  )
}
