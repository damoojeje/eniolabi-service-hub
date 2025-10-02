'use client'

import React from 'react'
import { useNotifications } from '@/contexts/NotificationContext'

export default function ToastNotifications() {
  const { toasts, removeToast } = useNotifications()

  if (toasts.length === 0) return null

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return 'ℹ️'
    }
  }

  const getColorClasses = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-400'
      case 'error':
        return 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-400'
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-400'
      default:
        return 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-400'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg border shadow-lg transition-all duration-300 animate-in slide-in-from-right ${getColorClasses(toast.type)}`}
          role="alert"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <span className="text-lg flex-shrink-0 mt-0.5">
                {getIcon(toast.type)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">
                  {toast.title}
                </p>
                {toast.message && (
                  <p className="text-sm mt-1 opacity-90">
                    {toast.message}
                  </p>
                )}
                {toast.action && (
                  <button
                    onClick={toast.action.onClick}
                    className="text-sm underline hover:no-underline mt-2 font-medium opacity-90 hover:opacity-100"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 ml-3 p-1 hover:opacity-70 transition-opacity"
              aria-label="Close notification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}