'use client'

import { useState, FormEvent, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppleClock from '@/components/ui/AppleClock'
import { useTheme } from '@/contexts/ThemeContext'

export default function SignIn() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  
  const { theme, toggleTheme } = useTheme()
  const isDarkMode = theme === 'dark'

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Set mounted state and initialize theme
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid username or password')
        setIsLoading(false)
        return
      }

      // Check session and redirect based on role
      const session = await getSession()
      if (session?.user) {
        switch (session.user.role) {
          case 'ADMIN':
            router.push('/dashboard?welcome=admin')
            break
          case 'POWER_USER':
            router.push('/dashboard?welcome=power_user')
            break
          case 'GUEST':
            router.push('/dashboard?welcome=guest')
            break
          default:
            router.push('/dashboard')
        }
      }
    } catch (error) {
      setError('An error occurred during sign in')
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-white text-gray-900'
    }`}>
      {/* Subtle background gradients */}
      <div className="absolute inset-0">
        <div className={`absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-blue-900/40' 
            : 'bg-blue-100/40'
        }`}></div>
        <div className={`absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-green-900/40' 
            : 'bg-green-100/40'
        }`}></div>
      </div>

      {/* Top Navigation with Theme Toggle */}
      <div className="absolute top-6 left-0 right-0 z-10">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <AppleClock className={`transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`} />
            
            <button 
              onClick={toggleTheme}
              className={`p-3 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-lg ${
                isDarkMode 
                  ? 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-200 border border-gray-600/50' 
                  : 'bg-white/80 hover:bg-gray-50/80 text-gray-700 border border-gray-200/50'
              } backdrop-blur-sm`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Centered without scrolling */}
      <div className="h-screen flex flex-col items-center justify-center px-6 pb-20">
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex flex-col items-center animate-fade-in">
            
            {/* Header Section with Feature Highlights */}
            <div className="text-center animate-slide-down">
              <h1 className={`text-4xl font-bold mb-3 animate-fade-in-delay-1 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Service Hub
              </h1>
              <p className={`text-lg mb-6 animate-fade-in-delay-2 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Your centralized gateway to all services
              </p>
              
              {/* Feature Highlights */}
              <div className="flex flex-wrap justify-center gap-4 mb-6 animate-fade-in-delay-3">
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md ${
                  isDarkMode 
                    ? 'bg-blue-900/20 border-blue-700 hover:bg-blue-800/30 hover:border-blue-600' 
                    : 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                }`}>
                  <span className="text-blue-600 text-lg">🛡️</span>
                  <span className={`font-medium text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-800'
                  }`}>Secure Access</span>
                </div>
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md ${
                  isDarkMode 
                    ? 'bg-green-900/20 border-green-700 hover:bg-green-800/30 hover:border-green-600' 
                    : 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300'
                }`}>
                  <span className="text-green-600 text-lg">🌐</span>
                  <span className={`font-medium text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-green-300' : 'text-green-800'
                  }`}>Unified Control</span>
                </div>
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md ${
                  isDarkMode 
                    ? 'bg-purple-900/20 border-purple-700 hover:bg-purple-800/30 hover:border-purple-600' 
                    : 'bg-purple-50 border-purple-200 hover:bg-purple-100 hover:border-purple-300'
                }`}>
                  <span className="text-purple-600 text-lg">🔌</span>
                  <span className={`font-medium text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-purple-300' : 'text-purple-800'
                  }`}>Easy Setup</span>
                </div>
              </div>
            </div>

            {/* Login Card - Added 2px spacing with mb-0.5 */}
            <div className="w-full max-w-xs animate-slide-up mb-0.5">
              <div className={`rounded-xl p-6 shadow-2xl border transition-all duration-500 transform hover:scale-105 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 hover:shadow-3xl' 
                  : 'bg-white border-gray-100 hover:shadow-3xl'
              }`}>
                
                {/* Welcome Message */}
                <div className="text-center mb-6">
                  <h2 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Welcome Back
                  </h2>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Sign in to access your services
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="px-4 py-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-600 animate-shake">
                      {error}
                    </div>
                  )}

                  {/* Username field */}
                  <div className="space-y-2 group">
                    <label htmlFor="username" className={`block text-sm font-medium transition-colors duration-200 ${
                      isDarkMode ? 'text-gray-300 group-hover:text-blue-400' : 'text-gray-700 group-hover:text-blue-600'
                    }`}>
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 transition-all duration-300 hover:shadow-sm focus:shadow-md ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 hover:border-gray-400'
                      }`}
                      disabled={isLoading}
                      placeholder="Enter your username"
                    />
                  </div>

                  {/* Password field */}
                  <div className="space-y-2 group">
                    <label htmlFor="password" className={`block text-sm font-medium transition-colors duration-200 ${
                      isDarkMode ? 'text-gray-300 group-hover:text-blue-400' : 'text-gray-700 group-hover:text-blue-600'
                    }`}>
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={`w-full px-3 py-2.5 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 transition-all duration-300 hover:shadow-sm focus:shadow-md ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 hover:border-gray-400'
                        }`}
                        disabled={isLoading}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-all duration-200 hover:scale-110 ${
                          isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                        }`}
                        onClick={() => {
                          const input = document.getElementById('password') as HTMLInputElement;
                          if (input.type === 'password') {
                            input.type = 'text';
                          } else {
                            input.type = 'password';
                          }
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Sign In button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#007AFF] hover:bg-[#0056CC] text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14l-1.41-1.41L15.17 13H9v-2h6.17L12.59 8.59L14 7l5 5-5 5z"/>
                    </svg>
                    <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}