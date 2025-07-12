export type SubscriptionTier = 'basic' | 'pro'

export interface SubscriptionLimits {
  maxDuvets: number
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  basic: {
    maxDuvets: 1
  },
  pro: {
    maxDuvets: Infinity
  }
}

export async function getUserSubscriptionTier(): Promise<SubscriptionTier> {
  try {
    const response = await fetch('/api/check-subscription')
    if (!response.ok) {
      throw new Error('Failed to fetch subscription info')
    }
    const data = await response.json()
    return data.tier
  } catch (error) {
    console.error('Error checking subscription tier:', error)
    return 'basic'
  }
}

export async function checkDuvetLimit(currentDuvetCount: number): Promise<{ canCreate: boolean; tier: SubscriptionTier; maxAllowed: number }> {
  try {
    const response = await fetch('/api/check-subscription')
    if (!response.ok) {
      throw new Error('Failed to fetch subscription info')
    }
    const data = await response.json()
    
    return {
      canCreate: currentDuvetCount < data.maxDuvets,
      tier: data.tier,
      maxAllowed: data.maxDuvets
    }
  } catch (error) {
    console.error('Error checking duvet limit:', error)
    // Return safe fallback
    return {
      canCreate: false,
      tier: 'basic',
      maxAllowed: 1
    }
  }
}