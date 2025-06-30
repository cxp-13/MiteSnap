'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { type Duvet } from '@/lib/database'
import { useDuvets } from '@/hooks/dashboard/useDuvets'
import { useWeather } from '@/hooks/dashboard/useWeather'
import { useAddresses } from '@/hooks/dashboard/useAddresses'
import { useOrders } from '@/hooks/dashboard/useOrders'
import DuvetList from '@/components/dashboard/DuvetList'
import NewDuvetModal from '@/components/dashboard/modals/NewDuvetModal'

interface DuvetsPageProps {
  userId: string
}

export default function DuvetsPage({ userId }: DuvetsPageProps) {
  const router = useRouter()
  const [selectedDuvet, setSelectedDuvet] = useState<Duvet | null>(null)
  const [showAddressPrompt, setShowAddressPrompt] = useState(false)
  
  // Custom hooks
  const duvetsHook = useDuvets(userId)
  const weatherHook = useWeather()
  const addressesHook = useAddresses(userId)
  const ordersHook = useOrders(userId)

  const {
    duvets,
    isLoadingDuvets,
    duvetSunDryingStatus,
    showNewDuvetModal,
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
    currentStep,
    loadDuvets,
    refreshSunDryingStatus,
    handlePhotoUpload,
    handleStartAnalysis,
    handleCreateDuvet,
    handleCloseModal,
    setShowNewDuvetModal,
    setDuvetName,
    setSelectedMaterial,
    setCleaningHistory,
    setDuvetThickness,
    setSelectedAddressId,
    setCurrentStep
  } = duvetsHook

  const {
    weatherAnalysis,
    isLoadingWeatherAnalysis,
    showSunDryModal,
    sunDryStep,
    sunDryPhoto,
    sunDryPhotoPreview,
    sunDryingAnalysis,
    isUploadingSunDryPhoto,
    analyzeWeatherForDrying,
    closeSunDryModal,
    setShowSunDryModal,
    setSunDryStep,
    handleSunDryPhotoUpload,
    handleSubmitSunDrying,
    handleConfirmSunDrying
  } = weatherHook

  const { addresses, getDefaultAddress } = addressesHook
  const { handleCreateOrder } = ordersHook


  // Handle sun drying service request
  const handleSunDryingService = async (duvet: Duvet) => {
    setSelectedDuvet(duvet)
    
    // Get location and analyze weather
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          weatherHook.setLocation({ latitude, longitude })
          await analyzeWeatherForDrying(latitude, longitude)
          setShowSunDryModal(true)
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Please enable location access to use sun-drying service')
        }
      )
    }
  }


  // Handle "Dry it myself" option
  const handleDryItMyself = () => {
    setSunDryStep(2) // Move to photo upload step
  }

  // Handle "Have someone else dry it" option
  const handleRequestHelp = async () => {
    if (!selectedDuvet) return

    const defaultAddress = getDefaultAddress()
    if (!defaultAddress) {
      alert('Please set a default address first')
      return
    }

    try {
      const success = await handleCreateOrder(
        selectedDuvet.id,
        defaultAddress.id,
        'sun_drying'
      )
      
      if (success) {
        closeSunDryModal()
        alert('Sun drying service request created successfully!')
      }
    } catch (error) {
      console.error('Error creating sun drying order:', error)
      alert('Failed to create service request. Please try again.')
    }
  }

  // Handle opening new duvet modal with address check
  const handleOpenNewDuvetModal = () => {
    if (addresses.length === 0) {
      setShowAddressPrompt(true)
    } else {
      setShowNewDuvetModal(true)
    }
  }

  // Handle adding new address from duvet modal
  const handleAddNewAddress = () => {
    setShowAddressPrompt(false)
    handleCloseModal()
    router.push('/dashboard/addresses')
  }

  // Handle closing address prompt
  const handleCloseAddressPrompt = () => {
    setShowAddressPrompt(false)
  }

  return (
    <div className="bg-white">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">My Duvets</h2>
        <button
          onClick={handleOpenNewDuvetModal}
          className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors font-semibold"
        >
          + Add New Duvet
        </button>
      </div>

      <DuvetList
        duvets={duvets}
        isLoading={isLoadingDuvets}
        onSunDryingService={handleSunDryingService}
        duvetSunDryingStatus={duvetSunDryingStatus}
      />

      {/* Address Prompt Modal */}
      {showAddressPrompt && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl p-8 w-full mx-4 shadow-2xl max-w-md">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">📍</span>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">Add Address First</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  You need at least one address to create a duvet. This helps us provide location-based services like sun-drying recommendations.
                </p>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleAddNewAddress}
                  className="w-full px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>📍</span>
                  <span>Add My Address</span>
                </button>
                
                <button
                  onClick={handleCloseAddressPrompt}
                  className="w-full px-6 py-2 text-gray-500 hover:text-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Duvet Modal */}
      {showNewDuvetModal && (
        <NewDuvetModal
          isOpen={showNewDuvetModal}
          onClose={handleCloseModal}
          selectedPhoto={selectedPhoto}
          photoPreview={photoPreview}
          duvetName={duvetName}
          currentAnalysisStep={currentAnalysisStep}
          stepCompleted={stepCompleted}
          analysisResult={analysisResult}
          selectedMaterial={selectedMaterial}
          cleaningHistory={cleaningHistory}
          duvetThickness={duvetThickness}
          selectedAddressId={selectedAddressId}
          addresses={addresses}
          currentStep={currentStep}
          onPhotoUpload={handlePhotoUpload}
          onStartAnalysis={handleStartAnalysis}
          onCreateDuvet={handleCreateDuvet}
          onDuvetNameChange={setDuvetName}
          onMaterialChange={setSelectedMaterial}
          onCleaningHistoryChange={setCleaningHistory}
          onThicknessChange={setDuvetThickness}
          onAddressChange={setSelectedAddressId}
          onStepChange={setCurrentStep}
          onAddNewAddress={handleAddNewAddress}
        />
      )}

      {/* Sun-Drying Modal */}
      {showSunDryModal && selectedDuvet && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-12 w-full mx-6 shadow-2xl max-w-xl">
            <div className="flex justify-between items-start mb-12">
              <h3 className="text-2xl font-light text-black tracking-tight">
                AI Blanket Drying - {selectedDuvet.name}
              </h3>
              <button
                onClick={closeSunDryModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-thin ml-6 mt-1"
              >
                ×
              </button>
            </div>

            {/* Multi-Step Display */}
            <div className="space-y-12">
              {sunDryStep === 1 && (
                <div>
                  {isLoadingWeatherAnalysis ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-8"></div>
                  <p className="text-gray-500 font-light text-lg">Analyzing conditions...</p>
                </div>
              ) : weatherAnalysis ? (
                <div className="space-y-12">
                  {weatherAnalysis.isOptimalForSunDrying && weatherAnalysis.optimalWindows.length > 0 ? (
                    <div className="text-center py-16 space-y-8">
                      {/* Best Drying Time */}
                      <div className="space-y-6">
                        <h4 className="text-gray-500 font-light text-base uppercase tracking-[0.2em] mb-8">
                          OPTIMAL DRYING TIME (NEXT 12 HOURS)
                        </h4>
                        <div className="text-5xl font-extralight text-black tracking-tight leading-none">
                          {(() => {
                            const now = new Date()
                            const currentTime = now.getTime()
                            let optimalWindow = weatherAnalysis.optimalWindows[0]
                            
                            const futureWindow = weatherAnalysis.optimalWindows.find(window => {
                              const windowStartTime = new Date(window.startTime).getTime()
                              return windowStartTime > currentTime
                            })
                            
                            if (futureWindow) {
                              optimalWindow = futureWindow
                            }
                            
                            const startTime = new Date(optimalWindow.startTime).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })
                            const endTime = new Date(optimalWindow.endTime).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })
                            
                            return `${startTime} - ${endTime}`
                          })()}
                        </div>
                        <p className="text-gray-400 font-light text-lg tracking-wide">
                          Optimal conditions detected
                        </p>
                      </div>
                      
                      {/* Two Option Buttons */}
                      <div className="flex flex-col space-y-4">
                        <button
                          onClick={handleDryItMyself}
                          className="px-12 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-medium transition-all duration-200 text-lg"
                        >
                          Dry it myself
                        </button>
                        <button
                          onClick={handleRequestHelp}
                          className="px-12 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-medium transition-all duration-200 text-lg"
                        >
                          Have someone else dry it
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 space-y-8">
                      <div className="text-6xl text-gray-300 mb-8">☁️</div>
                      <div className="space-y-4">
                        <h4 className="text-xl font-light text-gray-700">
                          Not Optimal for Sun Drying
                        </h4>
                        <p className="text-gray-500 font-light">
                          {weatherAnalysis.reason}
                        </p>
                      </div>
                      
                      {/* Single Button */}
                      <div className="flex justify-center">
                        <button
                          onClick={handleDryItMyself}
                          className="px-12 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-medium transition-all duration-200 text-lg"
                        >
                          I got it
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                  ) : (
                    <div className="text-center py-16">
                      <p className="text-gray-500">Unable to analyze weather conditions</p>
                    </div>
                  )}
                </div>
              )}

              {sunDryStep === 2 && (
                <div className="text-center py-16 space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-2xl font-semibold text-black">Upload Photo</h4>
                    <p className="text-gray-600">Please take a photo of your duvet placed for sun drying</p>
                  </div>
                  
                  <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-black transition-colors cursor-pointer">
                    {sunDryPhotoPreview ? (
                      <div className="space-y-4">
                        <Image 
                          src={sunDryPhotoPreview} 
                          alt="Sun drying preview" 
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
                      onChange={handleSunDryPhotoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setSunDryStep(1)}
                      className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => selectedDuvet && handleSubmitSunDrying(selectedDuvet.id, selectedDuvet.user_id, selectedDuvet.mite_score || 50)}
                      disabled={!sunDryPhoto || isUploadingSunDryPhoto}
                      className="px-8 py-3 bg-blue-500 text-white rounded-xl font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                    >
                      {isUploadingSunDryPhoto ? 'Uploading...' : 'Submit'}
                    </button>
                  </div>
                </div>
              )}

              {sunDryStep === 3 && (
                <div className="py-8 space-y-4">
                  <div className="text-center space-y-4">
                    <h4 className="text-2xl font-semibold text-black">AI Analysis Results</h4>
                    <p className="text-gray-600">Review the analysis and confirm to start sun drying</p>
                  </div>

                  {sunDryingAnalysis ? (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                      <div className="space-y-3">
                        <h5 className="font-semibold text-gray-900">Mite Index Change</h5>
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-bold text-gray-800">
                            {selectedDuvet?.mite_score || 50}
                          </span>
                          <span className="text-gray-500">→</span>
                          <span className="text-2xl font-bold text-green-600">
                            {sunDryingAnalysis.finalMiteScore}
                          </span>
                        </div>
                      </div>

                      {sunDryingAnalysis.analysisReasons && sunDryingAnalysis.analysisReasons.length > 0 && (
                        <div className="space-y-3">
                          <h5 className="font-semibold text-gray-900">Analysis Results</h5>
                          <ul className="space-y-2">
                            {sunDryingAnalysis.analysisReasons.map((rec, index) => (
                              <li key={index} className="text-gray-700 flex items-start">
                                <span className="text-blue-500 mr-2 font-medium">•</span>
                                <span className="flex-1">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No analysis results available</p>
                    </div>
                  )}

                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setSunDryStep(2)}
                      className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={async () => {
                        if (selectedDuvet) {
                          const success = await handleConfirmSunDrying(
                            selectedDuvet.id, 
                            selectedDuvet.user_id, 
                            selectedDuvet.mite_score || 50
                          )
                          if (success) {
                            // Refresh the duvets list and sun-drying status
                            await loadDuvets()
                            await refreshSunDryingStatus([selectedDuvet.id])
                          }
                        }
                      }}
                      disabled={!sunDryingAnalysis}
                      className="px-8 py-3 bg-green-500 text-white rounded-xl font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-green-600 transition-colors"
                    >
                      Confirm & Start Sun Drying
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}