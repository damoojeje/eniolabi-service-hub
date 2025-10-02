'use client'

/**
 * Note Detail Page
 * Page for viewing and editing individual notes
 */

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import { 
  ArrowLeftIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  TagIcon,
  DocumentTextIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { MapPinIcon as PinIconSolid } from '@heroicons/react/24/solid'
import { NoteEditor } from '@/features/notes/components/NoteEditor'
import { useNotifications } from '@/contexts/NotificationContext'
import { trpc } from '@/lib/trpc'
import { CreateNoteInput, UpdateNoteInput } from '@/features/notes/types/note.types'
import Link from 'next/link'

interface NotePageProps {
  params: {
    id: string
  }
}

export default function NotePage({ params }: NotePageProps) {
  const router = useRouter()
  const { addToast } = useNotifications()
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data: note, isLoading, error } = trpc.notes.getNote.useQuery(
    { id: params.id }
  )

  const utils = trpc.useContext()

  const updateNoteMutation = trpc.notes.updateNote.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Note updated successfully'
      })
      setIsEditing(false)
      utils.notes.getNote.invalidate({ id: params.id })
      utils.notes.getNotes.invalidate()
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update note'
      })
    }
  })

  const deleteNoteMutation = trpc.notes.deleteNote.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Note deleted successfully'
      })
      router.push('/notes')
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to delete note'
      })
    }
  })

  const pinNoteMutation = trpc.notes.pinNote.useMutation({
    onSuccess: (updatedNote) => {
      addToast({
        type: 'success',
        title: 'Success',
        message: updatedNote.isPinned ? 'Note pinned' : 'Note unpinned'
      })
      utils.notes.getNote.invalidate({ id: params.id })
      utils.notes.getNotes.invalidate()
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update note'
      })
    }
  })

  const handleSave = async (noteData: CreateNoteInput | UpdateNoteInput) => {
    if (!('id' in noteData)) {
      throw new Error('Cannot create note in edit mode')
    }
    await updateNoteMutation.mutateAsync(noteData)
  }

  const handlePin = async () => {
    if (!note) return
    await pinNoteMutation.mutateAsync({
      id: note.id,
      isPinned: !note.isPinned
    })
  }

  const handleDelete = async () => {
    await deleteNoteMutation.mutateAsync({ id: params.id })
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatPreview = (content: string) => {
    return content
      .split('\n')
      .map(line => {
        // Headers
        if (line.startsWith('# ')) {
          return `<h1 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">${line.substring(2)}</h1>`
        }
        if (line.startsWith('## ')) {
          return `<h2 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white">${line.substring(3)}</h2>`
        }
        if (line.startsWith('### ')) {
          return `<h3 class="text-lg font-medium mb-2 text-gray-900 dark:text-white">${line.substring(4)}</h3>`
        }
        
        // Lists
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return `<li class="ml-4 mb-1 text-gray-700 dark:text-gray-300">${line.substring(2)}</li>`
        }
        
        // Empty lines
        if (line.trim() === '') {
          return '<br>'
        }
        
        // Regular paragraphs
        return `<p class="mb-3 text-gray-700 dark:text-gray-300 leading-relaxed">${line}</p>`
      })
      .join('')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !note) {
    return notFound()
  }

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 transition-colors duration-200"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to View
            </button>
          </div>

          <NoteEditor
            note={note}
            isLoading={updateNoteMutation.isPending}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/notes"
            className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Notes
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {note.title}
                </h1>
                {note.isPinned && (
                  <PinIconSolid className="w-6 h-6 text-yellow-500" />
                )}
              </div>
              
              {/* Metadata */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  <span>Updated {formatDate(note.updatedAt)}</span>
                </div>
                
                <div className="flex items-center">
                  <DocumentTextIcon className="w-4 h-4 mr-1" />
                  <span>{note.category}</span>
                </div>
                
                <div className="flex items-center">
                  <span>{note.content.length} characters</span>
                </div>
              </div>

              {/* Tags */}
              {note.tags.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag) => (
                      <div
                        key={tag}
                        className="inline-flex items-center px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-md"
                      >
                        <TagIcon className="w-3 h-3 mr-1" />
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={handlePin}
                disabled={pinNoteMutation.isPending}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 ${
                  note.isPinned
                    ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/70'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={note.isPinned ? 'Unpin note' : 'Pin note'}
              >
                {note.isPinned ? (
                  <PinIconSolid className="w-4 h-4 mr-2" />
                ) : (
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                  </svg>
                )}
                {note.isPinned ? 'Unpin' : 'Pin'}
              </button>
              
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit
              </button>
              
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-8">
          <div
            dangerouslySetInnerHTML={{ __html: formatPreview(note.content) }}
            className="prose dark:prose-invert max-w-none"
          />
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Note
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{note.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                  disabled={deleteNoteMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  disabled={deleteNoteMutation.isPending}
                >
                  {deleteNoteMutation.isPending && (
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}