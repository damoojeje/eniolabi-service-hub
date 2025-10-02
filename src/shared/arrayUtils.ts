/**
 * Shared utility functions for safely handling arrays from various data sources
 * Eliminates duplication across components that need to extract arrays from tRPC responses
 */

/**
 * Safely extracts an array from various data formats
 * Handles cases where data might be wrapped in objects or have different structures
 */
export function getArrayFromData<T>(data: any): T[] {
  // Handle loading state
  if (!data) return []
  
  // Handle direct array
  if (Array.isArray(data)) return data
  
  // Handle wrapped array (like { json: [...] })
  if (data.json && Array.isArray(data.json)) return data.json
  
  // Handle other object structures
  if (typeof data === 'object' && data.data && Array.isArray(data.data)) return data.data
  
  // Fallback for any other structure - extract arrays
  if (typeof data === 'object') {
    const values = Object.values(data)
    for (const value of values) {
      if (Array.isArray(value)) return value
    }
  }
  
  // Safe fallback
  console.warn('Data is not in expected format:', typeof data, data)
  return []
}

/**
 * Safely filters an array with additional safety checks
 */
export function safeArrayFilter<T>(
  array: T[],
  predicate: (item: T, index: number, array: T[]) => boolean
): T[] {
  if (!Array.isArray(array)) {
    console.error('Array is not an array:', typeof array, array)
    return []
  }
  
  return array.filter(predicate)
}

/**
 * Safely sorts an array with additional safety checks
 */
export function safeArraySort<T>(
  array: T[],
  compareFn?: (a: T, b: T) => number
): T[] {
  if (!Array.isArray(array)) {
    console.error('Array is not an array:', typeof array, array)
    return []
  }
  
  return [...array].sort(compareFn)
}
