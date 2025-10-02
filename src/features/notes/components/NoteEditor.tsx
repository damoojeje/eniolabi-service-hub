'use client'

/**
 * Note Editor Component
 * Rich text editor for creating and editing notes with live preview
 */

import React, { useState, useEffect, useRef } from 'react'
import { 
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  TagIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { NoteEditorProps, CreateNoteInput, UpdateNoteInput } from '../types/note.types'
import { TagSelector } from './TagSelector'

export function NoteEditor({ 
  note, 
  isLoading, 
  onSave, 
  onCancel,
}: NoteEditorProps) {
  const [formData, setFormData] = useState({
    title: note?.title || '',
    content: note?.content || '',
    category: note?.category || 'general',
    tags: note?.tags || [],
    isPinned: note?.isPinned || false
  })
  const [previewMode, setPreviewMode] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [availableCategories, setAvailableCategories] = useState<string[]>([
    'general', 'work', 'personal', 'ideas', 'todo', 'reference', 'meeting', 'project'
  ])
  
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  const isEditMode = !!note

  // Initialize form data when note changes
  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        content: note.content,
        category: note.category,
        tags: note.tags,
        isPinned: note.isPinned
      })
    }
  }, [note])

  // Auto-resize content textarea
  useEffect(() => {
    const textarea = contentTextareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.max(textarea.scrollHeight, 200)}px`
    }
  }, [formData.content])

  // Focus title input on mount for new notes
  useEffect(() => {
    if (!isEditMode && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [isEditMode])

  // Mock available tags (in real app, fetch from API)
  useEffect(() => {
    setAvailableTags([
      'javascript', 'react', 'nextjs', 'typescript', 'design', 'ui', 'ux',
      'backend', 'database', 'api', 'deployment', 'debugging', 'performance',
      'security', 'testing', 'documentation', 'planning', 'meeting', 'review'
    ])
  }, [])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required'
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required'
    } else if (formData.category.length > 50) {
      newErrors.category = 'Category must be less than 50 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      if (isEditMode && note) {
        const updateData: UpdateNoteInput = {
          id: note.id,
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: formData.category.trim(),
          tags: formData.tags,
          isPinned: formData.isPinned
        }
        await onSave(updateData)
      } else {
        const createData: CreateNoteInput = {
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: formData.category.trim(),
          tags: formData.tags,
          isPinned: formData.isPinned
        }
        await onSave(createData)
      }
    } catch (error) {
      console.error('Note save error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Save on Ctrl/Cmd + S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      handleSubmit()
    }
    // Preview on Ctrl/Cmd + P
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault()
      setPreviewMode(!previewMode)
    }
  }

  // Format content for preview (basic markdown-like formatting)
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

  return (
    <div className="note-editor-container bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300 [&.dark]:bg-gray-800 [&.dark]:border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 transition-colors duration-300 [&.dark]:bg-gray-700/50 [&.dark]:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300 [&.dark]:text-white">
              {isEditMode ? 'Edit Note' : 'Create New Note'}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300 [&.dark]:text-gray-400">
              {isEditMode 
                ? 'Make changes to your note and save when ready.'
                : 'Write your thoughts, ideas, or information. Use Ctrl+S to save, Ctrl+P to preview.'
              }
            </p>
          </div>
          
          {/* Preview Toggle */}
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              previewMode
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
            }`}
            title="Toggle preview mode"
          >
            {previewMode ? (
              <>
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit
              </>
            ) : (
              <>
                <EyeIcon className="w-4 h-4 mr-2" />
                Preview
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white dark:bg-gray-800 transition-colors duration-300 [&.dark]:bg-gray-800" onKeyDown={handleKeyDown}>
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </label>
          <input
            ref={titleInputRef}
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`block w-full px-4 py-3 text-lg border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Enter note title..."
            disabled={isSubmitting}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
          )}
        </div>

        {/* Category and Pin */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <div className="relative">
              <DocumentTextIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                list="categories"
                className={`block w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter category..."
                disabled={isSubmitting}
              />
              <datalist id="categories">
                {availableCategories.map(category => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
            )}
          </div>

          <div className="flex items-center justify-center">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => handleInputChange('isPinned', e.target.checked)}
                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 dark:border-gray-600 rounded"
                disabled={isSubmitting}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <TagIcon className="w-4 h-4 mr-1 text-yellow-500" />
                Pin this note
              </span>
            </label>
          </div>
        </div>

        {/* Tags */}
        <TagSelector
          selectedTags={formData.tags}
          availableTags={availableTags}
          onTagsChange={(tags) => handleInputChange('tags', tags)}
          maxTags={10}
        />

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Content *
          </label>
          
          {previewMode ? (
            <div className="min-h-[300px] p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div
                dangerouslySetInnerHTML={{ __html: formatPreview(formData.content) }}
                className="prose dark:prose-invert max-w-none"
              />
            </div>
          ) : (
            <textarea
              ref={contentTextareaRef}
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              className={`block w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.content ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Write your note content here... 

You can use:
# Heading 1
## Heading 2  
### Heading 3
- List items
* Also list items

Ctrl+S to save, Ctrl+P to preview"
              style={{ minHeight: '300px' }}
              disabled={isSubmitting}
            />
          )}
          
          {errors.content && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content}</p>
          )}
          
          {!previewMode && (
            <div className="mt-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>
                {formData.content.length} characters
              </span>
              <span>
                Ctrl+S to save • Ctrl+P for preview
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            disabled={isSubmitting}
          >
            <XMarkIcon className="w-4 h-4 mr-2" />
            Cancel
          </button>
          
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <CheckIcon className="w-4 h-4 mr-2" />
            <span>{isEditMode ? 'Update Note' : 'Create Note'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}