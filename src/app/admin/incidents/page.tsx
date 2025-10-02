'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import IncidentResponseSystem from '@/components/IncidentResponseSystem'
import AppleClock from '@/components/ui/AppleClock'

export default function IncidentsPage() {
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
                Incident Response
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
            Automated Incident Response
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-blue-600 dark:text-blue-400 text-2xl">🤖</span>
                <h3 className="font-semibold text-blue-900 dark:text-blue-400">Automated Response</h3>
              </div>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Intelligent automation rules that respond to incidents in real-time with predefined actions.
              </p>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-yellow-600 dark:text-yellow-400 text-2xl">📊</span>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-400">Real-time Monitoring</h3>
              </div>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                Continuous monitoring with instant incident detection and severity classification.
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-green-600 dark:text-green-400 text-2xl">📖</span>
                <h3 className="font-semibold text-green-900 dark:text-green-400">Response Playbooks</h3>
              </div>
              <p className="text-green-700 dark:text-green-300 text-sm">
                Standardized procedures and step-by-step guides for consistent incident resolution.
              </p>
            </div>
          </div>
        </div>

        {/* Incident Response System */}
        <IncidentResponseSystem isDarkMode={isDarkMode} />

        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Automation Benefits */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <span>⚡</span>
              <span>Automation Benefits</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    Faster Response Times
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs">
                    Automated actions trigger within seconds of detection
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    Consistent Resolution
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs">
                    Standardized responses eliminate human error
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    24/7 Monitoring
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs">
                    Always-on incident response without human intervention
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    Reduced MTTR
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs">
                    Mean Time To Resolution significantly decreased
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Escalation Matrix */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <span>📞</span>
              <span>Escalation Matrix</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded">
                <span className="text-sm font-medium text-red-800 dark:text-red-400">CRITICAL</span>
                <span className="text-xs text-red-600 dark:text-red-300">Immediate → On-call Engineer</span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                <span className="text-sm font-medium text-orange-800 dark:text-orange-400">HIGH</span>
                <span className="text-xs text-orange-600 dark:text-orange-300">15 min → Team Lead</span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-400">MEDIUM</span>
                <span className="text-xs text-yellow-600 dark:text-yellow-300">1 hour → Dev Team</span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-400">LOW</span>
                <span className="text-xs text-blue-600 dark:text-blue-300">Next business day → Backlog</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}