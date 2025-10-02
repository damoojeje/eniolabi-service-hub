'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  isDarkMode: boolean
}

export default function ChangePasswordModal({ isOpen, onClose, isDarkMode }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const changePasswordMutation = trpc.users.changePassword.useMutation({
    onSuccess: () => {
      // Reset form
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setErrors([])
      onClose()
    },
    onError: (error) => {
      setErrors([error.message])
    },
  })

  const validateForm = () => {
    const newErrors: string[] = []

    if (!currentPassword) {
      newErrors.push('Current password is required')
    }

    if (!newPassword) {
      newErrors.push('New password is required')
    } else if (newPassword.length < 6) {
      newErrors.push('New password must be at least 6 characters')
    }

    if (newPassword !== confirmPassword) {
      newErrors.push('New passwords do not match')
    }

    if (currentPassword === newPassword) {
      newErrors.push('New password must be different from current password')
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl shadow-xl w-full max-w-md transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Change Password
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter your current password"
                  required
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                New Password
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter your new password"
                required
                minLength={6}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Confirm New Password
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Confirm your new password"
                required
              />
            </div>

            {/* Show Password Toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showPasswords"
                checked={showPasswords}
                onChange={(e) => setShowPasswords(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="showPasswords" className={`ml-2 text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Show passwords
              </label>
            </div>

            {/* Error Messages */}
            {errors.length > 0 && (
              <div className={`p-3 rounded-lg ${
                isDarkMode 
                  ? 'bg-red-900/20 border border-red-800 text-red-400' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <ul className="text-sm space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="space-y-2">
                <div className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Password Strength
                </div>
                <div className="flex space-x-1">
                  {[...Array(4)].map((_, i) => {
                    const strength = Math.min(4, Math.max(0, 
                      (newPassword.length >= 6 ? 1 : 0) +
                      (/[A-Z]/.test(newPassword) ? 1 : 0) +
                      (/[0-9]/.test(newPassword) ? 1 : 0) +
                      (/[^A-Za-z0-9]/.test(newPassword) ? 1 : 0)
                    ))
                    return (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded ${
                          i < strength 
                            ? strength === 1 ? 'bg-red-500' 
                            : strength === 2 ? 'bg-yellow-500'
                            : strength === 3 ? 'bg-blue-500'
                            : 'bg-green-500'
                            : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                        }`}
                      />
                    )
                  })}
                </div>
                <div className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Use 6+ characters with uppercase, numbers, and symbols for a strong password
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}