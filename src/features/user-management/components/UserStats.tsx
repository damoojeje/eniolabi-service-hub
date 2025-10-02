'use client'

/**
 * User Statistics Component
 * Displays user management statistics in cards
 */

import React from 'react'
import { 
  UserGroupIcon, 
  UserIcon, 
  ShieldCheckIcon,
  ClockIcon 
} from '@heroicons/react/24/outline'
import { UserStats as UserStatsType } from '../types/user.types'

interface UserStatsProps {
  stats?: UserStatsType
  isLoading?: boolean
  className?: string
}

export function UserStats({ stats, isLoading, className = '' }: UserStatsProps) {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    {
      title: 'Total Users',
      value: stats.total.toString(),
      icon: UserGroupIcon,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Active Users',
      value: stats.status.active.toString(),
      icon: UserIcon,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Administrators',
      value: stats.roles.admins.toString(),
      icon: ShieldCheckIcon,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: 'Recent Logins',
      value: stats.recentLogins.toString(),
      icon: ClockIcon,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ]

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {statCards.map((card, index) => (
        <div 
          key={index}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {card.value}
              </p>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {card.title}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}