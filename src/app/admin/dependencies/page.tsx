'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ServiceDependencyMap from '@/components/ServiceDependencyMap'
import AppleClock from '@/components/ui/AppleClock'

export default function DependenciesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Redirect if not admin or power user
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-white">Loading...</div>
      </div>
    )
  }

  if (!session || !['ADMIN', 'POWER_USER'].includes(session.user.role)) {
    router.push('/dashboard')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => router.push('/admin')}
                className="text-2xl text-gray-900 dark:text-gray-300 mr-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Back to Admin Panel"
              >
                ←
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Service Dependencies
              </h1>
            </div>

            <div className="flex-1 flex justify-center">
              <AppleClock size="medium" />
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Toggle theme"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-lg">{session.user.role === 'ADMIN' ? '👑' : '⚡'}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  session.user.role === 'ADMIN' 
                    ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                    : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {session.user.role.replace('_', ' ')}
                </span>
                <span className="text-gray-900 dark:text-gray-300 font-medium">
                  {session.user.username}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Page Introduction */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Service Dependency Visualization
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
            Visualize the relationships between your services to understand dependencies and potential impact of failures. 
            Click on any service to see its specific dependencies and dependents.
          </p>
        </div>

        {/* Dependency Map */}
        <ServiceDependencyMap isDarkMode={isDarkMode} />

        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dependency Management Tips */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📋 Dependency Management Best Practices
            </h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start space-x-2">
                <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                <span>Monitor critical path dependencies closely</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                <span>Implement circuit breakers for external dependencies</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                <span>Design services to gracefully handle dependency failures</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                <span>Avoid circular dependencies between services</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                <span>Keep dependency chains as short as possible</span>
              </li>
            </ul>
          </div>

          {/* Risk Assessment */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              ⚠️ Risk Assessment
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="text-sm font-medium text-red-800 dark:text-red-400 mb-1">
                  Critical Dependencies
                </div>
                <div className="text-xs text-red-700 dark:text-red-300">
                  Services with many dependents (single points of failure)
                </div>
              </div>
              
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-1">
                  Complex Chains
                </div>
                <div className="text-xs text-yellow-700 dark:text-yellow-300">
                  Long dependency chains increase failure probability
                </div>
              </div>
              
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="text-sm font-medium text-green-800 dark:text-green-400 mb-1">
                  Isolated Services
                </div>
                <div className="text-xs text-green-700 dark:text-green-300">
                  Services with minimal dependencies are more resilient
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}