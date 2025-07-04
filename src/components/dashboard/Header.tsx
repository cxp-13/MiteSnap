import Image from 'next/image'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-start">
        <div className="flex items-center space-x-3">
          <Image 
            src="/logo.png" 
            alt="MiteSnap Logo" 
            width={32} 
            height={32}
          />
          <h1 className="text-xl font-semibold text-gray-900">MiteSnap</h1>
        </div>
      </div>
    </header>
  )
}