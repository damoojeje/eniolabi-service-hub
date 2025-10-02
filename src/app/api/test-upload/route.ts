import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🧪 TEST UPLOAD - Request received')
  console.log('Headers:', Object.fromEntries(request.headers.entries()))

  try {
    const formData = await request.formData()
    console.log('🧪 TEST UPLOAD - FormData keys:', Array.from(formData.keys()))

    return NextResponse.json({
      success: true,
      message: 'Test upload successful',
      formDataKeys: Array.from(formData.keys())
    })
  } catch (error) {
    console.error('🧪 TEST UPLOAD - Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  console.log('🧪 TEST UPLOAD - GET request received')
  return NextResponse.json({
    success: true,
    message: 'Test API is working',
    timestamp: new Date().toISOString()
  })
}