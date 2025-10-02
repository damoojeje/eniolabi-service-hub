'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { trpc } from '@/lib/trpc'
import superjson from 'superjson'
import SessionProvider from './SessionProvider'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { AdminProvider } from '@/contexts/AdminContext'
import ErrorBoundary from './ErrorBoundary'

function getBaseUrl() {
  if (typeof window !== 'undefined') return '' // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}` // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3003}` // dev SSR should use localhost
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
          fetch(url, options) {
            console.log('🌐 [DEBUG] tRPC fetch request:', { url, options })
            return fetch(url, {
              ...options,
              credentials: 'include', // Include cookies for authentication
            }).then(response => {
              console.log('🌐 [DEBUG] tRPC fetch response:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
              })
              return response
            }).catch(error => {
              console.error('🌐 [DEBUG] tRPC fetch error:', error)
              throw error
            })
          },
          headers() {
            return {
              'content-type': 'application/json',
            }
          },
        }),
      ],
    }),
  )

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationProvider>
          <AdminProvider>
            <trpc.Provider client={trpcClient} queryClient={queryClient}>
              <QueryClientProvider client={queryClient}>
                <SessionProvider>
                  {children}
                </SessionProvider>
              </QueryClientProvider>
            </trpc.Provider>
          </AdminProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}