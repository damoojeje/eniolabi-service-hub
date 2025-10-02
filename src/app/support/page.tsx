'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'

export default function Support() {
  const { theme, toggleTheme } = useTheme()
  const isDarkMode = theme === 'dark'
  const [activeTab, setActiveTab] = useState('general')

  // Removed force light mode - let users use their preferred theme

  const supportTabs = [
    { id: 'general', label: 'General Help', icon: '❓' },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: '🔧' },
    { id: 'faq', label: 'FAQ', icon: '📋' },
    { id: 'contact', label: 'Contact', icon: '📧' }
  ]

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Subtle background gradients */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-100/40 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-green-100/40 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-lg font-semibold text-gray-900">
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-6 pb-20 relative z-20">
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Support Center
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Get help with Eniolabi Service Hub
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {supportTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? isDarkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={`max-w-4xl mx-auto relative z-30 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          
          {/* General Help Tab */}
          {activeTab === 'general' && (
            <div className="space-y-8">
              <section>
                <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Getting Started
                </h2>
                <div className="space-y-4">
                  <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      🚀 First Time Setup
                    </h3>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>Contact your system administrator for initial login credentials</li>
                      <li>Change your password immediately after first login</li>
                      <li>Configure your service endpoints in the admin panel</li>
                      <li>Set up email notifications for alerts</li>
                    </ol>
                  </div>

                  <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      👥 User Roles
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl mb-2">👑</div>
                        <h4 className="font-medium">Admin</h4>
                        <p className="text-sm">Full system access</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="text-2xl mb-2">⚡</div>
                        <h4 className="font-medium">Power User</h4>
                        <p className="text-sm">Limited management</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl mb-2">👤</div>
                        <h4 className="font-medium">Guest</h4>
                        <p className="text-sm">Read-only access</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Troubleshooting Tab */}
          {activeTab === 'troubleshooting' && (
            <div className="space-y-8">
              <section>
                <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Common Issues & Solutions
                </h2>
                <div className="space-y-4">
                  <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      🔴 Service Shows Offline
                    </h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Check if the service is running on your infrastructure</li>
                      <li>Verify the health endpoint URL is correct</li>
                      <li>Check firewall and network connectivity</li>
                      <li>Review service logs for errors</li>
                    </ul>
                  </div>

                  <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      🔐 Authentication Issues
                    </h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Ensure your account is active and not locked</li>
                      <li>Check if your password has expired</li>
                      <li>Clear browser cookies and cache</li>
                      <li>Contact admin if account is disabled</li>
                    </ul>
                  </div>

                  <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      📧 Email Notifications Not Working
                    </h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Verify SMTP settings in admin panel</li>
                      <li>Check spam/junk folders</li>
                      <li>Ensure email server is accessible</li>
                      <li>Test email configuration</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-4">
                <details className={`group ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg`}>
                  <summary className={`flex cursor-pointer items-center justify-between p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    How do I add a new service to monitor?
                    <span className="ml-2 transition-transform group-open:rotate-180">▼</span>
                  </summary>
                  <div className="px-4 pb-4">
                    <p>Admins can add new services through the admin panel. Navigate to Services → Add New Service and provide the service URL, health endpoint, and category information.</p>
                  </div>
                </details>

                <details className={`group ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg`}>
                  <summary className={`flex cursor-pointer items-center justify-between p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Can I customize the monitoring intervals?
                    <span className="ml-2 transition-transform group-open:rotate-180">▼</span>
                  </summary>
                  <div className="px-4 pb-4">
                    <p>Yes, each service can have custom monitoring intervals. The default is 30 seconds, but you can adjust this based on your needs. Lower intervals provide more real-time updates but increase system load.</p>
                  </div>
                </details>

                <details className={`group ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg`}>
                  <summary className={`flex cursor-pointer items-center justify-between p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    How secure is the platform?
                    <span className="ml-2 transition-transform group-open:rotate-180">▼</span>
                  </summary>
                  <div className="px-4 pb-4">
                    <p>Eniolabi Service Hub implements enterprise-grade security including JWT authentication, role-based access control, encrypted communications, and regular security audits. All data is stored securely with proper access controls.</p>
                  </div>
                </details>

                <details className={`group ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg`}>
                  <summary className={`flex cursor-pointer items-center justify-between p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    What happens if a service goes down?
                    <span className="ml-2 transition-transform group-open:rotate-200">▼</span>
                  </summary>
                  <div className="px-4 pb-4">
                    <p>When a service goes offline, the system will: 1) Update the status to "OFFLINE" in real-time, 2) Send email notifications to configured recipients, 3) Log the incident for tracking, 4) Continue monitoring for recovery.</p>
                  </div>
                </details>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-8">
              <section>
                <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Get in Touch
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      📧 Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">👨‍💻</span>
                        <div>
                          <p className="font-medium">Developer</p>
                          <p className="text-sm">Damilare Eniolabi</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">📧</span>
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-sm">support@eniolabi.com</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">🐙</span>
                        <div>
                          <p className="font-medium">GitHub</p>
                          <p className="text-sm">@damoojeje</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      🚨 Emergency Support
                    </h3>
                    <div className="space-y-3">
                      <p className="text-sm">For critical system issues or security concerns:</p>
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                          Emergency: +1 (555) 123-4567
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-300">
                          Available 24/7 for critical issues
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  📋 Support Request Form
                </h2>
                <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <form className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Subject
                      </label>
                      <input
                        type="text"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="Brief description of your issue"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Message
                      </label>
                      <textarea
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="Detailed description of your issue or question"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors`}
                    >
                      Send Support Request
                    </button>
                  </form>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
