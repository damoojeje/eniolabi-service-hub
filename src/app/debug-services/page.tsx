'use client'

import { useSession } from 'next-auth/react'
import { trpc } from '@/lib/trpc'

export default function DebugServices() {
  const { data: session } = useSession()
  const { data: services, isLoading, error } = trpc.services.getAll.useQuery(undefined, {
    enabled: !!session,
  })

  if (!session) {
    return <div>Please log in first</div>
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div className="p-4">
      <h1>Debug Services Data</h1>
      <div className="mt-4">
        <h2>Raw Services Data:</h2>
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
          {JSON.stringify(services, null, 2)}
        </pre>
        <h2 className="mt-4">Analysis:</h2>
        <ul className="list-disc pl-4">
          <li>Type: {typeof services}</li>
          <li>Is Array: {Array.isArray(services).toString()}</li>
          <li>Length: {Array.isArray(services) ? services.length : 'N/A'}</li>
          <li>Has json property: No</li>
        </ul>
      </div>
    </div>
  )
}