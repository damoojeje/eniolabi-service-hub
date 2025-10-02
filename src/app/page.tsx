'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AppleClock from '@/components/ui/AppleClock'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    
    if (session?.user) {
      // User is logged in, redirect to dashboard
      router.push('/dashboard')
    } else {
      // User is not logged in, redirect to login
      router.push('/auth/signin')
    }
  }, [session, status, router])

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-apple-background font-apple flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <AppleClock size="large" />
          </div>
          <div className="text-apple-secondary">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  // This should rarely be seen as users will be redirected
  return (
    <div className="min-h-screen bg-apple-background font-apple flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <AppleClock size="large" />
        </div>
        <div className="text-apple-secondary">Redirecting to dashboard...</div>
      </div>
    </div>
  )
}