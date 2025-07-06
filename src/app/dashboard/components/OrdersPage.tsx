'use client'

import { useState, useEffect } from 'react'
import { useOrders } from '@/hooks/dashboard/useOrders'
import { useAddresses } from '@/hooks/dashboard/useAddresses'
import { formatLocalAddress, formatRelativeTime } from '@/lib/address-utils'
import { getAddressesByIds, type Address, type OrderWithDuvet } from '@/lib/database'
import { uploadDuvetImage } from '@/lib/storage'
import { getCleanHistoryRecord, type CleanHistoryRecord } from '@/lib/clean-history'
import { formatCost } from '@/lib/pricing'
import ExecuteOrderModal from '@/components/dashboard/modals/ExecuteOrderModal'
import AcceptOrderModal from '@/components/dashboard/modals/AcceptOrderModal'

interface OrdersPageProps {
  userId: string
}

export default function OrdersPage({ userId }: OrdersPageProps) {
  const { acceptedOrders, nearbyOrders, isLoadingOrders, handleAcceptOrder, handleUpdateOrderStatus } = useOrders(userId)
  const { addresses } = useAddresses(userId)
  const [nearbyOrderAddresses, setNearbyOrderAddresses] = useState<Record<string, Address>>({})
  const [cleanHistoryData, setCleanHistoryData] = useState<Record<string, CleanHistoryRecord>>({})
  
  // Execute order modal state
  const [showExecuteOrderModal, setShowExecuteOrderModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDuvet | null>(null)
  const [executeOrderStep, setExecuteOrderStep] = useState<1 | 2 | 3>(1)
  const [dryPhoto, setDryPhoto] = useState<File | null>(null)
  const [dryPhotoPreview, setDryPhotoPreview] = useState<string | null>(null)
  const [isUploadingDryPhoto, setIsUploadingDryPhoto] = useState(false)

  // Accept order modal state
  const [showAcceptOrderModal, setShowAcceptOrderModal] = useState(false)
  const [selectedAcceptOrder, setSelectedAcceptOrder] = useState<OrderWithDuvet | null>(null)

  // Load addresses for nearby orders
  useEffect(() => {
    const loadNearbyOrderAddresses = async () => {
      if (nearbyOrders.length === 0) return
      
      const addressIds = [...new Set(nearbyOrders.map(order => order.address_id).filter((id): id is string => Boolean(id)))]
      if (addressIds.length === 0) return
      
      try {
        const addressMap = await getAddressesByIds(addressIds)
        setNearbyOrderAddresses(addressMap)
      } catch (error) {
        console.error('Error loading nearby order addresses:', error)
      }
    }

    loadNearbyOrderAddresses()
  }, [nearbyOrders])

  // Load clean history data for all orders (accepted + nearby)
  useEffect(() => {
    const loadCleanHistoryData = async () => {
      console.log('🔍 [OrdersPage] loadCleanHistoryData called')
      console.log('  Accepted orders count:', acceptedOrders.length)
      console.log('  Nearby orders count:', nearbyOrders.length)
      
      // Combine all orders that might have clean history
      const allOrders = [...acceptedOrders, ...nearbyOrders]
      console.log('  Total orders to check:', allOrders.length)
      
      if (allOrders.length === 0) {
        console.log('  No orders, skipping clean history load')
        return
      }
      
      const ordersWithCleanHistory = allOrders.filter(order => order.clean_history_id)
      console.log('  Orders with clean_history_id:', ordersWithCleanHistory.length)
      console.log('  Orders with clean_history_id details:', ordersWithCleanHistory.map(o => ({
        id: o.id,
        status: o.status,
        clean_history_id: o.clean_history_id
      })))
      
      if (ordersWithCleanHistory.length === 0) {
        console.log('  No orders with clean_history_id, skipping')
        return
      }
      
      try {
        const cleanHistoryPromises = ordersWithCleanHistory.map(async (order) => {
          if (order.clean_history_id) {
            console.log(`  Fetching clean history for order ${order.id} (${order.status}) with clean_history_id: ${order.clean_history_id}`)
            const cleanHistory = await getCleanHistoryRecord(order.clean_history_id)
            console.log(`  Clean history result for order ${order.id}:`, cleanHistory)
            return { orderId: order.id, cleanHistory }
          }
          return null
        })
        
        const results = await Promise.all(cleanHistoryPromises)
        const cleanHistoryMap: Record<string, CleanHistoryRecord> = {}
        
        results.forEach((result) => {
          if (result && result.cleanHistory) {
            cleanHistoryMap[result.orderId] = result.cleanHistory
            console.log(`  Added clean history for order ${result.orderId}`)
          }
        })
        
        console.log('  Final cleanHistoryMap:', cleanHistoryMap)
        setCleanHistoryData(cleanHistoryMap)
      } catch (error) {
        console.error('Error loading clean history data:', error)
      }
    }

    loadCleanHistoryData()
  }, [acceptedOrders, nearbyOrders])

  // Helper function to format time range
  const formatTimeRange = (startTime: string, endTime: string) => {
    const start = new Date(startTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    const end = new Date(endTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    return `${start} - ${end}`
  }



  // Helper function to calculate drying progress
  const getDryingProgress = (cleanHistory: CleanHistoryRecord | undefined) => {
    if (!cleanHistory?.start_time || !cleanHistory?.end_time) {
      return { progress: 0, isComplete: false, timeRemaining: null }
    }
    
    const now = new Date()
    const startTime = new Date(cleanHistory.start_time)
    const endTime = new Date(cleanHistory.end_time)
    
    if (now < startTime) {
      return { progress: 0, isComplete: false, timeRemaining: null }
    }
    
    if (now >= endTime) {
      return { progress: 100, isComplete: true, timeRemaining: null }
    }
    
    const totalDuration = endTime.getTime() - startTime.getTime()
    const elapsed = now.getTime() - startTime.getTime()
    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))
    
    const remainingMs = endTime.getTime() - now.getTime()
    const hoursRemaining = Math.ceil(remainingMs / (1000 * 60 * 60))
    
    return {
      progress: Math.round(progress),
      isComplete: false,
      timeRemaining: hoursRemaining
    }
  }

  // Execute order modal handlers
  const handleExecuteOrder = (order: OrderWithDuvet) => {
    setSelectedOrder(order)
    setExecuteOrderStep(1)
    setShowExecuteOrderModal(true)
  }

  // Accept order modal handlers
  const handleShowAcceptOrderModal = (order: OrderWithDuvet) => {
    setSelectedAcceptOrder(order)
    setShowAcceptOrderModal(true)
  }

  const handleCloseAcceptOrderModal = () => {
    setShowAcceptOrderModal(false)
    setSelectedAcceptOrder(null)
  }

  const handleDryPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setDryPhoto(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setDryPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCompleteOrder = async () => {
    if (!selectedOrder || !dryPhoto) return

    try {
      setIsUploadingDryPhoto(true)

      // Upload the dry photo
      const uploadResult = await uploadDuvetImage(dryPhoto, userId, 'dry-photos')
      if (!uploadResult) {
        throw new Error('Failed to upload dry photo')
      }

      // Update order status to in_progress and set dry_photo
      const success = await handleUpdateOrderStatus(selectedOrder.id, 'in_progress', undefined, uploadResult.url)
      
      if (success) {
        setExecuteOrderStep(3)
        // The order will be refreshed automatically through handleUpdateOrderStatus
      } else {
        throw new Error('Failed to complete order')
      }
    } catch (error) {
      console.error('Error completing order:', error)
      alert('Failed to complete order. Please try again.')
    } finally {
      setIsUploadingDryPhoto(false)
    }
  }

  // Handle final completion of in_progress order (after end time)
  const handleFinalCompleteOrder = async (orderId: string) => {
    try {
      const success = await handleUpdateOrderStatus(orderId, 'completed')
      
      if (success) {
        // Order will be refreshed automatically through handleUpdateOrderStatus
        console.log('Order completed successfully')
      } else {
        throw new Error('Failed to complete order')
      }
    } catch (error) {
      console.error('Error completing order:', error)
      alert('Failed to complete order. Please try again.')
    }
  }


  const handleCloseExecuteOrderModal = () => {
    setShowExecuteOrderModal(false)
    setSelectedOrder(null)
    setExecuteOrderStep(1)
    setDryPhoto(null)
    setDryPhotoPreview(null)
  }

  const handleExecuteOrderNextStep = () => {
    if (executeOrderStep < 3) {
      setExecuteOrderStep((prev) => (prev + 1) as 1 | 2 | 3)
    }
  }

  const handleExecuteOrderPrevStep = () => {
    if (executeOrderStep > 1) {
      setExecuteOrderStep((prev) => (prev - 1) as 1 | 2 | 3)
    }
  }

  if (isLoadingOrders) {
    return (
      <div className="bg-white">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <span className="ml-3 text-gray-600">Loading your orders...</span>
        </div>
      </div>
    )
  }

  // Merge and sort all orders
  const allOrders = [...acceptedOrders, ...nearbyOrders].sort((a, b) => {
    // Sort by status priority: accepted/in_progress first, then available, then completed
    const statusPriority = {
      'accepted': 1,
      'in_progress': 1,
      'pending': 2,
      'completed': 3,
      'cancelled': 4
    }
    return statusPriority[a.status] - statusPriority[b.status]
  })

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
          Nearby Orders
        </h1>
        <p className="text-lg text-gray-600">
          Help others and earn rewards
        </p>
      </div>

      <div className="space-y-8">

        {/* Unified Orders Section */}
        <div>
          {allOrders.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-500">No service requests available</p>
              <p className="text-sm text-gray-400 mt-1">Check back later for opportunities to help others</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allOrders.map((order) => {
                const address = acceptedOrders.includes(order) 
                  ? addresses.find(a => a.id === order.address_id)
                  : order.address_id ? nearbyOrderAddresses[order.address_id] : null
                const cleanHistory = cleanHistoryData[order.id]
                const isAccepted = acceptedOrders.includes(order)
                
                // Calculate display price (use order cost if available, otherwise default)
                const displayPrice = order.cost ? formatCost(order.cost) : '$20.00'
                
                return (
                  <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
                    {/* Status Badge and Price */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-300 ${
                        order.status === 'accepted' ? 'bg-blue-100 text-blue-800 animate-breathe' :
                        order.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 animate-breathe-yellow' :
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-orange-100 text-orange-800 animate-breathe-orange' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'pending' ? 'Available' : order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                      </span>
                      <span className="text-lg font-bold text-orange-600">{displayPrice}</span>
                    </div>
                    
                    {/* Location */}
                    {address && (
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {isAccepted ? address.full_address : formatLocalAddress(address)}
                        </h3>
                      </div>
                    )}
                    
                    {/* Time Information */}
                    <div className="mb-6">
                      {isAccepted && cleanHistory && cleanHistory.start_time && cleanHistory.end_time ? (
                        <p className="text-gray-600">
                          {formatTimeRange(cleanHistory.start_time, cleanHistory.end_time)}
                        </p>
                      ) : order.deadline ? (
                        <p className="text-gray-700 font-medium">
                          {formatRelativeTime(order.deadline)}
                        </p>
                      ) : (
                        <p className="text-gray-600">
                          Flexible timing
                        </p>
                      )}
                    </div>
                    
                    {/* Action Section */}
                    <div className="mt-auto">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleShowAcceptOrderModal(order)}
                          className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                        >
                          Accept
                        </button>
                      )}
                      
                      {order.status === 'accepted' && (
                        <button
                          onClick={() => handleExecuteOrder(order)}
                          className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                        >
                          Execute Order
                        </button>
                      )}
                      
                      {order.status === 'in_progress' && (
                        <>
                          {(() => {
                            const progressData = getDryingProgress(cleanHistory)
                            
                            if (progressData.isComplete) {
                              return (
                                <button
                                  onClick={() => handleFinalCompleteOrder(order.id)}
                                  className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                                >
                                  Complete Order
                                </button>
                              )
                            }
                            
                            return (
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-gray-600">Drying Progress</span>
                                  <span className="text-sm font-medium text-gray-700">{progressData.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-gray-600 to-gray-800 h-2 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${progressData.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            )
                          })()}
                        </>
                      )}
                      
                      {order.status === 'completed' && (
                        <div className="flex items-center justify-center py-3 px-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="text-sm font-medium text-gray-700">
                            ✓ Completed
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {/* Execute Order Modal */}
      <ExecuteOrderModal
        isOpen={showExecuteOrderModal}
        onClose={handleCloseExecuteOrderModal}
        order={selectedOrder}
        currentStep={executeOrderStep}
        selectedPhoto={dryPhoto}
        photoPreview={dryPhotoPreview}
        isUploadingPhoto={isUploadingDryPhoto}
        onPhotoUpload={handleDryPhotoUpload}
        onCompleteOrder={handleCompleteOrder}
        onNextStep={handleExecuteOrderNextStep}
        onPrevStep={handleExecuteOrderPrevStep}
      />

      {/* Accept Order Modal */}
      <AcceptOrderModal
        isOpen={showAcceptOrderModal}
        onClose={handleCloseAcceptOrderModal}
        order={selectedAcceptOrder}
        address={selectedAcceptOrder?.address_id ? 
          nearbyOrderAddresses[selectedAcceptOrder.address_id] || 
          addresses.find(a => a.id === selectedAcceptOrder.address_id) : null}
        cleanHistory={(() => {
          const cleanHistory = selectedAcceptOrder ? cleanHistoryData[selectedAcceptOrder.id] : null
          console.log('🔍 [OrdersPage] Passing cleanHistory to AcceptOrderModal:')
          console.log('  Selected order ID:', selectedAcceptOrder?.id)
          console.log('  CleanHistoryData object:', cleanHistoryData)
          console.log('  CleanHistory for this order:', cleanHistory)
          return cleanHistory
        })()}
        onAcceptOrder={handleAcceptOrder}
      />
    </div>
  )
}