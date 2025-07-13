'use client'

import { useUnifiedUser } from '@/hooks/useUnifiedUser'
import PaymentMethodsPage from '@/components/dashboard/PaymentMethodsPage'

export default function PaymentMethodsRoute() {
  const { user } = useUnifiedUser()

  // User ID is guaranteed to exist due to layout authentication
  const userId = user!.id

  return <PaymentMethodsPage userId={userId} />
}