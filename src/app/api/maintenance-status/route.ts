import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get the latest system settings
    const settings = await db.systemSettings.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: {
        maintenanceMode: true,
        debugMode: true
      }
    })

    return NextResponse.json({
      maintenanceMode: settings?.maintenanceMode || false,
      debugMode: settings?.debugMode || false
    })
  } catch (error) {
    console.error('Error fetching maintenance status:', error)
    // Default to maintenance mode disabled if there's an error
    return NextResponse.json({
      maintenanceMode: false,
      debugMode: false
    })
  }
}