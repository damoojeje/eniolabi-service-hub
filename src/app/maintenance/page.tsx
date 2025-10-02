'use client'

import React from 'react'
import { WrenchScrewdriverIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Maintenance Icon */}
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-orange-100 dark:bg-orange-900/20 mb-8">
          <WrenchScrewdriverIcon className="h-12 w-12 text-orange-600 dark:text-orange-400" />
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Under Maintenance
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              We're currently performing scheduled maintenance to improve your experience.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400 mb-4">
              <ClockIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Expected Duration</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              15-30 minutes
            </p>
          </div>

          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <p className="text-sm">
              Our team is working to complete the maintenance as quickly as possible.
              All your data is safe and will be available once maintenance is complete.
            </p>

            <div className="space-y-2 text-xs">
              <p><strong>What we're doing:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-left">
                <li>System updates and security patches</li>
                <li>Performance optimizations</li>
                <li>Database maintenance</li>
              </ul>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-pulse w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Maintenance in progress...
            </span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
          >
            Check Again
          </button>

          {/* Admin Access Note */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Administrator?</strong> You can access the{' '}
              <a
                href="/dashboard"
                className="underline hover:no-underline"
              >
                admin dashboard
              </a>{' '}
              during maintenance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}