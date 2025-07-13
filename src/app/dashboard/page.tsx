'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()

  // Redirect to duvets page
  useEffect(() => {
    router.replace('/dashboard/duvets')
  }, [router])

  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
    </div>
  )
}