import React from 'react'
import Image from 'next/image'
import { Duvet } from '@/lib/database'

interface OrderRequestModalProps {
  isOpen: boolean
  onClose: () => void
  duvet: Duvet | null
  currentStep: 1 | 2 | 3
  selectedPhoto: File | null
  photoPreview: string | null
  isUploadingPhoto: boolean
  onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onCreateOrder: () => void
  onNextStep?: () => void
  onPrevStep?: () => void
  optimalTimeText?: string
}

export default function OrderRequestModal({
  isOpen,
  onClose,
  duvet,
  currentStep,
  selectedPhoto,
  photoPreview,
  isUploadingPhoto,
  onPhotoUpload,
  onCreateOrder,
  onNextStep,
  onPrevStep,
  optimalTimeText
}: OrderRequestModalProps) {
  if (!isOpen || !duvet) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 w-full mx-4 shadow-lg max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-lg font-medium text-black">
            Hire Drying Helper - {duvet.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-normal"
          >
            ×
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                    currentStep >= step
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-px mx-2 transition-all duration-200 ${
                      currentStep > step ? 'bg-gray-900' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          {currentStep === 1 && (
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h4 className="text-lg font-medium text-gray-900">Service Details</h4>
                <p className="text-gray-600 text-sm">
                Prepare your duvet for professional drying assistance
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="space-y-2 text-left">
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">Check Duvet Condition</h5>
                      <p className="text-xs text-gray-600">
                      Ensure duvet is clean and ready for drying
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">Package for Pickup</h5>
                      <p className="text-xs text-gray-600">
                      Prepare duvet in clean bag for transportation
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center space-y-6">
              {isUploadingPhoto ? (
                <div className="py-12 space-y-6">
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-8 h-8 bg-blue-500 rounded-full animate-spin"></div>
                      </div>
                      <div className="absolute inset-0 w-16 h-16 border-2 border-blue-300 rounded-full animate-ping opacity-20"></div>
                    </div>
                    
                    <div className="text-center space-y-2">
                      <h4 className="text-lg font-medium text-gray-900">Creating Your Request</h4>
                      <p className="text-gray-600 text-sm">
                        Please wait while we process your order...
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-gray-900">Take a Photo</h4>
                    <p className="text-gray-600">
                    Please take a photo of the position of the prepared blanket for the convenience of the staff to locate.
                    </p>
                  </div>

                  <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-500 transition-colors cursor-pointer group">
                    {photoPreview ? (
                      <div className="relative">
                        <Image 
                          src={photoPreview} 
                          alt="Duvet placement preview" 
                          width={300}
                          height={200}
                          className="max-h-48 mx-auto rounded-xl shadow-md object-contain"
                        />
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <div className="text-white text-sm font-medium bg-black/60 px-3 py-1 rounded-lg">
                            Click to change photo
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-6xl text-gray-400">📷</div>
                        <div>
                          <p className="text-xl text-gray-600 font-medium">Click to upload a photo</p>
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
                </>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <div className="text-6xl text-green-400 mb-4">✅</div>
                <h4 className="text-xl font-semibold text-gray-900">Order Created Successfully!</h4>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h5 className="font-medium text-gray-900">What happens next?</h5>
                <div className="space-y-2 text-sm text-gray-600 text-left">
                  <p>• You will receive a notification when someone accepts your request</p>
                  <p>• The helper will arrive to assist with your sun drying</p>
                  <p>• You can track the status in your Orders page</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6">
          {currentStep === 1 && (
            <>
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={onNextStep}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
              >
                Continue
              </button>
            </>
          )}

          {currentStep === 2 && (
            <>
              <button
                onClick={onPrevStep}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Back
              </button>
              <button
                onClick={onCreateOrder}
                disabled={!selectedPhoto || isUploadingPhoto}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors text-sm"
              >
                Create Request
              </button>
            </>
          )}

          {currentStep === 3 && (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors w-full text-sm"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}