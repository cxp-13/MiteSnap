import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { OrderWithDuvet } from '@/lib/database'
import { getCleanHistoryRecord, type CleanHistoryRecord } from '@/lib/clean-history'

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

  // Load clean history record when modal opens
  useEffect(() => {
    const loadCleanHistory = async () => {
      if (!isOpen || !order?.clean_history_id) {
        setCleanHistory(null)
        setIsLoadingHistory(false)
        return
      }

      setIsLoadingHistory(true)
      try {
        const history = await getCleanHistoryRecord(order.clean_history_id)
        setCleanHistory(history)
      } catch (error) {
        console.error('Error loading clean history:', error)
        setCleanHistory(null)
      } finally {
        setIsLoadingHistory(false)
      }
    }

    loadCleanHistory()
  }, [isOpen, order?.clean_history_id])

  if (!isOpen || !order) return null

  // Check if current time is within optimal drying window using clean_history
  const isWithinOptimalTime = () => {
    if (!cleanHistory?.start_time || !cleanHistory?.end_time) {
      return true // If no optimal time specified, allow execution
    }
    
    const now = new Date()
    const startTime = new Date(cleanHistory.start_time)
    const endTime = new Date(cleanHistory.end_time)
    
    return now >= startTime && now <= endTime
  }

  const canExecuteOrder = !isLoadingHistory && isWithinOptimalTime()

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 w-full mx-6 shadow-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-8">
          <h3 className="text-2xl font-light text-black tracking-tight">
            Execute Order - {order.duvet_name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-thin ml-6 mt-1"
          >
            ×
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-20 h-0.5 ${
                    currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === 1 && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-gray-900">Duvet Location Information</h4>
                <p className="text-gray-600">
                  Here are the details for the duvet you&apos;ll be helping to dry:
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 space-y-4">
                <div className="space-y-4 text-left">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Duvet Placement Photo</h5>
                    {order.placed_photo ? (
                      <div className="relative">
                        <Image
                          src={order.placed_photo}
                          alt="Duvet placement location"
                          width={400}
                          height={300}
                          className="w-full h-48 object-cover rounded-lg shadow-md"
                        />
                        <div className="mt-2 text-sm text-gray-600">
                          This photo shows where the duvet is placed for pickup
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500">
                        No placement photo available
                      </div>
                    )}
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Order Details</h5>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Duvet:</strong> {order.duvet_name || 'Duvet Drying Service'}</p>
                      <p><strong>Requested on:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                      {order.deadline && (
                        <p><strong>Deadline:</strong> {new Date(order.deadline).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Analysis Results */}
              {!isLoadingHistory && cleanHistory?.before_mite_score && cleanHistory?.after_mite_score && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h5 className="font-medium text-gray-900 mb-4">AI Predicted Results</h5>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">
                          {cleanHistory.before_mite_score}
                        </div>
                        <div className="text-xs text-gray-500">Current Mite Score</div>
                      </div>
                      <div className="text-gray-500 text-xl">→</div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {cleanHistory.after_mite_score}
                        </div>
                        <div className="text-xs text-gray-500">Predicted After Drying</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        -{cleanHistory.before_mite_score - cleanHistory.after_mite_score} points reduction predicted
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Time validation section */}
              {!isLoadingHistory && cleanHistory?.start_time && cleanHistory?.end_time && (
                <div className={`rounded-xl p-6 ${canExecuteOrder ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <h5 className="font-medium text-gray-900 mb-2">Optimal Drying Time Window</h5>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Optimal Time:</strong>{' '}
                      {new Date(cleanHistory.start_time).toLocaleString()} -{' '}
                      {new Date(cleanHistory.end_time).toLocaleString()}
                    </p>
                    <p>
                      <strong>Current Time:</strong> {new Date().toLocaleString()}
                    </p>
                    {canExecuteOrder ? (
                      <p className="text-green-700 font-medium">
                        ✓ Current time is within the optimal drying window
                      </p>
                    ) : (
                      <p className="text-red-700 font-medium">
                        ⚠ Current time is outside the optimal drying window. Please wait for the optimal time to execute this order.
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {isLoadingHistory && (
                <div className="rounded-xl p-6 bg-gray-50 border border-gray-200">
                  <p className="text-gray-600">Loading optimal time information...</p>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-gray-900">Upload Drying Photo</h4>
                <p className="text-gray-600">
                  After successfully drying the duvet, please take a photo to confirm completion.
                </p>
              </div>

              <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-500 transition-colors cursor-pointer">
                {photoPreview ? (
                  <div className="space-y-4">
                    <Image 
                      src={photoPreview} 
                      alt="Dried duvet photo" 
                      width={300}
                      height={200}
                      className="max-h-48 mx-auto rounded-xl shadow-md object-contain"
                    />
                    <p className="text-base text-green-600 font-medium">Photo uploaded successfully</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-6xl text-gray-400">📷</div>
                    <div>
                      <p className="text-xl text-gray-600 font-medium">Click to upload completion photo</p>
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
                <p className="text-blue-600">Uploading photo...</p>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <div className="text-6xl text-green-400 mb-4">✅</div>
                <h4 className="text-xl font-semibold text-gray-900">Order Completed Successfully!</h4>
                <p className="text-gray-600">
                  Thank you for helping with the duvet drying service. The order has been marked as completed.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h5 className="font-medium text-gray-900">What happens next?</h5>
                <div className="space-y-2 text-sm text-gray-600 text-left">
                  <p>• The duvet owner will be notified of completion</p>
                  <p>• Your service record has been updated</p>
                  <p>• You can view this order in your completed orders</p>
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
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onNextStep}
                disabled={!canExecuteOrder}
                className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                  canExecuteOrder 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {canExecuteOrder ? 'Start Drying Process' : 'Wait for Optimal Time'}
              </button>
            </>
          )}

          {currentStep === 2 && (
            <>
              <button
                onClick={onPrevStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={onCompleteOrder}
                disabled={!selectedPhoto || isUploadingPhoto}
                className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-green-600 transition-colors"
              >
                Complete Order
              </button>
            </>
          )}

          {currentStep === 3 && (
            <button
              onClick={onClose}
              className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors w-full"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}