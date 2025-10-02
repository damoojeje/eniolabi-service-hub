'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ApiDocumentation from '@/components/ApiDocumentation'
import AppleClock from '@/components/ui/AppleClock'

export default function ApiDocsPage() {
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
                API Documentation
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
            Interactive API Documentation
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-blue-600 dark:text-blue-400 text-2xl">📚</span>
                <h3 className="font-semibold text-blue-900 dark:text-blue-400">Comprehensive Docs</h3>
              </div>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Complete documentation for all API endpoints with request/response examples.
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-green-600 dark:text-green-400 text-2xl">🧪</span>
                <h3 className="font-semibold text-green-900 dark:text-green-400">Interactive Testing</h3>
              </div>
              <p className="text-green-700 dark:text-green-300 text-sm">
                Test API endpoints directly from the documentation interface with live responses.
              </p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-purple-600 dark:text-purple-400 text-2xl">🔍</span>
                <h3 className="font-semibold text-purple-900 dark:text-purple-400">Easy Navigation</h3>
              </div>
              <p className="text-purple-700 dark:text-purple-300 text-sm">
                Filter endpoints by category and quickly find the API methods you need.
              </p>
            </div>
          </div>
        </div>

        {/* API Documentation Component */}
        <ApiDocumentation isDarkMode={isDarkMode} />

        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Authentication Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <span>🔐</span>
              <span>Authentication</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    Session-based Authentication
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs">
                    All API requests use NextAuth.js session authentication
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    Role-based Access Control
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs">
                    Different endpoints require different user roles (ADMIN, POWER_USER, GUEST)
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    CSRF Protection
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs">
                    All mutation requests include CSRF token validation
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rate Limiting & Best Practices */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <span>⚡</span>
              <span>Best Practices</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    Rate Limiting
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs">
                    API requests are limited to 1000 per hour per user
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    Error Handling
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs">
                    All endpoints return standardized error responses with details
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    Validation
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs">
                    All inputs are validated using Zod schemas for type safety
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SDK Information */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <span>🛠️</span>
            <span>Development Tools</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">tRPC Client</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Use the built-in tRPC client for type-safe API calls from your frontend:
              </p>
              <div className="bg-gray-900 dark:bg-gray-800 rounded p-3 text-xs text-green-400 font-mono">
                <div>import {'{ trpc }'} from '@/lib/trpc'</div>
                <div className="mt-2">const {'{ data, isLoading }'} = trpc.services.getAll.useQuery()</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">HTTP Endpoints</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                All tRPC procedures are also available as standard HTTP endpoints:
              </p>
              <div className="bg-gray-900 dark:bg-gray-800 rounded p-3 text-xs text-blue-400 font-mono">
                <div>POST /api/trpc/services.getAll</div>
                <div className="mt-2">Content-Type: application/json</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}