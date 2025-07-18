import { useState } from 'react'
import { Address, AddressFormData } from './shared/types'
import AddressModal from './modals/AddressModal'
import { checkAddressDuvetAssociations } from '@/lib/database'

interface AddressManagerProps {
  addresses: Address[]
  isLoading: boolean
  onCreateAddress: (addressData: AddressFormData) => Promise<void>
  onUpdateAddress: (id: string, addressData: AddressFormData) => Promise<void>
  onDeleteAddress: (id: string) => Promise<void>
  onSetDefaultAddress: (id: string, preventReload?: boolean) => Promise<void>
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null)
  const [associatedDuvets, setAssociatedDuvets] = useState<{ id: string; name: string }[]>([])
  const [hasAssociations, setHasAssociations] = useState(false)

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
    try {
      const associations = await checkAddressDuvetAssociations(id)
      setAssociatedDuvets(associations.associatedDuvets)
      setHasAssociations(associations.hasAssociations)
      setDeletingAddressId(id)
      setShowDeleteConfirm(true)
    } catch (error) {
      console.error('Error checking address associations:', error)
      // Fallback: show delete confirmation anyway
      setAssociatedDuvets([])
      setHasAssociations(false)
      setDeletingAddressId(id)
      setShowDeleteConfirm(true)
    }
  }

  const confirmDeleteAddress = async () => {
    if (deletingAddressId && !hasAssociations) {
      await onDeleteAddress(deletingAddressId)
      setShowDeleteConfirm(false)
      setDeletingAddressId(null)
      setAssociatedDuvets([])
      setHasAssociations(false)
    }
  }

  const cancelDeleteAddress = () => {
    setShowDeleteConfirm(false)
    setDeletingAddressId(null)
    setAssociatedDuvets([])
    setHasAssociations(false)
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
        <div className="mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-3">
            Your Addresses
          </h1>
          <p className="text-base md:text-lg text-gray-600">
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
      <div className="mb-8 md:mb-12">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-3">
          Your Addresses
        </h1>
        <p className="text-base md:text-lg text-gray-600">
          Manage your locations for better service
        </p>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-12 text-center">
          <div className="space-y-6">
            <div className="text-6xl text-gray-400">📍</div>
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No addresses yet</h3>
              <p className="text-gray-500 mb-4">Add your first address to enable location-based services</p>
            </div>
            <button
              onClick={handleNewAddress}
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors space-x-2"
            >
              <span>Add Address</span>
            </button>
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
                className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  {/* Address Info */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 sm:mb-0">
                        {addressData.short}
                      </h3>
                      {address.is_default && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 break-words">
                      {addressData.primary}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 md:ml-6">
                    {!address.is_default && (
                      <button
                        onClick={() => onSetDefaultAddress(address.id, showModal)}
                        className="flex items-center justify-center space-x-1.5 px-3 md:px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-xs md:text-sm font-medium shadow-sm transition-colors w-full sm:w-auto"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="hidden sm:inline">Set Default</span>
                        <span className="sm:hidden">Default</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleEditAddress(address)}
                      className="flex items-center justify-center space-x-1.5 px-3 md:px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-xs md:text-sm font-medium shadow-sm transition-colors w-full sm:w-auto"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="flex items-center justify-center space-x-1.5 px-3 md:px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs md:text-sm font-medium shadow-sm transition-colors w-full sm:w-auto"
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {hasAssociations ? 'Cannot Delete Address' : 'Delete Address'}
              </h3>
              {hasAssociations ? (
                <div className="text-gray-600 mb-6">
                  <p className="mb-3">This address is currently being used by the following duvets:</p>
                  <ul className="bg-gray-50 rounded-lg p-3 mb-3 space-y-1">
                    {associatedDuvets.map((duvet) => (
                      <li key={duvet.id} className="text-sm font-medium text-gray-800">
                        • {duvet.name}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm">Please remove this address from these duvets before deleting it.</p>
                </div>
              ) : (
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this address? This action cannot be undone.
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={cancelDeleteAddress}
                className="flex-1 px-4 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                {hasAssociations ? 'Close' : 'Cancel'}
              </button>
              {!hasAssociations && (
                <button
                  onClick={confirmDeleteAddress}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/30 transition-all"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}