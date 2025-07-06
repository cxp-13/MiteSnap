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
      <div className="bg-white rounded-2xl p-0 w-full mx-6 shadow-2xl max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 pt-6 pb-2">
          <h3 className="text-xl font-semibold text-gray-900">Execute Order - {order.duvet_name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light ml-6 mt-1 transition-colors"
          >
            ×
          </button>
        </div>
        {/* Step 1: 极简 blog 卡片风格，无 stepper，无多余色块 */}
        {currentStep === 1 && (
          <div className="flex flex-col items-center">
            <div className="w-full">
              {/* 图片 */}
              <div className="w-full h-48 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center mx-auto">
                {order.placed_photo ? (
                  <Image
                    src={order.placed_photo}
                    alt="Duvet placement"
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">无被子放置图片</span>
                )}
              </div>
              {/* badge区 */}
              <div className="flex gap-2 px-6 py-3">
                <span className="inline-block rounded border px-3 py-1 text-sm font-semibold text-gray-900 bg-white">
                  {order.cost ? `￥${order.cost.toFixed(2)}` : '价格未知'}
                </span>
                {orderAddress?.floor && (
                  <span className="inline-block rounded border px-3 py-1 text-sm font-medium text-gray-700 bg-white">
                    Floor {orderAddress.floor}
                  </span>
                )}
                {orderAddress?.has_elevator !== undefined && (
                  <span className="inline-block rounded border px-3 py-1 text-sm font-medium text-gray-700 bg-white">
                    {orderAddress.has_elevator ? 'Elevator' : 'No Elevator'}
                  </span>
                )}
              </div>
              {/* 地址卡片 */}
              <div className="bg-white rounded-xl border px-4 py-3 mx-6 mb-2 flex items-center gap-3">
                <span className="text-pink-500 text-lg">📍</span>
                <div>
                  <div className="text-xs font-semibold text-gray-700">Location</div>
                  <div className="text-base font-medium text-gray-900 truncate">{orderAddress ? formatLocalAddress(orderAddress) : '—'}</div>
                </div>
              </div>
              {/* 时间卡片 */}
              <div className="bg-white rounded-xl border px-4 py-3 mx-6 mb-6 flex items-center gap-3">
                <span className="text-pink-500 text-lg">⏰</span>
                <div>
                  <div className="text-xs font-semibold text-gray-700">Time</div>
                  <div className="text-base font-medium text-gray-900">
                    {cleanHistory && cleanHistory.start_time && cleanHistory.end_time
                      ? formatTimeWindow(cleanHistory.start_time, cleanHistory.end_time)
                      : order.deadline
                        ? new Date(order.deadline).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                        : '—'}
                  </div>
                  {(cleanHistory && cleanHistory.start_time) && (
                    <div className="text-xs text-gray-400">
                      {new Date(cleanHistory.start_time).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>
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
  )
}