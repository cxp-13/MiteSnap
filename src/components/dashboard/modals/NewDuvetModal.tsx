import React from 'react'
import Image from 'next/image'
import { AnalysisResult } from '@/hooks/dashboard/useDuvets'
import { Address } from '@/lib/database'

interface NewDuvetModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPhoto: File | null
  photoPreview: string | null
  duvetName: string
  currentAnalysisStep: number
  stepCompleted: boolean[]
  analysisResult: AnalysisResult | null
  selectedMaterial: string
  cleaningHistory: 'new' | 'long_time' | 'recent'
  duvetThickness: string
  selectedAddressId: string | null
  addresses: Address[]
  currentStep: 1 | 2 | 3 | 4
  onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onStartAnalysis: () => void
  onCreateDuvet: (data: { name: string; material: string; cleaningHistory: 'new' | 'long_time' | 'recent'; thickness: string; address_id: string | null }) => void
  onDuvetNameChange: (name: string) => void
  onMaterialChange: (material: string) => void
  onCleaningHistoryChange: (history: 'new' | 'long_time' | 'recent') => void
  onThicknessChange: (thickness: string) => void
  onAddressChange: (addressId: string | null) => void
  onStepChange: (step: 1 | 2 | 3 | 4) => void
  onAddNewAddress: () => void
}

export default function NewDuvetModal({
  isOpen,
  onClose,
  selectedPhoto,
  photoPreview,
  duvetName,
  currentAnalysisStep,
  stepCompleted,
  analysisResult,
  selectedMaterial,
  cleaningHistory,
  duvetThickness,
  selectedAddressId,
  addresses,
  currentStep,
  onPhotoUpload,
  onStartAnalysis,
  onCreateDuvet,
  onDuvetNameChange,
  onMaterialChange,
  onCleaningHistoryChange,
  onThicknessChange,
  onAddressChange,
  onStepChange,
  onAddNewAddress
}: NewDuvetModalProps) {
  if (!isOpen) return null

  const handleCreateDuvet = () => {
    onCreateDuvet({
      name: duvetName,
      material: selectedMaterial,
      cleaningHistory,
      thickness: duvetThickness,
      address_id: selectedAddressId
    })
  }

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`bg-gray-50 rounded-2xl p-10 w-full mx-4 shadow-2xl ${currentStep === 4 ? 'max-w-7xl' : 'max-w-4xl'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-black">Add New Duvet</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-black text-2xl"
          >
            ×
          </button>
        </div>

        {/* Step 1: Photo Upload */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <h4 className="text-2xl font-semibold text-black mb-4">Step 1: Upload Photo</h4>
              <p className="text-gray-600 text-lg">Take a clear photo of your duvet</p>
            </div>
            
            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-black transition-colors cursor-pointer">
              {photoPreview ? (
                <div className="space-y-4">
                  <Image 
                    src={photoPreview} 
                    alt="Duvet preview" 
                    width={200}
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
              />
            </div>

            <div className="flex justify-center">
              <button
                onClick={onStartAnalysis}
                disabled={!selectedPhoto}
                className="px-8 py-3 bg-black text-white rounded-xl font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
              >
                Start AI Analysis
              </button>
            </div>
          </div>
        )}

        {/* Step 2: AI Analysis Progress */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="text-center">
              <h4 className="text-2xl font-semibold text-black mb-4">Step 2: AI Analysis</h4>
              <p className="text-gray-600 text-lg">Our AI is analyzing your duvet...</p>
            </div>

            <div className="space-y-6">
              {/* Progress Steps */}
              <div className="flex justify-center space-x-8">
                {['Uploading Image', 'AI Analysis', 'Results Ready'].map((step, index) => (
                  <div key={index} className="flex flex-col items-center space-y-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                      stepCompleted[index] 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : currentAnalysisStep === index 
                        ? 'border-blue-500 text-blue-500' 
                        : 'border-gray-300 text-gray-300'
                    }`}>
                      {stepCompleted[index] ? '✓' : index + 1}
                    </div>
                    <p className={`text-sm font-medium ${
                      stepCompleted[index] ? 'text-green-600' : 
                      currentAnalysisStep === index ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>

              {/* Loading Animation */}
              {currentAnalysisStep < 3 && (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Analysis Results & Details */}
        {currentStep === 3 && analysisResult && (
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-xl font-semibold text-black mb-2">Step 3: AI Analysis - Review & Confirm</h4>
              <p className="text-gray-600">Review AI results and confirm details below</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
              {/* AI Analysis Report */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🤖</span>
                  <h5 className="text-base font-semibold text-gray-900">AI Analysis Report</h5>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm border h-fit">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-800 mb-1">Detected Material</p>
                      <p className="text-base font-medium text-black">{analysisResult.material}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-semibold text-gray-800 mb-1">Dust Mite Risk Assessment</p>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                analysisResult.miteScore > 70 ? 'bg-red-500' :
                                analysisResult.miteScore > 40 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${analysisResult.miteScore}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-black">{analysisResult.miteScore}/100</span>
                        </div>
                        <p className={`text-xs font-semibold ${
                          analysisResult.miteScore > 70 ? 'text-red-600' :
                          analysisResult.miteScore > 40 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {analysisResult.miteScore > 70 ? 'High Risk' :
                           analysisResult.miteScore > 40 ? 'Medium Risk' : 'Low Risk'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-800 mb-1">Analysis Factors</p>
                      <ul className="space-y-1 max-h-24 overflow-y-auto">
                        {analysisResult.reasons.map((reason, index) => (
                          <li key={index} className="text-xs text-gray-700 flex items-start">
                            <span className="text-blue-500 mr-1 font-medium">•</span>
                            <span className="flex-1">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review & Confirm Details */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📝</span>
                  <h5 className="text-base font-semibold text-gray-900">Review & Confirm Details</h5>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm border h-fit">
                  <div className="space-y-3">
                    {/* Duvet Name */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-800 mb-1">Duvet Name</label>
                      <input
                        type="text"
                        value={duvetName}
                        onChange={(e) => onDuvetNameChange(e.target.value)}
                        placeholder="e.g., Master Bedroom Duvet"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium placeholder:text-gray-400"
                      />
                    </div>

                    {/* Material */}
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <label className="block text-xs font-semibold text-gray-800">Material</label>
                        <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-medium">🤖 AI detected</span>
                      </div>
                      <select
                        value={selectedMaterial}
                        onChange={(e) => onMaterialChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                      >
                        <option value="Cotton">Cotton</option>
                        <option value="Polyester">Polyester</option>
                        <option value="Down">Down</option>
                        <option value="Soybean Fiber">Soybean Fiber</option>
                        <option value="Bamboo Fiber">Bamboo Fiber</option>
                        <option value="Silk">Silk</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                      <p className="text-xs text-gray-600 mt-1 font-medium">AI detected result, modify if needed</p>
                    </div>

                    {/* Thickness */}
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <label className="block text-xs font-semibold text-gray-800">Thickness</label>
                        <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded font-medium">🤖 AI predicted</span>
                      </div>
                      <select
                        value={duvetThickness}
                        onChange={(e) => onThicknessChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                      >
                        <option value="Thin">Thin</option>
                        <option value="Medium">Medium</option>
                        <option value="Thick">Thick</option>
                        <option value="Extra Thick">Extra Thick</option>
                      </select>
                      <p className="text-xs text-gray-600 mt-1 font-medium">AI prediction, adjust if necessary</p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 pt-3">
                      <p className="text-xs text-gray-600 mb-3 text-center font-medium">Additional Information</p>
                    </div>

                    {/* Cleaning History */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-800 mb-1">When was this duvet last cleaned?</label>
                      <div className="grid grid-cols-1 gap-1">
                        {[
                          { value: 'new', label: 'Brand new / Never used' },
                          { value: 'recent', label: 'Recently cleaned (within 2 weeks)' },
                          { value: 'long_time', label: 'Long time ago (over 2 weeks)' }
                        ].map((option) => (
                          <label key={option.value} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name="cleaningHistory"
                              value={option.value}
                              checked={cleaningHistory === option.value}
                              onChange={(e) => onCleaningHistoryChange(e.target.value as 'new' | 'long_time' | 'recent')}
                              className="text-blue-500 focus:ring-blue-500"
                            />
                            <span className="text-gray-900 font-medium text-xs">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Address Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-800 mb-1">
                        Address <span className="text-red-500">*</span>
                      </label>
                      {addresses.length === 0 ? (
                        <div className="space-y-2">
                          <div className="p-3 border border-orange-200 rounded-lg bg-orange-50">
                            <div className="flex items-start space-x-2">
                              <span className="text-orange-500 text-sm">⚠️</span>
                              <div>
                                <p className="text-orange-800 text-xs font-semibold">No addresses found</p>
                                <p className="text-orange-700 text-xs mt-0.5">You need to add an address before creating a duvet</p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={onAddNewAddress}
                            className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 text-sm"
                          >
                            <span>➕</span>
                            <span>Add New Address</span>
                          </button>
                        </div>
                      ) : (
                        <select
                          value={selectedAddressId || ''}
                          onChange={(e) => onAddressChange(e.target.value || null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium text-sm"
                          required
                        >
                          <option value="">Select an address</option>
                          {addresses.map((address) => (
                            <option key={address.id} value={address.id}>
                              {address.is_default && '🏠 '}
                              {address.address_line || 
                               `${address.house_number || ''} ${address.road || ''}, ${address.city || ''}`.trim()}
                              {address.is_default && ' (Default)'}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => onStepChange(1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreateDuvet}
                disabled={!duvetName.trim() || !selectedAddressId}
                className="px-8 py-3 bg-black text-white rounded-xl font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
              >
                Create Duvet
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {currentStep === 4 && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="text-6xl text-green-500">✅</div>
              <h4 className="text-2xl font-semibold text-black">Duvet Added Successfully!</h4>
              <p className="text-gray-600 text-lg">Your duvet has been added to your collection</p>
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Continue
            </button>
          </div>
        )}
        </div>
    </div>
  )
}