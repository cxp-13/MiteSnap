import React from 'react'
import Image from 'next/image'
import { OrderWithDuvet } from '@/lib/database'
import { CleanHistoryRecord } from '@/lib/clean-history'
import { MdAccessTime, MdSchedule, MdFiberManualRecord, MdLightbulb } from 'react-icons/md'

interface ExecuteOrderModalProps {
  isOpen: boolean
  onClose: () => void
  order: OrderWithDuvet | null
  cleanHistory?: CleanHistoryRecord | null
  currentStep: 1 | 2 | 3
  selectedPhoto: File | null
  photoPreview: string | null
  isUploadingPhoto: boolean
  onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onCompleteOrder: () => void
  onFinalComplete?: () => void
}

export default function ExecuteOrderModal({
  isOpen,
  onClose,
  order,
  cleanHistory,
  currentStep,
  selectedPhoto,
  photoPreview,
  isUploadingPhoto,
  onPhotoUpload,
  onCompleteOrder,
  onFinalComplete,
}: ExecuteOrderModalProps) {

  // Helper function to format end time
  const formatEndTime = (endTime: string) => {
    return new Date(endTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (!isOpen || !order) return null


  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-0 w-full mx-6 shadow-xl max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Execute Order - {order.duvet_name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-light ml-4 transition-colors"
          >
            ×
          </button>
        </div>

        {currentStep === 1 && (
          <div className="px-6 pb-6">
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <h4 className="text-xl font-semibold text-gray-900">Upload Drying Photo</h4>
                <p className="text-gray-600 text-base leading-relaxed max-w-md mx-auto">
                  After successfully drying the duvet, please take a photo to confirm completion.
                </p>
              </div>

              <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-gray-300 transition-all duration-200 cursor-pointer bg-gray-50 min-h-[240px] flex items-center justify-center">
                {photoPreview ? (
                  <div className="space-y-6">
                    <Image 
                      src={photoPreview} 
                      alt="Dried duvet photo" 
                      width={320}
                      height={240}
                      className="max-h-64 mx-auto rounded-xl shadow-lg object-contain"
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-7xl text-gray-400">📷</div>
                    <div className="space-y-3">
                      <p className="text-xl text-gray-700 font-semibold">Click to upload completion photo</p>
                      <p className="text-base text-gray-500">JPG, PNG or HEIC format</p>
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
                <div className="text-center py-4">
                  <p className="text-blue-600 font-medium text-lg">Uploading photo...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="px-6 pb-6">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <div className="flex justify-center mb-3">
                  <MdAccessTime className="text-5xl text-blue-500" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900">Important Reminder</h4>
                <p className="text-gray-600 text-base leading-relaxed max-w-md mx-auto">
                  {cleanHistory && cleanHistory.end_time 
                    ? `Please remember to collect the duvet at ${formatEndTime(cleanHistory.end_time)} to complete the service.`
                    : 'Please remember to collect the duvet at the scheduled end time to complete the service.'
                  }
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-5 space-y-4 border border-blue-100">
                <h5 className="font-semibold text-blue-900 text-base flex items-center justify-center gap-2">
                  <MdSchedule className="text-lg" />
                  Collection Time
                </h5>
                {cleanHistory && cleanHistory.end_time ? (
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-900 mb-2">
                        {formatEndTime(cleanHistory.end_time)}
                      </div>
                      <p className="text-sm text-blue-700">Drying End Time</p>
                    </div>
                    <div className="space-y-2 text-sm text-blue-700">
                      <div className="flex items-center justify-center space-x-2">
                        <MdFiberManualRecord className="text-blue-500 text-xs" />
                        <p>Please collect the duvet on time</p>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <MdFiberManualRecord className="text-blue-500 text-xs" />
                        <p>Set personal reminder to avoid delays</p>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <MdFiberManualRecord className="text-blue-500 text-xs" />
                        <p>Return the duvet to owner promptly</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm text-blue-700">
                    <div className="flex items-center justify-center space-x-2">
                      <MdFiberManualRecord className="text-blue-500 text-xs" />
                      <p>Check the drying schedule for exact end time</p>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <MdFiberManualRecord className="text-blue-500 text-xs" />
                      <p>Set a personal reminder to avoid delays</p>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <MdFiberManualRecord className="text-blue-500 text-xs" />
                      <p>Return the duvet to its owner promptly</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-blue-800 text-sm font-medium flex items-center justify-center gap-2">
                  <MdLightbulb className="text-blue-600" />
                  Tip: The duvet owner is waiting for your timely service completion!
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50">
          {currentStep === 1 && (
            <>
              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={onCompleteOrder}
                disabled={!selectedPhoto || isUploadingPhoto}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-all duration-200"
              >
                Complete & Continue
              </button>
            </>
          )}

          {currentStep === 2 && (
            <button
              onClick={() => {
                if (onFinalComplete) {
                  onFinalComplete()
                } else {
                  onClose()
                }
              }}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 w-full"
            >
              Complete Order
            </button>
          )}
        </div>
      </div>
    </div>
  )
}