'use client'

import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { trpc } from '@/lib/trpc'
import ServiceHistoryChart from '@/components/ui/ServiceHistoryChart'

export default function ServiceDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const serviceId = params.id as string

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const { data: service, isLoading, error } = trpc.services.getById.useQuery(
    serviceId,
    { enabled: !!session && !!serviceId }
  )

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Service Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The requested service could not be found or you don't have access to it.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const latestStatus = null
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE': return 'text-green-600 bg-green-100'
      case 'WARNING': return 'text-yellow-600 bg-yellow-100'
      case 'ERROR': return 'text-red-600 bg-red-100'
      case 'OFFLINE': return 'text-gray-600 bg-gray-100'
      case 'TIMEOUT': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'ONLINE': return '✅'
      case 'WARNING': return '⚠️'
      case 'ERROR': return '❌'
      case 'OFFLINE': return '🔴'
      case 'TIMEOUT': return '⏱️'
      default: return '❓'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
            
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${service.isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                {service.isActive ? '✅ Online' : '❌ Offline'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-4xl">{service.icon || '🔧'}</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {service.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {service.description || service.category}
              </p>
            </div>
          </div>
        </div>

        {/* Service Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Service URL</div>
            <a
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline break-all"
            >
              {service.url}
            </a>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Category</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {service.category}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Check Interval</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {service.checkInterval}min
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Timeout</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {service.timeoutSeconds}s
            </div>
          </div>
        </div>

        {/* Latest Status Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Service Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${service.isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                {service.isActive ? '✅ Online' : '❌ Offline'}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Last Updated</div>
              <div className="text-sm text-gray-900 dark:text-white">
                {new Date(service.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Service History Chart */}
        <ServiceHistoryChart 
          serviceId={service.id} 
          serviceName={service.name} 
        />
      </div>
    </div>
  )
}