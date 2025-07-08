'use client'

import { useOrders } from '@/hooks/dashboard/useOrders'
import { useState } from 'react'
import { type Order, markOrderAsPaid } from '@/lib/database'
import { PaymentModal } from './modals/PaymentModal'

interface MyOrdersPageProps {
  userId: string
}

export function MyOrdersPage({ userId }: MyOrdersPageProps) {
  const { orders, isLoadingOrders, loadOrders } = useOrders(userId)
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  const handleOpenPaymentModal = (order: Order) => {
    setSelectedOrder(order)
    setIsPaymentModalOpen(true)
  }

  const handleClosePaymentModal = () => {
    setSelectedOrder(null)
    setIsPaymentModalOpen(false)
  }

  const handlePaymentSuccess = async (paymentMethod: string) => {
    if (selectedOrder) {
      const success = await markOrderAsPaid(selectedOrder.id, paymentMethod)
      if (success) {
        loadOrders()
      } else {
        console.error('Failed to mark order as paid')
      }
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    if (filter === 'paid') return order.is_pay === true
    if (filter === 'unpaid') return order.is_pay === false || order.is_pay === null
    return true
  })

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-purple-100 text-purple-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (isPaid: boolean | null | undefined) => {
    if (isPaid === true) return 'bg-green-100 text-green-800'
    if (isPaid === false) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getPaymentStatusText = (isPaid: boolean | null | undefined) => {
    if (isPaid === true) return 'Paid'
    if (isPaid === false) return 'Unpaid'
    return 'Unknown'
  }

  if (isLoadingOrders) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1">
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Manage your service orders</p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'paid' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
            >
              Paid ({orders.filter(o => o.is_pay === true).length})
            </button>
            <button
              onClick={() => setFilter('unpaid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'unpaid' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
            >
              Unpaid ({orders.filter(o => o.is_pay === false || o.is_pay === null).length})
            </button>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' 
                  ? "You haven't created any orders yet."
                  : `You don't have any ${filter} orders.`
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${getStatusColor(order.status)}`}>{order.status.replace('_', ' ').toUpperCase()}</span>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${getPaymentStatusColor(order.is_pay)}`}>{getPaymentStatusText(order.is_pay)}</span>
                    {order.pay_method && (
                      <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md">{order.pay_method}</span>
                    )}
                  </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-sm text-gray-500">Order ID</p>
                          <p className="text-sm font-medium text-gray-900">{order.id.slice(0, 8)}...</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Created</p>
                          <p className="text-sm font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        {order.cost && (
                          <div>
                            <p className="text-sm text-gray-500">Cost</p>
                            <p className="text-sm font-medium text-gray-900">${order.cost}</p>
                          </div>
                        )}
                        {order.service_user_id && (
                          <div>
                            <p className="text-sm text-gray-500">Service Provider</p>
                            <p className="text-sm font-medium text-gray-900">{order.service_user_id.slice(0, 8)}...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                  {(order.is_pay === false || order.is_pay === null) && order.cost && (
                    <button
                      onClick={() => handleOpenPaymentModal(order)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Pay Now
                    </button>
                  )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedOrder && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={handleClosePaymentModal}
          order={selectedOrder}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}