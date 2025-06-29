import { useState, useEffect, useCallback } from 'react'
import { getUserAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress, type Address } from '@/lib/database'
import type { AddressFormData } from '@/components/dashboard/shared/types'

export function useAddresses(userId: string | undefined) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)

  // Load addresses
  const loadAddresses = useCallback(async () => {
    if (!userId) return
    
    setIsLoadingAddresses(true)
    try {
      const userAddresses = await getUserAddresses(userId)
      setAddresses(userAddresses)
    } catch (error) {
      console.error('Error loading addresses:', error)
    } finally {
      setIsLoadingAddresses(false)
    }
  }, [userId])

  // Load addresses on mount and when userId changes
  useEffect(() => {
    loadAddresses()
  }, [loadAddresses])

  // Create new address
  const handleCreateAddress = useCallback(async (addressData: AddressFormData) => {
    if (!userId) return

    try {
      const success = await createAddress(userId, addressData)
      if (success) {
        await loadAddresses()
      } else {
        throw new Error('Failed to create address. Please try again.')
      }
    } catch (error) {
      console.error('Error creating address:', error)
      throw error
    }
  }, [userId, loadAddresses])

  // Update existing address
  const handleUpdateAddress = useCallback(async (id: string, addressData: AddressFormData) => {
    if (!userId) return

    try {
      const success = await updateAddress(id, addressData)
      if (success) {
        await loadAddresses()
      } else {
        throw new Error('Failed to update address. Please try again.')
      }
    } catch (error) {
      console.error('Error updating address:', error)
      throw error
    }
  }, [userId, loadAddresses])

  // Delete address
  const handleDeleteAddress = useCallback(async (id: string) => {
    if (!userId) return

    try {
      const success = await deleteAddress(id)
      if (success) {
        await loadAddresses()
      } else {
        throw new Error('Failed to delete address. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting address:', error)
      throw error
    }
  }, [userId, loadAddresses])

  // Set default address
  const handleSetDefaultAddress = useCallback(async (id: string) => {
    if (!userId) return

    try {
      const success = await setDefaultAddress(id, userId)
      if (success) {
        await loadAddresses()
      } else {
        throw new Error('Failed to set default address. Please try again.')
      }
    } catch (error) {
      console.error('Error setting default address:', error)
      throw error
    }
  }, [userId, loadAddresses])

  // Get default address
  const getDefaultAddress = useCallback(() => {
    return addresses.find(address => address.is_default) || null
  }, [addresses])

  return {
    // State
    addresses,
    isLoadingAddresses,
    
    // Actions
    loadAddresses,
    handleCreateAddress,
    handleUpdateAddress,
    handleDeleteAddress,
    handleSetDefaultAddress,
    getDefaultAddress
  }
}