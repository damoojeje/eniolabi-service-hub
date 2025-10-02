'use client'

/**
 * Note Card Component
 * Individual note display in list/grid view with actions
 */

import React, { useState } from 'react'
import { 
  PencilIcon,
  TrashIcon,
  TagIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { MapPinIcon as PinIconSolid } from '@heroicons/react/24/solid'
import { NoteCardProps } from '../types/note.types'

export function NoteCard({ 
  note, 
  onEdit, 
  onDelete, 
  onPin, 
  onClick 
}: NoteCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger onClick if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    onClick?.(note.id)
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    const now = new Date()
    const diffInHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return d.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    } else if (diffInHours < 24 * 7) {
      return d.toLocaleDateString('en-US', { 
        weekday: 'short',
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    } else {
      return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: now.getFullYear() !== d.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <div
      className={`group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600' : ''
      } ${note.isPinned ? 'ring-1 ring-yellow-400 dark:ring-yellow-500' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Pin indicator */}
      {note.isPinned && (
        <div className="absolute top-2 right-2">
          <PinIconSolid className="w-4 h-4 text-yellow-500" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate pr-6">
            {note.title}
          </h3>
          <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
            <ClockIcon className="w-4 h-4 mr-1" />
            <span>Updated {formatDate(note.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Content Preview */}
      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
          {truncateContent(note.content)}
        </p>
      </div>

      {/* Category and Tags */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Category */}
          <div className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md">
            <DocumentTextIcon className="w-3 h-3 mr-1" />
            {note.category}
          </div>
        </div>
      </div>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag) => (
              <div
                key={tag}
                className="inline-flex items-center px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md"
              >
                <TagIcon className="w-3 h-3 mr-1" />
                {tag}
              </div>
            ))}
            {note.tags.length > 3 && (
              <div className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-md">
                +{note.tags.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className={`flex items-center justify-end space-x-1 transition-opacity duration-200 ${
        isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPin(note.id, !note.isPinned)
          }}
          className={`inline-flex items-center p-2 rounded-lg transition-colors duration-200 ${
            note.isPinned
              ? 'text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title={note.isPinned ? 'Unpin note' : 'Pin note'}
        >
          {note.isPinned ? (
            <PinIconSolid className="w-4 h-4" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
            </svg>
          )}
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(note.id)
          }}
          className="inline-flex items-center p-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
          title="Edit note"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(note.id)
          }}
          className="inline-flex items-center p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
          title="Delete note"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Content length indicator */}
      <div className="absolute bottom-2 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {note.content.length} characters
        </span>
      </div>
    </div>
  )
}