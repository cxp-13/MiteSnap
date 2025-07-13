'use client'

import { useUnifiedUser } from '@/hooks/useUnifiedUser'
import { MyOrdersPage } from '@/components/dashboard/MyOrdersPage'

export default function MyOrdersRoute() {
  const { user } = useUnifiedUser()

  // User ID is guaranteed to exist due to layout authentication
  const userId = user!.id

  return <MyOrdersPage userId={userId} />
}