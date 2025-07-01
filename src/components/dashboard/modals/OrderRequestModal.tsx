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
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 w-full mx-6 shadow-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-8">
          <h3 className="text-2xl font-light text-black tracking-tight">
            Request Sun Drying Help - {duvet.name}
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
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-20 h-0.5 ${
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
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-gray-900">Before We Dry Your Duvet – Please Confirm These Details</h4>
                <p className="text-gray-600">
                Follow these steps to prepare your duvet for pick-up and sun drying assistance:
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 space-y-4">
                <div className="space-y-4 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900"> Check the Duvet Condition</h5>
                      <p className="text-sm text-gray-600">
                      Make sure the duvet is clean and ready for sun drying (we do not offer washing service).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">Packaging for Pick-up</h5>
                      <p className="text-sm text-gray-600">
                      Fold the duvet neatly and place it in a clean bag or container for safe transportation.
                      </p>
                    </div>
                  </div>

               
                </div>
              </div>

              {optimalTimeText && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">☀️</span>
                    <p className="text-green-800 font-medium">
                      Optimal drying time: {optimalTimeText}
                    </p>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    A helper will need to be available before this time to assist you.
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-gray-900">Take a Photo</h4>
                <p className="text-gray-600">
                Please take a photo of the position of the prepared blanket for the convenience of the staff to locate.
                </p>
              </div>

              <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                {photoPreview ? (
                  <div className="space-y-4">
                    <Image 
                      src={photoPreview} 
                      alt="Duvet placement preview" 
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

              {isUploadingPhoto && (
                <p className="text-blue-600">Uploading photo...</p>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <div className="text-6xl text-green-400 mb-4">✅</div>
                <h4 className="text-xl font-semibold text-gray-900">Order Created Successfully!</h4>
                <p className="text-gray-600">
                  Your sun drying assistance request has been created. A helper will be notified and can accept your request.
                </p>
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
                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
              >
                I&apos;ve Placed the Duvet
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
                onClick={onCreateOrder}
                disabled={!selectedPhoto || isUploadingPhoto}
                className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-green-600 transition-colors"
              >
                Create Request
              </button>
            </>
          )}

          {currentStep === 3 && (
            <button
              onClick={onClose}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors w-full"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}