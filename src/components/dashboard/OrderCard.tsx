'use client'

import Image from 'next/image'
import { type Order } from '@/lib/database'

interface OrderWithDetails extends Order {
  duvet_name?: string
  duvet_image?: string
  duvet_material?: string
  address_info?: string
  service_time_window?: string
  clean_history_data?: {
    id: string
    start_time: string | null
    end_time: string | null
  }
}

interface OrderCardProps {
  order: OrderWithDetails
  onPayment?: (order: OrderWithDetails) => void
}

export function OrderCard({ order, onPayment }: OrderCardProps) {
  // Helper function to calculate drying progress
  const getDryingProgress = (cleanHistoryData: OrderWithDetails['clean_history_data']) => {
    if (!cleanHistoryData?.start_time || !cleanHistoryData?.end_time) {
      return { progress: 0, isComplete: false, timeRemaining: null }
    }
    
    const now = new Date()
    const startTime = new Date(cleanHistoryData.start_time)
    const endTime = new Date(cleanHistoryData.end_time)
    
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

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800'
      case 'accepted': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-purple-100 text-purple-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (isPaid: boolean | null | undefined) => {
    if (isPaid === true) return 'bg-green-100 text-green-800'
    if (isPaid === false || isPaid === null) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getPaymentStatusText = (isPaid: boolean | null | undefined) => {
    if (isPaid === true) return 'Paid'
    return 'Unpaid'
  }

  const getStatusDisplayText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'accepted': return 'Accepted'
      case 'in_progress': return 'In Progress'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  // Determine which photo to display
  const displayPhoto = order.placed_photo || order.duvet_image || '/default-duvet.jpg'

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 group">
      {/* Large Photo - Top 60-70% of card */}
      <div className="w-full h-72 relative bg-gray-100">
        <Image
          src={displayPhoto}
          alt={`${order.duvet_name || 'Duvet'} service order`}
          fill
          className="object-cover"
        />
        
        {/* Status Badges - Top Left Corner */}
        <div className="absolute top-3 left-3 z-10 space-y-1">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${getStatusColor(order.status)}`}>
            {getStatusDisplayText(order.status)}
          </span>
          {/* Payment status only shown for completed orders */}
          {order.status === 'completed' && (
            <div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${getPaymentStatusColor(order.is_pay)}`}>
                {getPaymentStatusText(order.is_pay)}
              </span>
            </div>
          )}
        </div>

        {/* Price Badge - Top Right Corner */}
        {order.cost && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-black/70 text-white backdrop-blur-sm">
              ${order.cost.toFixed(2)}
            </span>
          </div>
        )}
      </div>
      
      {/* Content Section - Bottom 30-40% of card */}
      <div className="p-4">
        {/* Duvet Name - Main Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
          {order.duvet_name || 'Duvet Service Order'}
        </h3>
        
        {/* Address - Subtitle */}
        {order.address_info && (
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            {order.address_info}
          </p>
        )}

        {/* Metadata Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Order Date */}
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(order.created_at).toLocaleDateString()}
          </span>
          
          {/* Service Time Window */}
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {order.service_time_window || 'Flexible timing'}
          </span>

          {/* Payment Method if available and order is completed */}
          {order.status === 'completed' && order.pay_method && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              {order.pay_method}
            </span>
          )}
        </div>
        
        {/* Action Button - Only show Pay button for completed unpaid orders */}
        <div className="mt-auto">
          {order.status === 'completed' && (order.is_pay === false || order.is_pay === null) && order.cost && onPayment && (
            <button
              onClick={() => onPayment(order)}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium text-sm"
            >
              Pay Now
            </button>
          )}
          
          {order.status === 'completed' && order.is_pay === true && (
            <div className="flex items-center justify-center py-3 px-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="text-sm font-medium text-green-700">
                ✓ Paid
              </div>
            </div>
          )}

          {order.status === 'in_progress' && (
            <>
              {(() => {
                const progressData = getDryingProgress(order.clean_history_data)
                
                if (progressData.isComplete) {
                  return (
                    <div className="flex items-center justify-center py-3 px-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="text-sm font-medium text-green-700">
                        ✓ Drying Complete
                      </div>
                    </div>
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
                    {progressData.timeRemaining && progressData.timeRemaining > 0 && (
                      <div className="text-xs text-gray-500 text-center">
                        {progressData.timeRemaining}h remaining
                      </div>
                    )}
                  </div>
                )
              })()}
            </>
          )}

          {(order.status === 'pending' || order.status === 'accepted') && (
            <div className="flex items-center justify-center py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="text-sm font-medium text-gray-600">
                Service {order.status === 'pending' ? 'Pending' : 'Accepted'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}