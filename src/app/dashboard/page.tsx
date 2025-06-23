'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Header from '@/components/Header'

type OrderStatus = 'pending' | 'accepted' | 'picked_up' | 'drying' | 'pending_return' | 'delivered'

interface Order {
  id: string
  userId: string
  quiltQuantity: number
  address: string
  timeSlot: string
  phone: string
  status: OrderStatus
  requestTime: string
  serviceProvider?: {
    name: string
    phone: string
  }
}

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const [activeTab, setActiveTab] = useState<'requests' | 'orders'>('requests')
  const [formData, setFormData] = useState({
    quiltQuantity: 1,
    address: '123 Main Street, Downtown',
    timeSlot: 'weekday-19-21',
    phone: '+1 (555) 123-4567'
  })

  // Mock data for demonstration
  const [myRequests, setMyRequests] = useState<Order[]>([
    {
      id: '1',
      userId: user?.id || '',
      quiltQuantity: 2,
      address: '123 Main Street, Downtown',
      timeSlot: 'Weekday 19:00-21:00',
      phone: '+1 (555) 123-4567',
      status: 'accepted',
      requestTime: '2024-01-15 10:30',
      serviceProvider: {
        name: 'Sarah Chen',
        phone: '+1 (555) 987-6543'
      }
    },
    {
      id: '2',
      userId: user?.id || '',
      quiltQuantity: 1,
      address: '123 Main Street, Downtown',
      timeSlot: 'Weekend 09:00-12:00',
      phone: '+1 (555) 123-4567',
      status: 'drying',
      requestTime: '2024-01-14 15:45'
    }
  ])

  const [availableOrders, setAvailableOrders] = useState<Order[]>([
    {
      id: '3',
      userId: 'other-user-1',
      quiltQuantity: 3,
      address: 'Oak Street Area',
      timeSlot: 'Weekday 19:00-21:00',
      phone: '+1 (555) 234-5678',
      status: 'pending',
      requestTime: '2024-01-15 14:20'
    },
    {
      id: '4',
      userId: 'other-user-2',
      quiltQuantity: 1,
      address: 'Pine Avenue District',
      timeSlot: 'Weekend 09:00-12:00',
      phone: '+1 (555) 345-6789',
      status: 'pending',
      requestTime: '2024-01-15 12:10'
    }
  ])

  const [acceptedOrders, setAcceptedOrders] = useState<Order[]>([
    {
      id: '5',
      userId: 'other-user-3',
      quiltQuantity: 2,
      address: '456 Elm Street, Riverside',
      timeSlot: 'Weekend 14:00-17:00',
      phone: '+1 (555) 456-7890',
      status: 'picked_up',
      requestTime: '2024-01-14 09:15'
    }
  ])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="text-lg text-orange-600">Loading...</div>
      </div>
    )
  }

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault()
    const newRequest: Order = {
      id: Date.now().toString(),
      userId: user?.id || '',
      quiltQuantity: formData.quiltQuantity,
      address: formData.address,
      timeSlot: formData.timeSlot.replace('-', ' ').replace('-', ':') + ':00',
      phone: formData.phone,
      status: 'pending',
      requestTime: new Date().toLocaleString()
    }
    setMyRequests([newRequest, ...myRequests])
    setFormData({ ...formData, quiltQuantity: 1 })
  }

  const handleAcceptOrder = (orderId: string) => {
    const order = availableOrders.find(o => o.id === orderId)
    if (order) {
      const acceptedOrder = {
        ...order,
        status: 'accepted' as OrderStatus,
        serviceProvider: {
          name: user?.firstName + ' ' + user?.lastName || 'Service Provider',
          phone: '+1 (555) 123-4567'
        }
      }
      setAcceptedOrders([acceptedOrder, ...acceptedOrders])
      setAvailableOrders(availableOrders.filter(o => o.id !== orderId))
    }
  }

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    setAcceptedOrders(acceptedOrders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-blue-100 text-blue-800'
      case 'picked_up': return 'bg-purple-100 text-purple-800'
      case 'drying': return 'bg-orange-100 text-orange-800'
      case 'pending_return': return 'bg-green-100 text-green-800'
      case 'delivered': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'Pending Acceptance'
      case 'accepted': return 'Accepted'
      case 'picked_up': return 'Picked Up'
      case 'drying': return 'Drying'
      case 'pending_return': return 'Pending Return'
      case 'delivered': return 'Delivered'
      default: return 'Unknown'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-green-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-yellow-100 mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.firstName || 'User'}!
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="text-yellow-500">☀️</span>
                <span>SunSpec Dashboard</span>
              </div>
            </div>
            
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 py-3 px-6 rounded-md font-medium transition-all duration-200 ${
                  activeTab === 'requests'
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="mr-2">🛏️</span>
                My Requests
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 py-3 px-6 rounded-md font-medium transition-all duration-200 ${
                  activeTab === 'orders'
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="mr-2">💼</span>
                Available Orders
              </button>
            </div>
          </div>
        </div>

        {/* My Requests Tab */}
        {activeTab === 'requests' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Post Drying Request Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-yellow-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Post a Drying Request</h2>
              
              <form onSubmit={handleSubmitRequest} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quilt Quantity
                  </label>
                  <select
                    value={formData.quiltQuantity}
                    onChange={(e) => setFormData({ ...formData, quiltQuantity: Number(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value={1}>1 quilt</option>
                    <option value={2}>2 quilts</option>
                    <option value={3}>3 quilts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pick-up/Delivery Address
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Enter your address"
                    />
                    <button
                      type="button"
                      className="px-4 py-3 text-sm text-yellow-600 border border-yellow-300 rounded-lg hover:bg-yellow-50"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pick-up/Delivery Time Slot
                  </label>
                  <select
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="weekday-19-21">Weekday 19:00-21:00</option>
                    <option value="weekend-09-12">Weekend 09:00-12:00</option>
                    <option value="weekend-14-17">Weekend 14:00-17:00</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white py-3 px-6 rounded-lg font-semibold shadow-md transform hover:scale-105 transition-all duration-200"
                >
                  Post Request
                </button>
              </form>
            </div>

            {/* My Quilt Progress List */}
            <div className="bg-white rounded-2xl shadow-sm border border-yellow-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">My Quilt Progress</h2>
              
              <div className="space-y-4">
                {myRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {request.quiltQuantity} quilt{request.quiltQuantity > 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-gray-600">Posted: {request.requestTime}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">Time: {request.timeSlot}</p>
                    
                    {request.serviceProvider && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">Service Provider:</p>
                        <p className="text-sm text-blue-800">{request.serviceProvider.name}</p>
                        <p className="text-sm text-blue-800">{request.serviceProvider.phone}</p>
                      </div>
                    )}
                    
                    {request.status === 'delivered' && (
                      <button className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium">
                        Confirm Completion & Rate
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Available Orders Tab */}
        {activeTab === 'orders' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Available Orders List */}
            <div className="bg-white rounded-2xl shadow-sm border border-yellow-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Orders</h2>
              
              <div className="space-y-4">
                {availableOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.quiltQuantity} quilt{order.quiltQuantity > 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-gray-600">Posted: {order.requestTime}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">📍 {order.address}</p>
                    <p className="text-sm text-gray-600 mb-4">⏰ {order.timeSlot}</p>
                    
                    <button
                      onClick={() => handleAcceptOrder(order.id)}
                      className="w-full bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white py-2 px-4 rounded-lg font-medium transform hover:scale-105 transition-all duration-200"
                    >
                      Accept Order Now
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* My Accepted Orders List */}
            <div className="bg-white rounded-2xl shadow-sm border border-yellow-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">My Accepted Orders</h2>
              
              <div className="space-y-4">
                {acceptedOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.quiltQuantity} quilt{order.quiltQuantity > 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-gray-600">Accepted: {order.requestTime}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <p className="text-sm font-medium text-gray-900">Customer Info:</p>
                      <p className="text-sm text-gray-700">📍 {order.address}</p>
                      <p className="text-sm text-gray-700">📞 {order.phone}</p>
                      <p className="text-sm text-gray-700">⏰ {order.timeSlot}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      {order.status === 'accepted' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'picked_up')}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium"
                        >
                          Confirm Picked Up
                        </button>
                      )}
                      {order.status === 'picked_up' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'drying')}
                          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded-lg text-sm font-medium"
                        >
                          Start Drying
                        </button>
                      )}
                      {order.status === 'drying' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'pending_return')}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium"
                        >
                          Ready for Return
                        </button>
                      )}
                      {order.status === 'pending_return' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'delivered')}
                          className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg text-sm font-medium"
                        >
                          Confirm Delivered
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}