'use client'

import { useUnifiedUser } from '@/hooks/useUnifiedUser'
import OrdersPage from '../components/OrdersPage'

export default function OrdersRoute() {
  const { user } = useUnifiedUser()

  // User ID is guaranteed to exist due to layout authentication
  const userId = user!.id

  return <OrdersPage userId={userId} />
}