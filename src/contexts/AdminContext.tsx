'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export type AdminSection =
  | 'overview'
  | 'service-templates'
  | 'service-groups'
  | 'bulk-operations'
  | 'advanced-metrics'
  | 'incidents'
  | 'maintenance'
  | 'health-issues'
  | 'analytics'
  | 'reports'
  | 'time-series'
  | 'notification-rules'
  | 'notification-analytics'
  | 'user-analytics'
  | 'user-export'
  | 'user-bulk'
  | 'system-config'
  | 'system-status'
  | 'real-time-events'
  | 'user-activity'

interface AdminContextType {
  isOpen: boolean
  activeSection: AdminSection
  setIsOpen: (open: boolean) => void
  setActiveSection: (section: AdminSection) => void
  openSection: (section: AdminSection) => void
  closePanel: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

interface AdminProviderProps {
  children: ReactNode
}

export function AdminProvider({ children }: AdminProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<AdminSection>('overview')

  const openSection = (section: AdminSection) => {
    setActiveSection(section)
    setIsOpen(true)
  }

  const closePanel = () => {
    setIsOpen(false)
  }

  return (
    <AdminContext.Provider
      value={{
        isOpen,
        activeSection,
        setIsOpen,
        setActiveSection,
        openSection,
        closePanel,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}