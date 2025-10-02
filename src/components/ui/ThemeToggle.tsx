'use client'

import React from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface ThemeToggleProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export default function ThemeToggle({ size = 'medium', className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDarkMode = theme === 'dark'

  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-10 h-10 text-base', 
    large: 'w-12 h-12 text-lg'
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-full
        bg-apple-surface dark:bg-gray-800
        border border-apple-border dark:border-gray-600
        text-apple-secondary dark:text-gray-300
        hover:bg-apple-background dark:hover:bg-gray-700
        hover:text-apple-primary dark:hover:text-yellow-400
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-apple-primary dark:focus:ring-yellow-400
        ${className}
      `}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        // Moon icon for dark mode
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        // Sun icon for light mode
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      )}
    </button>
  )
}