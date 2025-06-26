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
        alt="Acarid Bloom Logo" 
        width={80} 
        height={80}
        className="mb-4"
      />
      
      {/* Website name - Acarid Bloom only */}
      <span className="brand-name-simple">Acarid Bloom</span>
    </div>
  )
}