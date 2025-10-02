'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'

export default function TermsOfUse() {
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
            Terms of Use
          </h1>
          
          <div className={`space-y-6 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using the Eniolabi Service Hub ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                2. Description of Service
              </h2>
              <p className="mb-3">
                Eniolabi Service Hub is an enterprise service monitoring and management platform that provides:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Real-time monitoring of 12+ core services and infrastructure</li>
                <li>Role-based access control (Admin, Power User, Guest)</li>
                <li>Service health checks, performance metrics, and uptime tracking</li>
                <li>Service management capabilities (start, stop, restart, backup)</li>
                <li>Email notifications and alert systems</li>
                <li>User management and audit logging</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                3. User Accounts and Responsibilities
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Account Creation
                  </h3>
                  <p>Users must provide accurate, current, and complete information during registration and maintain the accuracy of such information.</p>
                </div>
                
                <div>
                  <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Password Security
                  </h3>
                  <p>Users are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account.</p>
                </div>
                
                <div>
                  <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Role-Based Access
                  </h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Admin:</strong> Full system access, user management, service control</li>
                    <li><strong>Power User:</strong> Service monitoring, limited management actions</li>
                    <li><strong>Guest:</strong> Read-only access to service status</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                4. Acceptable Use
              </h2>
              <p className="mb-3">You agree not to use the Service to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Attempt to gain unauthorized access to the system or other users' accounts</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use the Service for any malicious or harmful purpose</li>
                <li>Attempt to reverse engineer or compromise the security of the platform</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                5. Service Availability and Maintenance
              </h2>
              <div className="space-y-3">
                <p>
                  While we strive to maintain high availability, the Service may be temporarily unavailable due to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Scheduled maintenance and updates</li>
                  <li>Unforeseen technical issues</li>
                  <li>Infrastructure changes or improvements</li>
                  <li>Force majeure events beyond our control</li>
                </ul>
                <p>
                  We will provide reasonable notice for scheduled maintenance and work to minimize service disruptions.
                </p>
              </div>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                6. Data and Privacy
              </h2>
              <p className="mb-3">
                Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Service, you consent to the collection and use of information as detailed in our Privacy Policy.
              </p>
              <p>
                We implement appropriate security measures to protect your data, including encryption, access controls, and regular security audits.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                7. Intellectual Property
              </h2>
              <p className="mb-3">
                The Service and its original content, features, and functionality are owned by Damilare Eniolabi and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p>
                Users retain ownership of their data and content submitted to the Service.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                8. Limitation of Liability
              </h2>
              <p className="mb-3">
                To the maximum extent permitted by law, Eniolabi Service Hub shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Loss of profits, data, or business opportunities</li>
                <li>Service interruptions or downtime</li>
                <li>Data loss or corruption</li>
                <li>Security breaches or unauthorized access</li>
                <li>Any damages resulting from the use or inability to use the Service</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                9. Indemnification
              </h2>
              <p>
                You agree to indemnify and hold harmless Eniolabi Service Hub, its operators, and contributors from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                10. Termination
              </h2>
              <p className="mb-3">
                We may terminate or suspend your account and access to the Service at any time, with or without cause, with or without notice, effective immediately.
              </p>
              <p>
                Upon termination, your right to use the Service will cease immediately, and we may delete your account and associated data.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                11. Governing Law
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where the Service is operated, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                12. Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last Updated" date. Your continued use of the Service after such changes constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                13. Contact Information
              </h2>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <p><strong>Service Provider:</strong> Damilare Eniolabi</p>
                <p><strong>Email:</strong> legal@eniolabi.com</p>
                <p><strong>GitHub:</strong> @damoojeje</p>
                <p><strong>Service:</strong> Eniolabi Service Hub</p>
              </div>
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
