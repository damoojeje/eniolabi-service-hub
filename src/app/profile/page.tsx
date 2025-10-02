'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { trpc } from '@/lib/trpc'

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [uploading, setUploading] = useState(false)
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '')
      setEmail(session.user.email || '')

      // Always update avatar from session on initial load, but preserve local state during uploads
      if (session.user.image) {
        setCurrentAvatarUrl(session.user.image)
      }
    }
  }, [session])

  const updateProfileMutation = trpc.users.updateProfile.useMutation({
    onSuccess: async (data) => {
      // Update local state immediately
      if (data.image) {
        setCurrentAvatarUrl(data.image)
      }

      // Update session to persist the image across pages
      await update()
    },
    onError: (error) => {
      alert(`Failed to update profile: ${error.message}`)
    },
  })

  const handleSave = () => {
    updateProfileMutation.mutate({
      name: name.trim() || null,
    })
  }

  // Function to resize image
  const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions (max 800x800, maintain aspect ratio)
        const maxSize = 800
        let { width, height } = img

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => {
          resolve(new File([blob!], file.name, { type: 'image/jpeg' }))
        }, 'image/jpeg', 0.8) // 80% quality
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    setUploading(true)

    try {
      // Resize image to ensure it's under 1MB
      const resizedFile = await resizeImage(file)

      const formData = new FormData()
      formData.append('file', resizedFile)


      // Simplified fetch without AbortController to avoid timeout issues
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      // Get response text first to see what we're actually receiving
      const responseText = await response.text()

      if (!response.ok) {
        let errorData
        try {
          errorData = JSON.parse(responseText)
        } catch (parseError) {
          throw new Error(`Server returned non-JSON error: ${response.status} ${response.statusText}`)
        }
        throw new Error(errorData.error || 'Failed to upload avatar')
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        throw new Error('Server returned invalid JSON response')
      }

      // Immediately update UI state for instant feedback with cache busting
      const urlWithTimestamp = `${data.url}?t=${Date.now()}`
      setCurrentAvatarUrl(urlWithTimestamp)

      // Update backend profile data
      updateProfileMutation.mutate({
        image: data.url,
      })
    } catch (error) {
      if (error instanceof Error) {
        alert(`Failed to upload avatar: ${error.message}`)
      } else {
        alert('Failed to upload avatar: Unknown error occurred')
      }
    } finally {
      setUploading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) return null

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'POWER_USER':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'GUEST':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return '👑'
      case 'POWER_USER':
        return '⚡'
      case 'GUEST':
        return '👤'
      default:
        return '👤'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">
            User Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-black rounded-xl shadow-lg p-6">
              <div className="text-center">
                {/* Avatar */}
                <div className="relative mx-auto w-32 h-32 mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                    {currentAvatarUrl ? (
                      <img
                        src={currentAvatarUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        key={currentAvatarUrl} // Force re-render when URL changes
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                        👤
                      </div>
                    )}
                  </div>
                  
                  {/* Upload Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                      </svg>
                    )}
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {session.user.name || session.user.username}
                </h2>
                
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(session.user.role)}`}>
                  <span className="mr-2">{getRoleIcon(session.user.role)}</span>
                  {session.user.role}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Username</div>
                  <div className="text-gray-900 dark:text-white font-medium">{session.user.username}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Email</div>
                  <div className="text-gray-900 dark:text-white font-medium">{session.user.email}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-black rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Profile Settings
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your display name"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Email cannot be changed. Contact an administrator if needed.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>

                {updateProfileMutation.isSuccess && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 px-4 py-3 rounded-lg">
                    Profile updated successfully!
                  </div>
                )}

                {updateProfileMutation.isError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 px-4 py-3 rounded-lg">
                    Failed to update profile. Please try again.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}