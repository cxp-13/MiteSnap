'use client'

import { useOrders } from '@/hooks/dashboard/useOrders'
import { useState } from 'react'
import { type OrderWithDetails, markOrderAsPaid } from '@/lib/database'
import { PaymentModal } from './modals/PaymentModal'
import { OrderCard } from './OrderCard'

interface MyOrdersPageProps {
  userId: string
}

export function MyOrdersPage({ userId }: MyOrdersPageProps) {
  const { ordersWithDetails, isLoadingOrders, loadOrders } = useOrders(userId)
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid' | 'pending' | 'completed'>('all')
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  // Debug logging
  console.log('🏠 [MyOrdersPage] Component rendered with userId:', userId)
  console.log('📦 [MyOrdersPage] ordersWithDetails:', ordersWithDetails)
  console.log('🔄 [MyOrdersPage] isLoadingOrders:', isLoadingOrders)

  const handleOpenPaymentModal = (order: OrderWithDetails) => {
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

  const filteredOrders = ordersWithDetails.filter(order => {
    if (filter === 'all') return true
    if (filter === 'paid') return order.is_pay === true
    if (filter === 'unpaid') return order.is_pay === false || order.is_pay === null
    if (filter === 'pending') return order.status === 'pending'
    if (filter === 'completed') return order.status === 'completed'
    return true
  })


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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              All ({ordersWithDetails.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}
            >
              Pending ({ordersWithDetails.filter(o => o.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'completed' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
            >
              Completed ({ordersWithDetails.filter(o => o.status === 'completed').length})
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'paid' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            >
              Paid ({ordersWithDetails.filter(o => o.is_pay === true).length})
            </button>
            <button
              onClick={() => setFilter('unpaid')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'unpaid' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
            >
              Unpaid ({ordersWithDetails.filter(o => o.is_pay === false || o.is_pay === null).length})
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onPayment={handleOpenPaymentModal}
              />
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