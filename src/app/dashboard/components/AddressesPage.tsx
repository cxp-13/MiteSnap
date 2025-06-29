'use client'

import { useAddresses } from '@/hooks/dashboard/useAddresses'
import AddressManager from '@/components/dashboard/AddressManager'

interface AddressesPageProps {
  userId: string
}

export default function AddressesPage({ userId }: AddressesPageProps) {
  const {
    addresses,
    isLoadingAddresses,
    handleCreateAddress,
    handleUpdateAddress,
    handleDeleteAddress,
    handleSetDefaultAddress
  } = useAddresses(userId)

  return (
    <AddressManager
      addresses={addresses}
      isLoading={isLoadingAddresses}
      onCreateAddress={handleCreateAddress}
      onUpdateAddress={handleUpdateAddress}
      onDeleteAddress={handleDeleteAddress}
      onSetDefaultAddress={handleSetDefaultAddress}
    />
  )
}