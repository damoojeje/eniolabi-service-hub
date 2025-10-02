/**
 * Get the base URL for API requests
 * In production, this is the domain
 * In development, this is localhost:3003
 */
export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Browser should use relative path
    return ''
  }

  if (process.env.VERCEL_URL) {
    // Reference for vercel.com
    return `https://${process.env.VERCEL_URL}`
  }

  if (process.env.NODE_ENV === 'production') {
    // Production should use the domain
    return 'https://eniolabi.com'
  }

  // Assume localhost:3003 in development
  return `http://localhost:3003`
}
