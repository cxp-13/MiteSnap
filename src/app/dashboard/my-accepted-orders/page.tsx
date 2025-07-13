'use client'

import { useUnifiedUser } from '@/hooks/useUnifiedUser'
import MyAcceptedOrdersPage from '../components/MyAcceptedOrdersPage'

export default function MyAcceptedOrdersRoute() {
  const { user } = useUnifiedUser()

  // User ID is guaranteed to exist due to layout authentication
  const userId = user!.id

  return <MyAcceptedOrdersPage userId={userId} />
}