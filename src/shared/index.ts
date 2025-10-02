/**
 * Shared utilities index
 * Export all shared functions and types for easy importing
 */

// Array utilities
export * from './arrayUtils'

// Status utilities (chart-specific functions)
export * from './statusUtils'

// Consolidated status configuration (primary source for status/notification utilities)
export * from './statusConfig'

// Theme utilities
export * from './themeUtils'

// Theme hook (client-side only)
// export * from './themeHook' // Exported separately to avoid client/server conflicts

// Database utilities
export * from './dbUtils'

// Validation schemas
export * from './validationSchemas'

// Error utilities
export * from './errorUtils'

// Authentication utilities
export * from './authUtils'

// Legacy notification types (for backward compatibility)
export type { NotificationPriority } from './notificationUtils'
