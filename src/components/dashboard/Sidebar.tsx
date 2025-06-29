import Image from 'next/image'

interface SidebarProps {
  activeTab: 'duvets' | 'orders' | 'addresses'
  onTabChange: (tab: 'duvets' | 'orders' | 'addresses') => void
}

export default function Sidebar({ 
  activeTab, 
  onTabChange
}: SidebarProps) {
  return (
    <div className="w-64 bg-black text-white flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <Image 
            src="/logo.png" 
            alt="MiteSnap Logo" 
            width={32} 
            height={32}
          />
          <h1 className="text-xl font-semibold">MiteSnap</h1>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          <button
            onClick={() => onTabChange('duvets')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'duvets'
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:bg-gray-900 hover:text-white'
            }`}
          >
            My Duvets
          </button>
          <button
            onClick={() => onTabChange('addresses')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'addresses'
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:bg-gray-900 hover:text-white'
            }`}
          >
            My Addresses
          </button>
          <button
            onClick={() => onTabChange('orders')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'orders'
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:bg-gray-900 hover:text-white'
            }`}
          >
            View Nearby Orders
          </button>
        </div>
      </nav>
    </div>
  )
}