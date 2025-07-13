'use client'

import { useUnifiedUser } from '@/hooks/useUnifiedUser'
import DuvetsPage from '../components/DuvetsPage'

export default function DuvetsRoute() {
  const { user } = useUnifiedUser()

  // User ID is guaranteed to exist due to layout authentication
  const userId = user!.id

  return <DuvetsPage userId={userId} />
}