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

  const getInternationalAddress = (address: Address) => {
    // Format like international address: Street, District, City, State
    const parts = []
    if (address.house_number && address.road) {
      parts.push(`${address.house_number} ${address.road}`)
    } else if (address.road) {
      parts.push(address.road)
    }
    if (address.neighbourhood) parts.push(address.neighbourhood)
    if (address.district) parts.push(address.district)
    if (address.city) parts.push(address.city)
    if (address.state) parts.push(address.state)
    
    return {
      primary: parts.length > 0 ? parts.join(', ') : 'Address not available',
      short: parts.slice(0, 2).join(', ') || 'Address not available'
    }
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
        <div className="space-y-4">
          {/* Address Rows */}
          {addresses.map((address) => {
            const addressData = getInternationalAddress(address)
            return (
              <div
                key={address.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  {/* Address Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {addressData.short}
                      </h3>
                      {address.is_default && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {addressData.primary}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 ml-6">
                    {!address.is_default && (
                      <button
                        onClick={() => onSetDefaultAddress(address.id)}
                        className="flex items-center space-x-1.5 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium shadow-sm transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Set Default</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleEditAddress(address)}
                      className="flex items-center space-x-1.5 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium shadow-sm transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="flex items-center space-x-1.5 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium shadow-sm transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Add New Address Row */}
          <div 
            className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer group hover:border-gray-400 hover:bg-gray-100 transition-all duration-200 flex items-center justify-center"
            onClick={handleNewAddress}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 text-gray-400 group-hover:text-gray-500 transition-colors">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Add New Address</h3>
                <p className="text-sm text-gray-600">Click to add a new address</p>
              </div>
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