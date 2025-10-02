'use client'

/**
 * Tag Selector Component
 * Multi-select input for tags with autocomplete and creation
 */

import React, { useState, useRef, useEffect } from 'react'
import { 
  TagIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { TagSelectorProps } from '../types/note.types'

export function TagSelector({ 
  selectedTags, 
  availableTags, 
  onTagsChange, 
  placeholder = "Add tags...",
  maxTags = 10 
}: TagSelectorProps) {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Filter available tags based on input and exclude already selected
  const filteredTags = availableTags
    .filter(tag => 
      !selectedTags.includes(tag) && 
      tag.toLowerCase().includes(inputValue.toLowerCase())
    )
    .slice(0, 10) // Limit suggestions

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setFocusedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && 
        !selectedTags.includes(trimmedTag) && 
        selectedTags.length < maxTags &&
        trimmedTag.length <= 30) {
      onTagsChange([...selectedTags, trimmedTag])
    }
    setInputValue('')
    setIsOpen(false)
    setFocusedIndex(-1)
  }

  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setIsOpen(value.length > 0)
    setFocusedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (focusedIndex >= 0 && filteredTags[focusedIndex]) {
        addTag(filteredTags[focusedIndex])
      } else if (inputValue.trim()) {
        addTag(inputValue.trim())
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex(prev => 
        prev < filteredTags.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setFocusedIndex(-1)
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1])
    } else if (e.key === 'Tab') {
      setIsOpen(false)
      setFocusedIndex(-1)
    }
  }

  const canAddNewTag = inputValue.trim() && 
    !selectedTags.includes(inputValue.trim()) && 
    !availableTags.includes(inputValue.trim()) &&
    selectedTags.length < maxTags &&
    inputValue.trim().length <= 30

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Tags
      </label>
      
      {/* Tags Container */}
      <div className="relative">
        <div className="min-h-[2.5rem] border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
          <div className="flex flex-wrap gap-1 items-center">
            {/* Selected Tags */}
            {selectedTags.map((tag) => (
              <div
                key={tag}
                className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-sm rounded-md"
              >
                <TagIcon className="w-3 h-3 mr-1" />
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-blue-600 dark:hover:text-blue-300 focus:outline-none"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(inputValue.length > 0)}
              className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder={selectedTags.length === 0 ? placeholder : ''}
              disabled={selectedTags.length >= maxTags}
            />
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (filteredTags.length > 0 || canAddNewTag) && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {/* Existing tags */}
            {filteredTags.map((tag, index) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center transition-colors duration-150 ${
                  index === focusedIndex ? 'bg-blue-50 dark:bg-blue-900/50' : ''
                }`}
              >
                <TagIcon className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-gray-900 dark:text-white">{tag}</span>
              </button>
            ))}
            
            {/* Create new tag option */}
            {canAddNewTag && (
              <button
                type="button"
                onClick={() => addTag(inputValue.trim())}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center transition-colors duration-150 border-t border-gray-200 dark:border-gray-600 ${
                  focusedIndex === filteredTags.length ? 'bg-blue-50 dark:bg-blue-900/50' : ''
                }`}
              >
                <PlusIcon className="w-4 h-4 mr-2 text-green-500" />
                <span className="text-gray-900 dark:text-white">Create "{inputValue.trim()}"</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Help text */}
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {selectedTags.length}/{maxTags} tags • Press Enter to add, Backspace to remove
      </p>
    </div>
  )
}