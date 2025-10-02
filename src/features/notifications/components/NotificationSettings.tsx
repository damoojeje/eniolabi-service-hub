/**
 * NotificationSettings Component
 * Comprehensive notification preferences and rules management
 */

import React, { Fragment, useState } from 'react'
import { Dialog, Transition, Switch } from '@headlessui/react'
import {
  BellIcon,
  CogIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useNotifications, useNotificationRules } from '../hooks/useNotifications'
import { type NotificationSettingsProps } from '../types/notification.types'

export function NotificationSettings({
  preferences,
  rules,
  onUpdatePreferences,
  onCreateRule,
  onUpdateRule,
  onDeleteRule,
  onTestRule
}: NotificationSettingsProps) {
  const [activeTab, setActiveTab] = useState<'preferences' | 'rules'>('preferences')

  const tabs = [
    { id: 'preferences' as const, name: 'Preferences', icon: BellIcon },
    { id: 'rules' as const, name: 'Rules', icon: CogIcon }
  ]

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'preferences' && (
        <NotificationPreferences 
          preferences={preferences}
          onUpdate={onUpdatePreferences}
        />
      )}

      {activeTab === 'rules' && (
        <NotificationRules
          rules={rules}
          onCreate={onCreateRule}
          onUpdate={onUpdateRule}
          onDelete={onDeleteRule}
          onTest={onTestRule}
        />
      )}
    </div>
  )
}

function NotificationPreferences({ 
  preferences, 
  onUpdate 
}: { 
  preferences: any
  onUpdate: (prefs: any) => void 
}) {
  const handleChannelToggle = (type: string, channel: string, enabled: boolean) => {
    const currentChannels = preferences?.preferences?.[type] || []
    const newChannels = enabled 
      ? [...currentChannels.filter((c: string) => c !== channel), channel]
      : currentChannels.filter((c: string) => c !== channel)
    
    onUpdate({
      preferences: {
        ...preferences?.preferences,
        [type]: newChannels
      }
    })
  }

  const handleGlobalToggle = (channel: string, enabled: boolean) => {
    onUpdate({
      [`${channel}Enabled`]: enabled
    })
  }

  const notificationTypes = [
    { id: 'service_down', label: 'Service Down', description: 'When a service goes offline' },
    { id: 'service_up', label: 'Service Up', description: 'When a service comes back online' },
    { id: 'slow_response', label: 'Slow Response', description: 'When response times are high' },
    { id: 'maintenance', label: 'Maintenance', description: 'Scheduled maintenance notifications' },
    { id: 'security', label: 'Security', description: 'Security alerts and warnings' },
    { id: 'user_action', label: 'User Actions', description: 'Account and user-related notifications' },
    { id: 'system', label: 'System', description: 'System-wide announcements' }
  ]

  const channels = [
    { id: 'in_app', label: 'In-App', description: 'Show in notification center' },
    { id: 'email', label: 'Email', description: 'Send email notifications', globalKey: 'emailEnabled' },
    { id: 'sms', label: 'SMS', description: 'Send SMS notifications (premium)', globalKey: 'smsEnabled' },
    { id: 'webhook', label: 'Webhook', description: 'HTTP webhook notifications', globalKey: 'webhookEnabled' },
    { id: 'slack', label: 'Slack', description: 'Slack channel notifications', globalKey: 'slackEnabled' }
  ]

  return (
    <div className="space-y-8">
      {/* Global Channel Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Global Channel Settings
        </h3>
        
        <div className="space-y-4">
          {channels.filter(c => c.globalKey).map((channel) => (
            <div key={channel.id} className="flex items-center justify-between py-3">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {channel.label}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {channel.description}
                </p>
              </div>
              
              <Switch
                checked={preferences?.[channel.globalKey as keyof typeof preferences] || false}
                onChange={(enabled) => handleGlobalToggle(channel.id, enabled)}
                className={`${
                  preferences?.[channel.globalKey as keyof typeof preferences] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    preferences?.[channel.globalKey as keyof typeof preferences] ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
          ))}
        </div>
      </div>

      {/* Per-Type Notification Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Notification Types
        </h3>
        
        <div className="space-y-6">
          {notificationTypes.map((type) => (
            <div key={type.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {type.label}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {type.description}
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {channels.map((channel) => {
                  const isEnabled = preferences?.preferences?.[type.id]?.includes(channel.id) || false
                  const isGloballyDisabled = channel.globalKey ? !preferences?.[channel.globalKey as keyof typeof preferences] : false
                  
                  return (
                    <label
                      key={channel.id}
                      className={`flex items-center space-x-2 p-2 rounded-md border ${
                        isGloballyDisabled 
                          ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-50' 
                          : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      } cursor-pointer transition-colors`}
                    >
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        disabled={isGloballyDisabled}
                        onChange={(e) => handleChannelToggle(type.id, channel.id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {channel.label}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Quiet Hours
        </h3>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Enable Quiet Hours
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Suppress non-critical notifications during specified hours
              </p>
            </div>
            
            <Switch
              checked={preferences?.quietHours?.enabled || false}
              onChange={(enabled) => onUpdate({
                quietHours: {
                  ...preferences?.quietHours,
                  enabled
                }
              })}
              className={`${
                preferences?.quietHours?.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  preferences?.quietHours?.enabled ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
          
          {preferences?.quietHours?.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={preferences.quietHours.startTime || '22:00'}
                  onChange={(e) => onUpdate({
                    quietHours: {
                      ...preferences.quietHours,
                      startTime: e.target.value
                    }
                  })}
                  className="block w-full px-3 py-2 text-sm border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={preferences.quietHours.endTime || '08:00'}
                  onChange={(e) => onUpdate({
                    quietHours: {
                      ...preferences.quietHours,
                      endTime: e.target.value
                    }
                  })}
                  className="block w-full px-3 py-2 text-sm border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Digest Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Digest Settings
        </h3>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Enable Email Digest
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive periodic summaries of notifications
              </p>
            </div>
            
            <Switch
              checked={preferences?.digestSettings?.enabled || false}
              onChange={(enabled) => onUpdate({
                digestSettings: {
                  ...preferences?.digestSettings,
                  enabled
                }
              })}
              className={`${
                preferences?.digestSettings?.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  preferences?.digestSettings?.enabled ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
          
          {preferences?.digestSettings?.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Frequency
                </label>
                <select
                  value={preferences.digestSettings.frequency || 'daily'}
                  onChange={(e) => onUpdate({
                    digestSettings: {
                      ...preferences.digestSettings,
                      frequency: e.target.value
                    }
                  })}
                  className="block w-full px-3 py-2 text-sm border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={preferences.digestSettings.time || '09:00'}
                  onChange={(e) => onUpdate({
                    digestSettings: {
                      ...preferences.digestSettings,
                      time: e.target.value
                    }
                  })}
                  className="block w-full px-3 py-2 text-sm border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function NotificationRules({ 
  rules, 
  onCreate, 
  onUpdate, 
  onDelete, 
  onTest 
}: {
  rules: any[]
  onCreate: (rule: any) => void
  onUpdate: (rule: any) => void
  onDelete: (id: string) => void
  onTest: (id: string) => void
}) {
  const [isCreating, setIsCreating] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Notification Rules
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Define custom rules for automated notifications
          </p>
        </div>
        
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Rule
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 dark:border-gray-700 rounded-lg">
          <CogIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
            No notification rules
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create rules to automate notification delivery and management.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <div key={rule.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {rule.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {rule.description}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={rule.isActive}
                    onChange={(enabled) => onUpdate({ ...rule, isActive: enabled })}
                    className={`${
                      rule.isActive ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        rule.isActive ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                <div>
                  <span className="font-medium">Types:</span> {rule.conditions.types.join(', ')}
                </div>
                <div>
                  <span className="font-medium">Priorities:</span> {rule.conditions.priorities.join(', ')}
                </div>
                <div>
                  <span className="font-medium">Channels:</span> {rule.actions.channels.join(', ')}
                </div>
                <div>
                  <span className="font-medium">Cooldown:</span> {rule.cooldown} minutes
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onTest(rule.id)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-900"
                >
                  <PlayIcon className="h-3 w-3 mr-1" />
                  Test
                </button>
                
                <button
                  onClick={() => {/* TODO: Edit rule */}}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-900"
                >
                  <PencilIcon className="h-3 w-3 mr-1" />
                  Edit
                </button>
                
                <button
                  onClick={() => onDelete(rule.id)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900"
                >
                  <TrashIcon className="h-3 w-3 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}