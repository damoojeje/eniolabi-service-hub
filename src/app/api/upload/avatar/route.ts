import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  console.log('🔥 UPLOAD ROUTE - Request received!')

  try {
    // Simplified session check
    const session = await getServerSession(authOptions)

    console.log('🔥 UPLOAD ROUTE - Session:', {
      hasSession: !!session,
      userId: session?.user?.id,
      username: session?.user?.username
    })

    if (!session || !session.user) {
      console.log('🔥 UPLOAD ROUTE - No session, returning 401')
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to upload avatar' },
        { status: 401 }
      )
    }

    console.log('🔥 UPLOAD ROUTE - Processing form data...')
    const formData = await request.formData()
    const file = formData.get('file') as File

    console.log('🔥 UPLOAD ROUTE - File:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    })

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars')

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `${session.user.id}-${timestamp}.${extension}`
    const filepath = join(uploadsDir, filename)

    // Save file
    await writeFile(filepath, buffer)
    console.log('🔥 UPLOAD ROUTE - File saved:', filepath)

    // Return the URL
    const baseUrl = process.env.NEXTAUTH_URL || 'https://eniolabi.com'
    const url = `${baseUrl}/uploads/avatars/${filename}`

    console.log('🔥 UPLOAD ROUTE - Success! URL:', url)

    return NextResponse.json({
      url,
      message: 'Avatar uploaded successfully'
    })

  } catch (error) {
    console.error('🔥 UPLOAD ROUTE - Error:', error)
    return NextResponse.json(
      { error: `Failed to upload avatar: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}