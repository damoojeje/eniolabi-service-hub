/** @type {import('next').NextConfig} */
const nextConfig = {
  // Development mode optimizations
  reactStrictMode: true, // Better development debugging

  // Removed api configuration (deprecated in Next.js 14)
  // API routes configuration is now handled per route with export const config

  // Server configuration
  serverRuntimeConfig: {
    // Increase timeout for large file uploads
    maxDuration: 60, // 60 seconds
  },
  
  // Ensure static assets are properly handled
  distDir: '.next',
  
  // Development-friendly settings
  eslint: {
    ignoreDuringBuilds: true, // Temporarily disable ESLint during builds
  },
  
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore TypeScript errors during builds
  },
  
  // Development optimizations
  experimental: {
    outputFileTracingRoot: process.cwd(),
    // Development-specific experiments
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    // Enable better development features
    serverComponentsExternalPackages: ['@prisma/client'],
    // Better development debugging
    instrumentationHook: process.env.NODE_ENV === 'development',
  },
  
  // Webpack configuration to handle Node.js built-in modules
  webpack: (config, { isServer, dev }) => {
    // Development-specific webpack optimizations
    if (dev) {
      config.devtool = 'eval-source-map' // Better source maps for development
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false, // Keep modules for hot reload
        removeEmptyChunks: false, // Better development experience
        splitChunks: false, // Disable chunk splitting in development
      }
    }
    
    // Externalize Node.js built-in modules on server side
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        'node:crypto': 'commonjs crypto',
        'node:fs': 'commonjs fs', 
        'node:net': 'commonjs net',
        'node:tls': 'commonjs tls',
        'node:url': 'commonjs url',
        'node:util': 'commonjs util',
        'node:stream': 'commonjs stream',
        'node:timers/promises': 'commonjs timers/promises',
      })
    }
    
    // Handle fallbacks for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        querystring: false,
        'node:crypto': false,
        'node:fs': false,
        'node:net': false,
        'node:tls': false,
        'node:url': false,
        'node:util': false,
        'node:stream': false,
        'node:timers/promises': false,
      }
    }
    
    return config
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer-when-downgrade',
          },
          // Development-specific headers
          ...(process.env.NODE_ENV === 'development' ? [
            {
              key: 'X-Development-Mode',
              value: 'true',
            },
            {
              key: 'X-Hot-Reload',
              value: 'enabled',
            }
          ] : []),
        ],
      },
    ]
  },
  
  // Development-specific configuration
  ...(process.env.NODE_ENV === 'development' && {
    // Enable better development features
    swcMinify: false, // Disable SWC minification in development
    compiler: {
      removeConsole: false, // Keep console logs in development
    },
    // Better development experience
    onDemandEntries: {
      maxInactiveAge: 25 * 1000, // Keep pages in memory longer
      pagesBufferLength: 2, // Buffer more pages
    },
  }),
}

export default nextConfig;
