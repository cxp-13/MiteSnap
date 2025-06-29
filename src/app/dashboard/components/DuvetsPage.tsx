'use client'

import { useState } from 'react'
import { type Duvet } from '@/lib/database'
import { useDuvets } from '@/hooks/dashboard/useDuvets'
import { useWeather } from '@/hooks/dashboard/useWeather'
import { useAddresses } from '@/hooks/dashboard/useAddresses'
import { useOrders } from '@/hooks/dashboard/useOrders'
import DuvetList from '@/components/dashboard/DuvetList'
import NewDuvetModal from '@/components/dashboard/modals/NewDuvetModal'
import CircularProgress from '@/components/dashboard/shared/CircularProgress'

interface DuvetsPageProps {
  userId: string
}

export default function DuvetsPage({ userId }: DuvetsPageProps) {
  const [selectedDuvet, setSelectedDuvet] = useState<Duvet | null>(null)
  
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
    location,
    weatherAnalysis,
    isLoadingWeatherAnalysis,
    sunDryingAnalysis,
    isLoadingSunDryingAnalysis,
    showSunDryModal,
    sunDryStep,
    sunDryPhoto,
    sunDryPhotoPreview,
    isUploadingSunDryPhoto,
    analyzeWeatherForDrying,
    handleSunDryPhotoUpload,
    handleSubmitSunDrying,
    closeSunDryModal,
    setShowSunDryModal,
    setSunDryStep
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

  // Handle proceeding to step 2 (photo upload)
  const handleProceedToStep2 = async () => {
    if (!selectedDuvet || !location) return

    // Create order for sun drying service
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
        setSunDryStep(2)
      }
    } catch (error) {
      console.error('Error creating sun drying order:', error)
      alert('Failed to create service request. Please try again.')
    }
  }

  // Handle submitting sun drying with photo
  const handleSunDrySubmit = async () => {
    if (!selectedDuvet) return
    await handleSubmitSunDrying(selectedDuvet.id, userId)
  }

  return (
    <div className="bg-white">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">My Duvets</h2>
        <button
          onClick={() => setShowNewDuvetModal(true)}
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
        />
      )}

      {/* Sun-Drying Modal */}
      {showSunDryModal && selectedDuvet && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-12 w-full mx-6 shadow-2xl max-w-xl">
            <div className="flex justify-between items-start mb-12">
              <h3 className="text-2xl font-light text-black tracking-tight">
                Sun Dry - {selectedDuvet.name}
              </h3>
              <button
                onClick={closeSunDryModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-thin ml-6 mt-1"
              >
                ×
              </button>
            </div>

            {/* Step 1: Best Drying Time Display */}
            {sunDryStep === 1 && (
              <div className="space-y-12">
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
                            BEST DRYING TIME (NEXT 12 HOURS)
                          </h4>
                          <div className="text-7xl font-extralight text-black tracking-tight leading-none">
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
                              
                              return new Date(optimalWindow.startTime).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })
                            })()}
                          </div>
                          <p className="text-gray-400 font-light text-lg tracking-wide">
                            Optimal conditions detected
                          </p>
                        </div>
                        
                        <button
                          onClick={handleProceedToStep2}
                          className="px-12 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-medium transition-all duration-200 text-lg"
                        >
                          Request Help Drying
                        </button>
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
                        
                        <button
                          onClick={handleProceedToStep2}
                          className="px-12 py-4 bg-gray-400 hover:bg-gray-500 text-white rounded-2xl font-medium transition-all duration-200 text-lg"
                        >
                          Request Help Anyway
                        </button>
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

            {/* Step 2: Photo Upload */}
            {sunDryStep === 2 && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h4 className="text-2xl font-light text-slate-800">
                    Upload Drying Photo
                  </h4>
                  <p className="text-slate-600 font-light max-w-md mx-auto leading-relaxed">
                    Take a photo of your duvet being sun-dried. AI will analyze the drying effectiveness.
                  </p>
                </div>

                <div className="relative">
                  {sunDryPhotoPreview ? (
                    <label htmlFor="sunDryPhotoInput" className="block cursor-pointer group">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 bg-gray-50 transition-all duration-200 relative overflow-hidden">
                        <div className="text-center space-y-4 relative">
                          <img
                            src={sunDryPhotoPreview}
                            alt="Sun-drying preview"
                            className="max-w-full h-48 object-contain mx-auto rounded-lg transition-all duration-200 group-hover:brightness-75"
                          />
                          
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-white text-center space-y-2">
                              <div className="text-3xl">✏️</div>
                              <p className="font-medium">Change Photo</p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-500 font-light">Click to change photo</p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSunDryPhotoUpload}
                        className="hidden"
                        id="sunDryPhotoInput"
                      />
                    </label>
                  ) : (
                    <label htmlFor="sunDryPhotoInput" className="block cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 bg-gray-50 hover:bg-gray-100 transition-all duration-200">
                        <div className="text-center space-y-6">
                          <div className="text-6xl text-gray-400">📸</div>
                          <div className="space-y-3">
                            <p className="text-xl font-light text-gray-700">Upload Drying Photo</p>
                            <p className="text-sm text-gray-500 font-light">Click anywhere here to select photo • JPG, PNG formats</p>
                          </div>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSunDryPhotoUpload}
                        className="hidden"
                        id="sunDryPhotoInput"
                      />
                    </label>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setSunDryStep(1)}
                    className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all duration-200 font-light"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSunDrySubmit}
                    disabled={!sunDryPhoto || isUploadingSunDryPhoto}
                    className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white rounded-2xl font-medium transition-all duration-200"
                  >
                    {isUploadingSunDryPhoto ? 'Uploading...' : 'Start Analysis'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: AI Analysis Results */}
            {sunDryStep === 3 && (
              <div className="space-y-8">
                {isLoadingSunDryingAnalysis ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-8"></div>
                    <p className="text-gray-500 font-light text-lg">Analyzing drying effectiveness...</p>
                  </div>
                ) : sunDryingAnalysis ? (
                  <div className="text-center space-y-8">
                    <div className="space-y-6">
                      <h4 className="text-2xl font-light text-slate-800">Analysis Complete</h4>
                      
                      <div className="relative w-32 h-32 mx-auto">
                        <CircularProgress 
                          progress={sunDryingAnalysis.effectiveness * 100}
                          size={128}
                          strokeWidth={8}
                          className="text-green-500"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-900">
                            {Math.round(sunDryingAnalysis.effectiveness * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <p className="text-lg text-gray-700">Drying Effectiveness</p>
                        <div className="space-y-2">
                          {sunDryingAnalysis.factors.map((factor, index) => (
                            <p key={index} className="text-sm text-gray-600">• {factor}</p>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={closeSunDryModal}
                      className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-medium transition-all duration-200"
                    >
                      Complete
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-gray-500">Analysis failed. Please try again.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}