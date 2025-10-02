'use client'

/**
 * Shared theme management hook
 * Eliminates duplication of theme state management across components
 */

import { useState, useEffect } from 'react'

/**
 * Theme management hook with persistent storage
 */
export function useThemeManagement() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Initialize theme on mount
  useEffect(() => {
    try {
      // Check localStorage first, then fallback to system preference
      const savedTheme = localStorage.getItem('theme')
      let darkMode = false
      
      if (savedTheme) {
        darkMode = savedTheme === 'dark'
      } else {
        // Check system preference if no saved theme
        darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      
      setIsDarkMode(darkMode)
      document.documentElement.classList.toggle('dark', darkMode)
    } catch (error) {
      // Fallback to light mode if document is not available (SSR)
      setIsDarkMode(false)
    }
  }, [])

  // Toggle theme function
  const toggleTheme = () => {
    try {
      const newDarkMode = !isDarkMode
      setIsDarkMode(newDarkMode)
      document.documentElement.classList.toggle('dark', newDarkMode)
      localStorage.setItem('theme', newDarkMode ? 'dark' : 'light')
    } catch (error) {
      // Fallback if document is not available
      setIsDarkMode(!isDarkMode)
    }
  }

  // Set theme directly
  const setTheme = (darkMode: boolean) => {
    try {
      setIsDarkMode(darkMode)
      document.documentElement.classList.toggle('dark', darkMode)
      localStorage.setItem('theme', darkMode ? 'dark' : 'light')
    } catch (error) {
      // Fallback if document is not available
      setIsDarkMode(darkMode)
    }
  }

  // Force light mode (used in some pages)
  const forceLightMode = () => {
    try {
      setIsDarkMode(false)
      document.documentElement.classList.remove('dark')
    } catch (error) {
      // Fallback if document is not available
      setIsDarkMode(false)
    }
  }

  return {
    isDarkMode,
    toggleTheme,
    setTheme,
    forceLightMode
  }
}