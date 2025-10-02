/**
 * Shared utility functions for theme handling
 * Eliminates duplication across components that need dark/light mode styling
 */

/**
 * Get CSS classes for card styling based on theme
 */
export function getCardClasses(isDarkMode: boolean): string {
  return isDarkMode 
    ? 'bg-black border-gray-800' 
    : 'bg-white border-gray-200'
}

/**
 * Get CSS classes for header styling based on theme
 */
export function getHeaderClasses(isDarkMode: boolean): string {
  return isDarkMode 
    ? 'bg-black/95 border-gray-800' 
    : 'bg-white/80 border-gray-200'
}

/**
 * Get CSS classes for input styling based on theme
 */
export function getInputClasses(isDarkMode: boolean): string {
  return isDarkMode 
    ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500' 
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
}

/**
 * Get CSS classes for button styling based on theme
 */
export function getButtonClasses(isDarkMode: boolean, variant: 'primary' | 'secondary' | 'danger' = 'secondary'): string {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors duration-200'
  
  switch (variant) {
    case 'primary':
      return `${baseClasses} ${isDarkMode 
        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
        : 'bg-blue-600 hover:bg-blue-700 text-white'}`
    case 'danger':
      return `${baseClasses} ${isDarkMode 
        ? 'bg-red-600 hover:bg-red-700 text-white' 
        : 'bg-red-600 hover:bg-red-700 text-white'}`
    default:
      return `${baseClasses} ${isDarkMode 
        ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' 
        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`
  }
}

/**
 * Get CSS classes for text styling based on theme
 */
export function getTextClasses(isDarkMode: boolean, variant: 'primary' | 'secondary' | 'muted' = 'primary'): string {
  switch (variant) {
    case 'primary':
      return isDarkMode ? 'text-white' : 'text-gray-900'
    case 'secondary':
      return isDarkMode ? 'text-gray-300' : 'text-gray-600'
    case 'muted':
      return isDarkMode ? 'text-gray-400' : 'text-gray-500'
    default:
      return isDarkMode ? 'text-white' : 'text-gray-900'
  }
}

/**
 * Get CSS classes for border styling based on theme
 */
export function getBorderClasses(isDarkMode: boolean): string {
  return isDarkMode ? 'border-gray-800' : 'border-gray-200'
}

/**
 * Get CSS classes for background styling based on theme
 */
export function getBackgroundClasses(isDarkMode: boolean): string {
  return isDarkMode ? 'bg-black' : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
}
