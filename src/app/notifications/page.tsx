'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { trpc } from '@/lib/trpc'
import AppleClock from '@/components/ui/AppleClock'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function NotificationSettings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [hasChanges, setHasChanges] = useState(false)

  const { data: preferences, isLoading, refetch } = trpc.notifications.getPreferences.useQuery(undefined, {
    enabled: !!session,
  })

  const updatePreferences = trpc.notifications.updatePreferences.useMutation({
    onSuccess: () => {
      setHasChanges(false)
      refetch()
    },
  })

  const sendTestNotification = trpc.notifications.sendTestNotification.useMutation()

  const [formData, setFormData] = useState({
    emailEnabled: true,
    smsEnabled: false,
    webhookEnabled: false,
    slackEnabled: false,
    preferences: {
      service_down: ['in_app', 'email'],
      service_up: ['in_app'],
      slow_response: ['in_app'],
      maintenance: ['in_app'],
      security: ['in_app', 'email'],
      user_action: ['in_app'],
      system: ['in_app', 'email']
    },
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
      timezone: 'UTC'
    }
  })

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    if (preferences) {
      setFormData({
        emailEnabled: preferences.emailEnabled,
        smsEnabled: preferences.smsEnabled,
        webhookEnabled: preferences.webhookEnabled,
        slackEnabled: preferences.slackEnabled,
        preferences: preferences.preferences,
        quietHours: preferences.quietHours,
      })
    }
  }, [preferences])

  const handleChange = (field: string, value?: any) => {
    setFormData(prev => {
      const newData = { ...prev }
      const fieldParts = field.split('.')
      let current: any = newData
      for (let i = 0; i < fieldParts.length - 1; i++) {
        current = current[fieldParts[i]]
      }
      const lastField = fieldParts[fieldParts.length - 1]
      current[lastField] = value !== undefined ? value : !current[lastField]
      return newData
    })
    setHasChanges(true)
  }

  const handleSave = () => {
    updatePreferences.mutate(formData)
  }

  const handleTestNotification = () => {
    sendTestNotification.mutate()
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-apple-background flex items-center justify-center">
        <div className="text-apple-secondary">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-apple-background dark:bg-gray-900 font-apple transition-colors">
      {/* Header */}
      <header className="bg-apple-surface dark:bg-gray-800 shadow-sm transition-colors">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => router.push('/dashboard')}
                className="text-2xl text-apple-secondary dark:text-gray-300 mr-4 hover:text-apple-primary dark:hover:text-blue-400 transition-colors"
                title="Back to Dashboard"
              >
                ←
              </button>
              <h1 className="text-xl font-semibold text-apple-secondary dark:text-white">
                Notification Settings
              </h1>
            </div>

            <div className="flex-1 flex justify-center">
              <AppleClock size="medium" />
            </div>

            <div className="flex items-center space-x-3">
              <ThemeToggle size="small" />
              <span className="text-apple-secondary dark:text-gray-300 font-medium">{session.user.username}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Settings Card */}
          <div className="bg-apple-surface dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-apple-secondary dark:text-white">Email Notifications</h2>
              <div className="flex space-x-2">
                <button
                  onClick={handleTestNotification}
                  disabled={sendTestNotification.isPending}
                  className="px-4 py-2 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-50 transition-colors"
                >
                  {sendTestNotification.isPending ? 'Sending...' : 'Send Test'}
                </button>
                {hasChanges && (
                  <button
                    onClick={handleSave}
                    disabled={updatePreferences.isPending}
                    className="px-4 py-2 text-sm bg-apple-primary dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {updatePreferences.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </div>

            {/* Test notification feedback */}
            {sendTestNotification.isSuccess && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 rounded-lg text-sm">
                ✅ Test notification sent successfully! Check your email.
              </div>
            )}

            {sendTestNotification.error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 rounded-lg text-sm">
                ❌ Failed to send test notification: {sendTestNotification.error.message}
              </div>
            )}

            {/* Save confirmation */}
            {updatePreferences.isSuccess && !hasChanges && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 rounded-lg text-sm">
                ✅ Notification preferences saved successfully!
              </div>
            )}

            {/* Master Switch */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-apple-border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium text-apple-secondary dark:text-white">Email Notifications</h3>
                  <p className="text-sm text-apple-tertiary dark:text-gray-400">Enable or disable all email notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.emailEnabled}
                    onChange={() => handleChange('emailEnabled')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Individual Settings */}
              {formData.emailEnabled && (
                <div className="space-y-3 ml-4 border-l-2 border-apple-border dark:border-gray-600 pl-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-apple-secondary dark:text-white">SMS Notifications</h4>
                      <p className="text-xs text-apple-tertiary dark:text-gray-400">Get notifications via SMS</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.smsEnabled}
                      onChange={() => handleChange('smsEnabled')}
                      className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-apple-secondary dark:text-white">Webhook Notifications</h4>
                      <p className="text-xs text-apple-tertiary dark:text-gray-400">Send notifications to a webhook URL</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.webhookEnabled}
                      onChange={() => handleChange('webhookEnabled')}
                      className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-apple-secondary dark:text-white">Slack Notifications</h4>
                      <p className="text-xs text-apple-tertiary dark:text-gray-400">Get notifications in Slack</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.slackEnabled}
                      onChange={() => handleChange('slackEnabled')}
                      className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-apple-secondary dark:text-white">Quiet Hours</h4>
                      <p className="text-xs text-apple-tertiary dark:text-gray-400">Disable notifications during specific hours</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.quietHours.enabled}
                      onChange={() => handleChange('quietHours.enabled')}
                      className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                  </div>

                  {formData.quietHours.enabled && (
                    <div className="space-y-3 ml-4 border-l-2 border-apple-border dark:border-gray-600 pl-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-apple-secondary dark:text-white">Start Time</h4>
                          <p className="text-xs text-apple-tertiary dark:text-gray-400">When quiet hours begin</p>
                        </div>
                        <input
                          type="time"
                          value={formData.quietHours.startTime}
                          onChange={(e) => handleChange('quietHours.startTime', e.target.value)}
                          className="text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-apple-secondary dark:text-white">End Time</h4>
                          <p className="text-xs text-apple-tertiary dark:text-gray-400">When quiet hours end</p>
                        </div>
                        <input
                          type="time"
                          value={formData.quietHours.endTime}
                          onChange={(e) => handleChange('quietHours.endTime', e.target.value)}
                          className="text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400">ℹ️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">
                    About Email Notifications
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Notifications are sent to: <strong>{session.user.email}</strong></li>
                      <li>Only ADMIN and POWER_USER roles receive service notifications</li>
                      <li>Use the "Send Test" button to verify your email settings</li>
                      <li>Changes are saved automatically when you click "Save Changes"</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}