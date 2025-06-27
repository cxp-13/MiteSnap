'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Logo() {
  const router = useRouter()

  const handleClick = () => {
    router.push('/')
  }

  return (
    <div className="logo-container-simple" onClick={handleClick}>
      {/* Logo image */}
      <Image 
        src="/logo.png" 
        alt="MiteSnap Logo" 
        width={80} 
        height={80}
        className="mb-4"
      />
      
      {/* Website name - MiteSnap only */}
      <span className="brand-name-simple">MiteSnap</span>
    </div>
  )
}