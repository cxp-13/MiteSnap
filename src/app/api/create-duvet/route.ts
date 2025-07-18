import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createDuvet } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, material, miteScore, cleaningHistory, thickness, imageUrl, addressId } = body

    // Create the duvet without subscription limits
    const duvet = await createDuvet(
      userId,
      name,
      material,
      miteScore,
      cleaningHistory,
      thickness,
      imageUrl,
      addressId
    )

    if (!duvet) {
      return NextResponse.json({ error: 'Failed to create duvet' }, { status: 500 })
    }

    return NextResponse.json({ duvet, success: true })
  } catch (error) {
    console.error('Error in create-duvet API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}