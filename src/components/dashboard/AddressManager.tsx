import { useState } from 'react'
import { Address, AddressFormData } from './shared/types'
import AddressModal from './modals/AddressModal'

interface AddressManagerProps {
  addresses: Address[]
  isLoading: boolean
  onCreateAddress: (addressData: AddressFormData) => Promise<void>
  onUpdateAddress: (id: string, addressData: AddressFormData) => Promise<void>
  onDeleteAddress: (id: string) => Promise<void>
  onSetDefaultAddress: (id: string) => Promise<void>
}

export default function AddressManager({
  addresses,
  isLoading,
  onCreateAddress,
  onUpdateAddress,
  onDeleteAddress,
  onSetDefaultAddress
}: AddressManagerProps) {
  const [showModal, setShowModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  const handleNewAddress = () => {
    setEditingAddress(null)
    setShowModal(true)
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingAddress(null)
  }

  const handleSaveAddress = async (addressData: AddressFormData) => {
    if (editingAddress) {
      await onUpdateAddress(editingAddress.id, addressData)
    } else {
      await onCreateAddress(addressData)
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      await onDeleteAddress(id)
    }
  }

  const getPrimaryAddress = (address: Address): string => {
    // Primary address line: Focus on house number + street for navigation
    const parts = []
    if (address.house_number) parts.push(address.house_number)
    if (address.road) parts.push(address.road)
    
    if (parts.length > 0) {
      return parts.join(' ')
    }
    
    // Fallback: if no house+road, show neighborhood or district
    if (address.neighbourhood) return address.neighbourhood
    if (address.district) return address.district
    
    // Legacy fallback
    if (address.apartment) return `Apt ${address.apartment}`
    if (address.unit) return `Unit ${address.unit}`
    
    return 'Address not available'
  }

  const getSecondaryAddress = (address: Address): string | null => {
    // Secondary line: Show neighborhood or district for local context
    // Only show if we have house+road in primary
    if (address.house_number || address.road) {
      if (address.neighbourhood) return address.neighbourhood
      if (address.district) return address.district
    }
    return null
  }

  const getLocationLabel = (address: Address): string => {
    // Location label: Only show city for general location reference
    if (address.city) {
      return address.city
    }
    return 'Location'
  }

  if (isLoading) {
    return (
      <div>
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
            Your Addresses
          </h1>
          <p className="text-lg text-gray-600">
            Manage your locations for better service
          </p>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <span className="ml-3 text-gray-600">Loading your addresses...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
          Your Addresses
        </h1>
        <p className="text-lg text-gray-600">
          Manage your locations for better service
        </p>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-12 text-center">
          <div className="space-y-4">
            <div className="text-6xl text-gray-400">📍</div>
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No addresses yet</h3>
              <p className="text-gray-500">Add your first address to get started with location-based services</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="bg-white border border-gray-100 rounded-2xl p-7 hover:shadow-xl hover:border-gray-200 transition-all duration-200 relative overflow-hidden"
            >
              {/* Default Badge */}
              {address.is_default && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-bl-2xl rounded-tr-2xl">
                    <span className="text-xs font-medium tracking-wide">DEFAULT</span>
                  </div>
                </div>
              )}

              {/* Address Content */}
              <div className="space-y-4 mb-8">
                {/* Address Information - Clean hierarchy */}
                <div className="space-y-2">
                  {/* Primary Address Line */}
                  <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                    {getPrimaryAddress(address)}
                  </h3>
                  
                  {/* Secondary Address Line - Only if exists */}
                  {getSecondaryAddress(address) && (
                    <p className="text-sm font-medium text-gray-600">
                      {getSecondaryAddress(address)}
                    </p>
                  )}
                  
                  {/* Location Label */}
                  <p className="text-sm text-gray-500">
                    {getLocationLabel(address)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleEditAddress(address)}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 active:bg-blue-800 transform hover:scale-[1.02] transition-all duration-150 shadow-sm hover:shadow-md"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit</span>
                  </span>
                </button>
                
                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className="px-4 py-3 bg-white border-2 border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 hover:border-red-300 active:bg-red-100 transform hover:scale-[1.02] transition-all duration-150 shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Set as Default Button - Only for non-default addresses */}
              {!address.is_default && (
                <button
                  onClick={() => onSetDefaultAddress(address.id)}
                  className="w-full mt-3 px-4 py-2.5 bg-gray-50 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-all duration-150 border border-gray-200 hover:border-gray-300"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Set as Default</span>
                  </span>
                </button>
              )}
            </div>
          ))}
          
          {/* Add New Address Card */}
          <div 
            className="bg-white rounded-2xl cursor-pointer group h-full flex flex-col items-center justify-center p-8 transition-all duration-300"
            style={{ 
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.02)' 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12), 0 6px 20px rgba(0, 0, 0, 0.06), 0 3px 12px rgba(0, 0, 0, 0.04)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.02)'
            }}
            onClick={handleNewAddress}
          >
            {/* Plus Icon */}
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            
            {/* Text */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Add New Address</h3>
              <p className="text-gray-600 text-sm">Click to add a new address</p>
            </div>
          </div>
        </div>
      )}

      {/* Address Modal */}
      <AddressModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveAddress}
        editingAddress={editingAddress}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
      />
    </div>
  )
}