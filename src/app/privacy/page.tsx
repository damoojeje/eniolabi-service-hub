'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'

export default function PrivacyPolicy() {
  const { theme, toggleTheme } = useTheme()
  const isDarkMode = theme === 'dark'

  // Removed force light mode - let users use their preferred theme

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
      <main className="flex-1 container mx-auto px-6 py-6 pb-20">
        <div className={`prose ${isDarkMode ? 'prose-invert' : ''} max-w-none`}>
          <h1 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Privacy Policy
          </h1>
          
          <div className={`space-y-6 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                1. Information We Collect
              </h2>
              <p className="mb-3">
                Eniolabi Service Hub collects the following types of information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Username, email address, and role assignments (Admin, Power User, Guest)</li>
                <li><strong>Service Monitoring Data:</strong> Service health status, response times, uptime metrics, and performance data</li>
                <li><strong>System Logs:</strong> Authentication attempts, user actions, and system events for security and auditing</li>
                <li><strong>Technical Data:</strong> IP addresses, browser information, and device details for security purposes</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                2. How We Use Your Information
              </h2>
              <p className="mb-3">We use the collected information for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Providing and maintaining the service monitoring dashboard</li>
                <li>Authenticating users and managing role-based access control</li>
                <li>Monitoring service health and performance across your infrastructure</li>
                <li>Sending alerts and notifications about service issues</li>
                <li>Improving system performance and user experience</li>
                <li>Ensuring security and preventing unauthorized access</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                3. Data Security
              </h2>
              <p className="mb-3">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>End-to-end encryption for data transmission</li>
                <li>Secure authentication using NextAuth.js with JWT tokens</li>
                <li>Role-based access control (RBAC) for data protection</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Secure database connections with PostgreSQL</li>
                <li>Redis-based session management with password protection</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                4. Data Retention
              </h2>
              <p className="mb-3">
                We retain your data for the following periods:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Data:</strong> Retained while your account is active</li>
                <li><strong>Service Metrics:</strong> Stored for 90 days for performance analysis</li>
                <li><strong>Audit Logs:</strong> Kept for 1 year for security and compliance</li>
                <li><strong>Backup Data:</strong> Retained for 30 days for disaster recovery</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                5. Your Rights
              </h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal data and account information</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account and associated data</li>
                <li>Export your data in a portable format</li>
                <li>Opt-out of non-essential communications</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                6. Third-Party Services
              </h2>
              <p className="mb-3">
                Our service integrates with the following third-party services:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Monitoring:</strong> Home Assistant, Portainer, n8n, Media Dashboard, Node-RED, Wiki.js, VS Code Server, File Browser, Uptime Kuma, Zigbee2MQTT, WhenNXT, Nginx UI</li>
                <li><strong>Infrastructure:</strong> Docker containers, PostgreSQL database, Redis cache</li>
                <li><strong>Authentication:</strong> NextAuth.js for secure user management</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                7. Contact Information
              </h2>
              <p className="mb-3">
                For privacy-related questions or concerns, please contact:
              </p>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <p><strong>Data Protection Officer:</strong> Damilare Eniolabi</p>
                <p><strong>Email:</strong> privacy@eniolabi.com</p>
                <p><strong>GitHub:</strong> @damoojeje</p>
              </div>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                8. Updates to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date. Your continued use of the service after such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <div className={`text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-8 pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <p>Last Updated: August 25, 2025</p>
              <p>Version: 1.0</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
