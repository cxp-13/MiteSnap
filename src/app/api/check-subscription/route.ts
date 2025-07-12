import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const { userId, has } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - No user found' }, 
        { status: 401 }
      )
    }
    
    // Check if user has unlimited duvets feature
    const hasUnlimitedDuvets = has({ feature: 'unlimit_duvets' })
    const tier = hasUnlimitedDuvets ? 'pro' : 'basic'
    const maxDuvets = tier === 'pro' ? Infinity : 1

    console.log(`[check-subscription] User ${userId}: tier=${tier}, hasUnlimitedDuvets=${hasUnlimitedDuvets}`)

    return NextResponse.json({
      tier,
      maxDuvets,
      hasUnlimitedAccess: hasUnlimitedDuvets,
      userId
    })
  } catch (error) {
    console.error('Error checking subscription:', error)
    // Return basic tier as fallback
    return NextResponse.json({
      tier: 'basic',
      maxDuvets: 1,
      hasUnlimitedAccess: false,
      error: 'Fallback to basic tier'
    })
  }
}