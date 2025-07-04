'use client'

import { usePathname } from 'next/navigation'
import Footer from '@/components/Footer'

export default function ConditionalFooter() {
  const pathname = usePathname()
  
  // Only show footer on the landing page
  if (pathname === '/') {
    return <Footer />
  }
  
  return null
}