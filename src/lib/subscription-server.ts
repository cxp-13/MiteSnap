import { auth } from '@clerk/nextjs/server'

export type SubscriptionTier = 'basic' | 'pro'

export async function checkDuvetLimitServer(currentDuvetCount: number): Promise<{ canCreate: boolean; tier: SubscriptionTier; maxAllowed: number; errorMessage?: string }> {
  try {
    const { has } = await auth()
    
    const hasUnlimitedDuvets = has({ feature: 'unlimit_duvets' })
    const tier = hasUnlimitedDuvets ? 'pro' : 'basic'
    const maxDuvets = tier === 'pro' ? Infinity : 1
    
    const canCreate = currentDuvetCount < maxDuvets
    const errorMessage = !canCreate 
      ? `Subscription limit reached. ${tier === 'basic' ? 'Upgrade to Pro for unlimited duvets.' : 'Maximum duvets reached.'}`
      : undefined
    
    return {
      canCreate,
      tier,
      maxAllowed: maxDuvets,
      errorMessage
    }
  } catch (error) {
    console.error('Error checking subscription tier on server:', error)
    return {
      canCreate: false,
      tier: 'basic',
      maxAllowed: 1,
      errorMessage: 'Failed to verify subscription. Please try again.'
    }
  }
}