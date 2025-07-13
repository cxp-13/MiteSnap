'use client'

import { useUnifiedUser } from '@/hooks/useUnifiedUser'
import AddressesPage from '../components/AddressesPage'

export default function AddressesRoute() {
  const { user } = useUnifiedUser()

  // User ID is guaranteed to exist due to layout authentication
  const userId = user!.id

  return <AddressesPage userId={userId} />
}