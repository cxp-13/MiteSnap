'use client'

import { useState, useEffect } from 'react'
import { useOrders } from '@/hooks/dashboard/useOrders'
import { useAddresses } from '@/hooks/dashboard/useAddresses'
import { formatLocalAddress, formatRelativeTime } from '@/lib/address-utils'
import { getAddressesByIds, type Address } from '@/lib/database'

interface OrdersPageProps {
  userId: string
}

export default function OrdersPage({ userId }: OrdersPageProps) {
  const { orders, nearbyOrders, isLoadingOrders, handleDeleteOrder, handleAcceptOrder } = useOrders(userId)
  const { addresses } = useAddresses(userId)
  const [nearbyOrderAddresses, setNearbyOrderAddresses] = useState<Record<string, Address>>({})

  // Load addresses for nearby orders
  useEffect(() => {
    const loadNearbyOrderAddresses = async () => {
      if (nearbyOrders.length === 0) return
      
      const addressIds = [...new Set(nearbyOrders.map(order => order.address_id).filter(Boolean))]
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

  if (isLoadingOrders) {
    return (
      <div className="bg-white">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">My Orders</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <span className="ml-3 text-gray-600">Loading your orders...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">My Orders</h2>
      </div>

      <div className="space-y-8">
        {/* My Service Requests */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Service Requests</h3>
          {orders.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-500">No service requests yet</p>
              <p className="text-sm text-gray-400 mt-1">Your duvet drying requests will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((order) => {
                const address = addresses.find(a => a.id === order.address_id)
                return (
                  <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Duvet Drying Service</h4>
                      <p className="text-sm text-gray-600">Professional sun-drying assistance</p>
                      {address && (
                        <p className="text-sm text-gray-600">
                          📍 {address.full_address}
                        </p>
                      )}
                      {order.placed_photo && (
                        <img
                          src={order.placed_photo}
                          alt="Duvet placement"
                          className="w-full h-24 object-cover rounded mt-2"
                        />
                      )}
                    </div>

                    <div className="mt-4 space-y-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="w-full px-4 py-2 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                        >
                          Cancel Request
                        </button>
                      )}
                      
                      {order.status === 'accepted' && (
                        <div className="text-sm text-blue-600 font-medium">
                          Accepted by helper
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Nearby Orders */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Help Others (Nearby Orders)</h3>
          {nearbyOrders.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-500">No nearby service requests available</p>
              <p className="text-sm text-gray-400 mt-1">Check back later for opportunities to help others</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyOrders.map((order) => {
                const address = order.address_id ? nearbyOrderAddresses[order.address_id] : null
                return (
                  <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Available
                      </span>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">
                        {order.duvet_name || 'Duvet Drying Service'}
                      </h4>
                      {address && (
                        <p className="text-sm text-gray-600">
                          📍 {formatLocalAddress(address)}
                        </p>
                      )}
                      {order.deadline ? (
                        <p className="text-sm text-orange-600 font-medium">
                          ⏰ {formatRelativeTime(order.deadline)}
                        </p>
                      ) : (
                        <p className="text-sm text-blue-600 font-medium">
                          ⏰ Flexible timing
                        </p>
                      )}
                      {order.placed_photo && (
                        <img
                          src={order.placed_photo}
                          alt="Duvet placement"
                          className="w-full h-24 object-cover rounded mt-2"
                        />
                      )}
                    </div>

                    <div className="mt-4">
                      <button
                        onClick={() => handleAcceptOrder(order.id)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
                      >
                        Accept Service
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}