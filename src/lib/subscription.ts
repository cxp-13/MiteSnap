export type SubscriptionTier = 'basic' | 'pro'

export interface SubscriptionLimits {
  maxDuvets: number
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  basic: {
    maxDuvets: Infinity  // 移除限制
  },
  pro: {
    maxDuvets: Infinity
  }
}

export async function getUserSubscriptionTier(): Promise<SubscriptionTier> {
  // 暂时返回 pro，所有用户都没有限制
  return 'pro'
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function checkDuvetLimit(_currentDuvetCount: number): Promise<{ canCreate: boolean; tier: SubscriptionTier; maxAllowed: number }> {
  // 始终允许创建，没有限制
  return {
    canCreate: true,
    tier: 'pro',
    maxAllowed: Infinity
  }
}