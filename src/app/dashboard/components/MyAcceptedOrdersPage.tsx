'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useOrders } from '@/hooks/dashboard/useOrders'
import { formatLocalAddress } from '@/lib/address-utils'
import { getAddressesByIds, type Address, type OrderWithDuvet } from '@/lib/database'
import { uploadDuvetImage } from '@/lib/storage'
import { getCleanHistoryRecord, type CleanHistoryRecord } from '@/lib/clean-history'
import ExecuteOrderModal from '@/components/dashboard/modals/ExecuteOrderModal'
import { MdCalendarToday, MdAttachMoney, MdApartment, MdElevator, MdStairs } from 'react-icons/md'

interface MyAcceptedOrdersPageProps {
  userId: string
}

export default function MyAcceptedOrdersPage({ userId }: MyAcceptedOrdersPageProps) {
  const { allNearbyOrders, isLoadingOrders, handleUpdateOrderStatus, handleCancelAcceptedOrder } = useOrders(userId)
  const [nearbyOrderAddresses, setNearbyOrderAddresses] = useState<Record<string, Address>>({})
  const [cleanHistoryData, setCleanHistoryData] = useState<Record<string, CleanHistoryRecord>>({})
  const [statusFilter, setStatusFilter] = useState<'all' | 'accepted' | 'in_progress' | 'completed'>('all')
  
  // Execute order modal state
  const [showExecuteOrderModal, setShowExecuteOrderModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDuvet | null>(null)
  const [executeOrderStep, setExecuteOrderStep] = useState<1 | 2 | 3>(1)
  const [dryPhoto, setDryPhoto] = useState<File | null>(null)
  const [dryPhotoPreview, setDryPhotoPreview] = useState<string | null>(null)
  const [isUploadingDryPhoto, setIsUploadingDryPhoto] = useState(false)

  // Filter orders to only show accepted orders for this user
  const myAcceptedOrders = allNearbyOrders.filter(order => 
    (order.status === 'accepted' || order.status === 'in_progress' || order.status === 'completed') &&
    order.service_user_id === userId
  )

  // Filter by status
  const filteredOrders = statusFilter === 'all' 
    ? myAcceptedOrders 
    : myAcceptedOrders.filter(order => order.status === statusFilter)

  // Load addresses for accepted orders
  useEffect(() => {
    const loadOrderAddresses = async () => {
      if (myAcceptedOrders.length === 0) return
      
      const addressIds = [...new Set(myAcceptedOrders.map(order => order.address_id).filter((id): id is string => Boolean(id)))]
      if (addressIds.length === 0) return
      
      try {
        const addressMap = await getAddressesByIds(addressIds)
        setNearbyOrderAddresses(addressMap)
      } catch (error) {
        console.error('Error loading order addresses:', error)
      }
    }

    loadOrderAddresses()
  }, [myAcceptedOrders])

  // Load clean history data for accepted orders
  useEffect(() => {
    const loadCleanHistoryData = async () => {
      if (myAcceptedOrders.length === 0) return
      
      const ordersWithCleanHistory = myAcceptedOrders.filter(order => order.clean_history_id)
      if (ordersWithCleanHistory.length === 0) return
      
      try {
        const cleanHistoryPromises = ordersWithCleanHistory.map(async (order) => {
          if (order.clean_history_id) {
            const cleanHistory = await getCleanHistoryRecord(order.clean_history_id)
            return { orderId: order.id, cleanHistory }
          }
          return null
        })
        
        const results = await Promise.all(cleanHistoryPromises)
        const cleanHistoryMap: Record<string, CleanHistoryRecord> = {}
        
        results.forEach((result) => {
          if (result && result.cleanHistory) {
            cleanHistoryMap[result.orderId] = result.cleanHistory
          }
        })
        
        setCleanHistoryData(cleanHistoryMap)
      } catch (error) {
        console.error('Error loading clean history data:', error)
      }
    }

    loadCleanHistoryData()
  }, [myAcceptedOrders])

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

  // Helper function to check if current time is within execution window
  const isWithinExecutionTime = (cleanHistory: CleanHistoryRecord | undefined) => {
    if (!cleanHistory?.start_time) {
      return { canExecute: false, minutesUntilStart: null }
    }
    
    const now = new Date()
    const startTime = new Date(cleanHistory.start_time)
    
    if (now >= startTime) {
      return { canExecute: true, minutesUntilStart: null }
    }
    
    const timeDiff = startTime.getTime() - now.getTime()
    const minutesUntilStart = Math.ceil(timeDiff / (1000 * 60))
    
    return { canExecute: false, minutesUntilStart }
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

  // Cancel order handler
  const handleCancelOrder = async (orderId: string) => {
    try {
      const success = await handleCancelAcceptedOrder(orderId)
      if (!success) {
        alert('Failed to cancel order. Please try again.')
      }
    } catch (error) {
      console.error('Error canceling order:', error)
      alert('Failed to cancel order. Please try again.')
    }
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
        setExecuteOrderStep(2)
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

  const handleModalFinalComplete = async () => {
    if (!selectedOrder) return
    
    try {
      handleCloseExecuteOrderModal()
    } catch (error) {
      console.error('Error closing execute order modal:', error)
    }
  }

  // Handle final completion of in_progress order (after end time)
  const handleFinalCompleteOrder = async (orderId: string) => {
    try {
      const success = await handleUpdateOrderStatus(orderId, 'completed')
      
      if (success) {
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

  if (isLoadingOrders) {
    return (
      <div className="bg-white">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <span className="ml-3 text-gray-600">Loading your accepted orders...</span>
        </div>
      </div>
    )
  }

  // Sort orders by status priority and date
  const sortedOrders = filteredOrders.sort((a, b) => {
    const statusPriority: Record<string, number> = {
      'pending': 0,
      'accepted': 1,
      'in_progress': 2,
      'completed': 3,
      'cancelled': 4
    }
    return statusPriority[a.status] - statusPriority[b.status]
  })

  // Get counts for each status
  const statusCounts = {
    all: myAcceptedOrders.length,
    accepted: myAcceptedOrders.filter(o => o.status === 'accepted').length,
    in_progress: myAcceptedOrders.filter(o => o.status === 'in_progress').length,
    completed: myAcceptedOrders.filter(o => o.status === 'completed').length
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
          My Accepted Orders
        </h1>
        <p className="text-lg text-gray-600">
          Track and manage your service commitments
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({statusCounts.all})
          </button>
          <button
            onClick={() => setStatusFilter('accepted')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              statusFilter === 'accepted'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            Accepted ({statusCounts.accepted})
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              statusFilter === 'in_progress'
                ? 'bg-yellow-600 text-white'
                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            }`}
          >
            In Progress ({statusCounts.in_progress})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              statusFilter === 'completed'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            Completed ({statusCounts.completed})
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Orders Section */}
        <div>
          {sortedOrders.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-500">
                {statusFilter === 'all' 
                  ? 'No accepted orders yet' 
                  : `No ${statusFilter.replace('_', ' ')} orders`
                }
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Accept orders from the nearby orders page to see them here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedOrders.map((order) => {
                const address = order.address_id ? nearbyOrderAddresses[order.address_id] : null
                const cleanHistory = cleanHistoryData[order.id]
                
                return (
                  <div key={order.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 group">
                    {/* Large Duvet Photo */}
                    {order.placed_photo && (
                      <div className="w-full h-72 relative bg-gray-100">
                        <Image
                          src={order.placed_photo}
                          alt={`${order.duvet_name || 'Duvet'} photo`}
                          fill
                          className="object-cover"
                        />
                        {/* Status Badge */}
                        <div className="absolute top-3 left-3 z-10">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm transition-all duration-300 ${
                            order.status === 'accepted' ? 'bg-blue-500/90 text-white animate-breathe' :
                            order.status === 'in_progress' ? 'bg-yellow-500/90 text-white animate-breathe-yellow' :
                            order.status === 'completed' ? 'bg-green-500/90 text-white' :
                            'bg-gray-500/90 text-white'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-4">
                      {/* Tags Section */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {/* Date/Time Tag */}
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          <MdCalendarToday className="w-3 h-3" />
                          {cleanHistory && cleanHistory.start_time && cleanHistory.end_time ? (
                            formatTimeRange(cleanHistory.start_time, cleanHistory.end_time)
                          ) : (
                            'Flexible timing'
                          )}
                        </span>
                        
                        {/* Price Tag */}
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          <MdAttachMoney className="w-3 h-3" />
                          {order.cost ? order.cost.toFixed(2) : '20.00'}
                        </span>
                        
                        {/* Floor Tag */}
                        {address?.floor_number !== undefined && address?.floor_number !== null && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            <MdApartment className="w-3 h-3" />
                            Floor {address.floor_number}
                          </span>
                        )}
                        
                        {/* Elevator Tag */}
                        {address?.has_elevator !== undefined && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            {address.has_elevator ? <MdElevator className="w-3 h-3" /> : <MdStairs className="w-3 h-3" />}
                            {address.has_elevator ? 'Elevator' : 'No Elevator'}
                          </span>
                        )}
                        
                        {/* Payment Status Tag - Only show for completed orders */}
                        {order.status === 'completed' && (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                            order.is_pay === true 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {order.is_pay === true ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              )}
                            </svg>
                            {order.is_pay === true ? 'Paid' : 'Unpaid'}
                          </span>
                        )}
                      </div>
                      
                      {/* Main Title - Duvet Name */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                        {order.duvet_name || 'Duvet Service Request'}
                      </h3>
                      
                      {/* Description - Address */}
                      {address && (
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                          {address.full_address || formatLocalAddress(address)}
                        </p>
                      )}
                      
                      {/* Action Section */}
                      <div className="mt-auto">
                        {order.status === 'accepted' && (
                          <>
                            {(() => {
                              const executionCheck = isWithinExecutionTime(cleanHistory)
                              
                              if (executionCheck.canExecute) {
                                return (
                                  <div className="space-y-2">
                                    <button
                                      onClick={() => handleExecuteOrder(order)}
                                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm"
                                    >
                                      Execute Order
                                    </button>
                                    <button
                                      onClick={() => handleCancelOrder(order.id)}
                                      className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm"
                                    >
                                      Cancel Order
                                    </button>
                                  </div>
                                )
                              }
                              
                              return (
                                <div className="space-y-2">
                                  <button
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-300 text-gray-500 rounded-xl cursor-not-allowed font-medium text-sm"
                                  >
                                    {executionCheck.minutesUntilStart && executionCheck.minutesUntilStart > 60 
                                      ? `${Math.ceil(executionCheck.minutesUntilStart / 60)}h ${executionCheck.minutesUntilStart % 60}m until start`
                                      : `${executionCheck.minutesUntilStart || 0}m until start`
                                    }
                                  </button>
                                  <button
                                    onClick={() => handleCancelOrder(order.id)}
                                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm"
                                  >
                                    Cancel Order
                                  </button>
                                </div>
                              )
                            })()}
                          </>
                        )}
                        
                        {order.status === 'in_progress' && (
                          <>
                            {(() => {
                              const progressData = getDryingProgress(cleanHistory)
                              
                              if (progressData.isComplete) {
                                return (
                                  <button
                                    onClick={() => handleFinalCompleteOrder(order.id)}
                                    className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium text-sm"
                                  >
                                    Complete Order
                                  </button>
                                )
                              }
                              
                              return (
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Drying Progress</span>
                                    <span className="text-sm font-medium text-gray-700">{progressData.progress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-500 ease-out"
                                      style={{ width: `${progressData.progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )
                            })()}
                          </>
                        )}
                        
                        {order.status === 'completed' && (
                          <div className="flex items-center justify-center py-3 px-4 bg-green-50 border border-green-200 rounded-xl">
                            <div className="text-sm font-medium text-green-700">
                              ✓ Completed
                            </div>
                          </div>
                        )}
                      </div>
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
        cleanHistory={selectedOrder ? cleanHistoryData[selectedOrder.id] : null}
        currentStep={executeOrderStep}
        selectedPhoto={dryPhoto}
        photoPreview={dryPhotoPreview}
        isUploadingPhoto={isUploadingDryPhoto}
        onPhotoUpload={handleDryPhotoUpload}
        onCompleteOrder={handleCompleteOrder}
        onFinalComplete={handleModalFinalComplete}
      />
    </div>
  )
}