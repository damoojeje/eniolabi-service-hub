import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import Providers from '@/components/Providers'
import Link from 'next/link'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'Eniolabi Service Hub',
  description: 'Enterprise Service Management Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body className="font-geist-sans antialiased">
        <Providers>
          {children}
          
          {/* Global Footer - Fixed at bottom */}
          <footer className="fixed bottom-0 left-0 right-0 py-3 px-6 border-t border-gray-200 bg-white/80 backdrop-blur-md z-20">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-center items-center space-x-6 text-sm">
                <span className="text-gray-600">
                  © 2025 Eniolabi. All rights reserved.
                </span>
                <Link href="/privacy" className="text-gray-500 hover:text-gray-600 hover:underline">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-gray-500 hover:text-gray-600 hover:underline">
                  Terms of Use
                </Link>
                <Link href="/support" className="text-gray-500 hover:text-gray-600 hover:underline">
                  Support
                </Link>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
