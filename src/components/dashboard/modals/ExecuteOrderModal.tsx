import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { OrderWithDuvet, getAddressById, type Address } from '@/lib/database'
import { getCleanHistoryRecord, type CleanHistoryRecord } from '@/lib/clean-history'
import { getCurrentPosition } from '@/lib/geolocation'
import { calculateNavigationInfo, formatLocalAddress, formatTimeWindow, type NavigationInfo } from '@/lib/address-utils'

interface ExecuteOrderModalProps {
  isOpen: boolean
  onClose: () => void
  order: OrderWithDuvet | null
  currentStep: 1 | 2 | 3
  selectedPhoto: File | null
  photoPreview: string | null
  isUploadingPhoto: boolean
  onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onCompleteOrder: () => void
  onNextStep?: () => void
  onPrevStep?: () => void
}

export default function ExecuteOrderModal({
  isOpen,
  onClose,
  order,
  currentStep,
  selectedPhoto,
  photoPreview,
  isUploadingPhoto,
  onPhotoUpload,
  onCompleteOrder,
  onNextStep,
  onPrevStep
}: ExecuteOrderModalProps) {
  const [cleanHistory, setCleanHistory] = useState<CleanHistoryRecord | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [orderAddress, setOrderAddress] = useState<Address | null>(null)
  const [navigationInfo, setNavigationInfo] = useState<NavigationInfo | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

  // Load clean history record and navigation data when modal opens
  useEffect(() => {
    const loadOrderData = async () => {
      if (!isOpen || !order) {
        setCleanHistory(null)
        setOrderAddress(null)
        setNavigationInfo(null)
        setIsLoadingHistory(false)
        return
      }

      setIsLoadingHistory(true)
      try {
        // Load clean history if available
        let history = null
        if (order.clean_history_id) {
          history = await getCleanHistoryRecord(order.clean_history_id)
          setCleanHistory(history)
        }

        // Load order address
        let address = null
        if (order.address_id) {
          address = await getAddressById(order.address_id)
          setOrderAddress(address)
        }

        // Get user location for navigation
        if (address?.latitude && address?.longitude) {
          setIsLoadingLocation(true)
          try {
            const position = await getCurrentPosition({ timeout: 5000 })
            const userLoc = {
              latitude: position.latitude,
              longitude: position.longitude
            }

            // Calculate navigation info
            const destinationLoc = {
              latitude: address.latitude,
              longitude: address.longitude
            }
            const navInfo = calculateNavigationInfo(userLoc, destinationLoc)
            setNavigationInfo(navInfo)
          } catch (locationError) {
            console.warn('Could not get user location:', locationError)
          } finally {
            setIsLoadingLocation(false)
          }
        }
      } catch (error) {
        console.error('Error loading order data:', error)
        setCleanHistory(null)
        setOrderAddress(null)
      } finally {
        setIsLoadingHistory(false)
      }
    }

    loadOrderData()
  }, [isOpen, order])

  if (!isOpen || !order) return null


  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full mx-6 shadow-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-8">
          <h3 className="text-2xl font-semibold text-gray-900">
            Execute Order - {order.duvet_name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light ml-6 mt-1 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  currentStep >= step
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-20 h-1 rounded-full transition-colors ${
                    currentStep > step ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Navigation-Style Header */}
              <div className="text-center space-y-2">
                <h4 className="text-xl font-semibold text-gray-900">Navigate to Pickup Location</h4>
                <p className="text-gray-500 text-sm">Essential information for your drying service</p>
              </div>

              {/* Navigation Info Card */}
              {isLoadingLocation || isLoadingHistory ? (
                <div className="bg-gray-50 rounded-2xl p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading navigation info...</p>
                </div>
              ) : navigationInfo && orderAddress ? (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 space-y-4">
                  {/* Distance and Time - Navigation App Style */}
                  <div className="text-center space-y-2">
                    <div className="text-4xl font-bold text-blue-600">
                      {navigationInfo.formattedDistance}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center justify-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <span>🚶</span>
                          <span>{navigationInfo.formattedWalkingTime}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>🚗</span>
                          <span>{navigationInfo.formattedDrivingTime}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="bg-white/70 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-lg">📍</span>
                      <span className="font-medium text-gray-900">Destination</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {formatLocalAddress(orderAddress)}
                    </p>
                  </div>
                </div>
              ) : orderAddress ? (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                  <div className="text-center space-y-3">
                    <div className="text-3xl text-gray-400">📍</div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Pickup Location</h5>
                      <p className="text-gray-700 text-sm">{formatLocalAddress(orderAddress)}</p>
                    </div>
                    <p className="text-xs text-gray-500">Location access needed for navigation</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl p-6 text-center text-gray-500">
                  <span className="text-2xl">❌</span>
                  <p className="mt-2">Address information not available</p>
                </div>
              )}

              {/* Drying Time Window */}
              {cleanHistory && (
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6">
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-lg">⏰</span>
                      <span className="font-medium text-gray-900">Drying Time</span>
                    </div>
                    <div className="text-xl font-semibold text-orange-600">
                      {formatTimeWindow(cleanHistory.start_time, cleanHistory.end_time)}
                    </div>
                    <p className="text-xs text-gray-600">Optimal sun drying period</p>
                  </div>
                </div>
              )}

              {/* Duvet Placement Photo */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📷</span>
                  <span className="font-medium text-gray-900">Duvet Location</span>
                </div>
                {order.placed_photo ? (
                  <div className="relative">
                    <Image
                      src={order.placed_photo}
                      alt="Duvet placement location"
                      width={400}
                      height={240}
                      className="w-full h-48 object-cover rounded-xl shadow-lg"
                    />
                    <div className="mt-2 text-xs text-gray-500 text-center">
                      Owner&apos;s photo showing duvet placement
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-xl p-8 text-center text-gray-500">
                    <span className="text-3xl block mb-2">📷</span>
                    <p className="text-sm">No placement photo provided</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <h4 className="text-2xl font-semibold text-gray-900">Upload Drying Photo</h4>
                <p className="text-gray-600 text-lg">
                  After successfully drying the duvet, please take a photo to confirm completion.
                </p>
              </div>

              <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-500 transition-all duration-200 cursor-pointer bg-gradient-to-br from-gray-50 to-blue-50">
                {photoPreview ? (
                  <div className="space-y-4">
                    <Image 
                      src={photoPreview} 
                      alt="Dried duvet photo" 
                      width={300}
                      height={200}
                      className="max-h-56 mx-auto rounded-xl shadow-lg object-contain"
                    />
                    <p className="text-lg text-green-600 font-semibold bg-green-50 rounded-lg p-3">Photo uploaded successfully</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-6xl text-gray-400">📷</div>
                    <div>
                      <p className="text-xl text-gray-700 font-semibold">Click to upload completion photo</p>
                      <p className="text-sm text-gray-500 mt-2">JPG, PNG or HEIC format</p>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={onPhotoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploadingPhoto}
                />
              </div>

              {isUploadingPhoto && (
                <div className="text-center">
                  <p className="text-blue-600 font-medium">Uploading photo...</p>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <div className="text-6xl text-green-500 mb-4">✅</div>
                <h4 className="text-2xl font-semibold text-gray-900">Order Completed Successfully!</h4>
                <p className="text-gray-600 text-lg">
                  Thank you for helping with the duvet drying service. The order has been marked as completed.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 space-y-4">
                <h5 className="font-semibold text-gray-900 text-lg">What happens next?</h5>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p>The duvet owner will be notified of completion</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p>Your service record has been updated</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p>You can view this order in your completed orders</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8">
          {currentStep === 1 && (
            <>
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={onNextStep}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Arrive & Start Drying
              </button>
            </>
          )}

          {currentStep === 2 && (
            <>
              <button
                onClick={onPrevStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Back
              </button>
              <button
                onClick={onCompleteOrder}
                disabled={!selectedPhoto || isUploadingPhoto}
                className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Complete Order
              </button>
            </>
          )}

          {currentStep === 3 && (
            <button
              onClick={onClose}
              className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all duration-200 w-full shadow-lg hover:shadow-xl"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}