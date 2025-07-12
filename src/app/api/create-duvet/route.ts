import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createDuvet, getUserDuvets } from '@/lib/database'
import { checkDuvetLimitServer } from '@/lib/subscription-server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, material, miteScore, cleaningHistory, thickness, imageUrl, addressId } = body

    // Check subscription limits before creating
    const currentDuvets = await getUserDuvets(userId)
    const limitCheck = await checkDuvetLimitServer(currentDuvets.length)
    
    if (!limitCheck.canCreate) {
      return NextResponse.json(
        { 
          error: limitCheck.errorMessage || 'Subscription limit reached.',
          tier: limitCheck.tier,
          maxAllowed: limitCheck.maxAllowed,
          currentCount: currentDuvets.length
        }, 
        { status: 403 }
      )
    }

    // Create the duvet
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