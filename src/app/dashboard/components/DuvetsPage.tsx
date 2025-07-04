'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { type Duvet, updateDuvetStatus } from '@/lib/database'
import { useDuvets } from '@/hooks/dashboard/useDuvets'
import { useWeather } from '@/hooks/dashboard/useWeather'
import { useAddresses } from '@/hooks/dashboard/useAddresses'
import { useOrders } from '@/hooks/dashboard/useOrders'
import { uploadDuvetImage } from '@/lib/storage'
import DuvetList from '@/components/dashboard/DuvetList'
import NewDuvetModal from '@/components/dashboard/modals/NewDuvetModal'
import OrderRequestModal from '@/components/dashboard/modals/OrderRequestModal'
import TimeRangePicker from '@/components/dashboard/shared/TimeRangePicker'

interface DuvetsPageProps {
  userId: string
}

export default function DuvetsPage({ userId }: DuvetsPageProps) {
  const router = useRouter()
  const [selectedDuvet, setSelectedDuvet] = useState<Duvet | null>(null)
  const [showAddressPrompt, setShowAddressPrompt] = useState(false)

  // Order request modal state
  const [showOrderRequestModal, setShowOrderRequestModal] = useState(false)
  const [orderRequestStep, setOrderRequestStep] = useState<1 | 2 | 3>(1)
  const [orderPhoto, setOrderPhoto] = useState<File | null>(null)
  const [orderPhotoPreview, setOrderPhotoPreview] = useState<string | null>(null)
  const [isUploadingOrderPhoto, setIsUploadingOrderPhoto] = useState(false)

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
    sunDryingAnalysis,
    isLoadingSunDryingAnalysis,
    showSunDryModal,
    sunDryStep,
    isManualMode,
    manualTimeWindow,
    analyzeWeatherForDrying,
    closeSunDryModal,
    closeSunDryModalUIOnly,
    setShowSunDryModal,
    setSunDryStep,
    handleStartAIAnalysis,
    handleConfirmSunDrying,
    handleManualTimeSelection
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
  const handleDryItMyself = async () => {
    if (!selectedDuvet) return

    // Check if weather conditions are optimal
    if (!weatherAnalysis?.isOptimalForSunDrying) {
      // If conditions are not optimal, close the modal
      closeSunDryModal()
      return
    }

    // Start AI analysis which will move to step 2 to show results
    await handleStartAIAnalysis(selectedDuvet.mite_score || 50)
  }

  // Handle "Have someone else dry it" option
  const handleRequestHelp = async () => {
    if (!selectedDuvet) return

    const defaultAddress = getDefaultAddress()
    if (!defaultAddress) {
      alert('Please set a default address first')
      return
    }

    // Check if time window is available (either from weather analysis or manual selection)
    const effectiveWindow = isManualMode && manualTimeWindow 
      ? manualTimeWindow 
      : weatherAnalysis?.optimalWindows?.[0]
    
    if (!effectiveWindow) {
      alert(isManualMode ? 'Please select a time window first' : 'Weather analysis is not available. Please try again or contact support.')
      return
    }

    // Close sun dry modal UI only (preserve weather data for order creation)
    closeSunDryModalUIOnly()
    setShowOrderRequestModal(true)
    setOrderRequestStep(1)
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

  // Order request modal handlers
  const handleOrderPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setOrderPhoto(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setOrderPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateOrderRequest = async () => {
    if (!selectedDuvet || !orderPhoto) return

    const defaultAddress = getDefaultAddress()
    if (!defaultAddress) {
      alert('Please set a default address first')
      return
    }

    try {
      setIsUploadingOrderPhoto(true)

      // Upload photo
      const uploadResult = await uploadDuvetImage(orderPhoto, userId, 'order-placement')
      if (!uploadResult) {
        throw new Error('Failed to upload photo')
      }

      // Get effective time window (weather analysis or manual selection)
      const effectiveWindow = isManualMode && manualTimeWindow 
        ? manualTimeWindow 
        : weatherAnalysis?.optimalWindows?.[0]
      
      if (!effectiveWindow) {
        throw new Error(isManualMode ? 'Manual time window is no longer available. Please try again.' : 'Weather analysis is no longer available. Please try again.')
      }

      // Calculate actual drying duration from the effective window
      const startTime = new Date(effectiveWindow.startTime)
      const endTime = new Date(effectiveWindow.endTime)
      const durationInHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)

      // Import and run AI analysis
      const { calculateBasicSunDryingReduction } = await import('@/lib/sun-drying-ai')
      const aiAnalysis = calculateBasicSunDryingReduction(
        selectedDuvet.mite_score || 50,
        effectiveWindow,
        durationInHours
      )

      console.log('Help-drying AI analysis:', aiAnalysis)

      // Calculate deadline (30 minutes before optimal start time)
      const deadline = new Date(startTime.getTime() - 30 * 60 * 1000).toISOString()

      console.log('Order creation debug:')
      console.log('- Is manual mode:', isManualMode)
      console.log('- Effective window:', effectiveWindow)
      console.log('- AI Analysis:', aiAnalysis)
      console.log('- Calculated deadline:', deadline)

      // Create order with effective time window and AI analysis information
      const success = await handleCreateOrder(
        selectedDuvet.id,
        defaultAddress.id,
        uploadResult.url,
        deadline,
        effectiveWindow.startTime,
        effectiveWindow.endTime,
        aiAnalysis
      )

      if (success) {
        // Update duvet status to waiting for pickup
        await updateDuvetStatus(selectedDuvet.id, 'waiting_pickup')

        // Refresh the duvets list to show updated status
        await loadDuvets()

        setOrderRequestStep(3)
        // Clear weather data after successful order creation
        setTimeout(() => {
          closeSunDryModal()
        }, 2000) // Give user time to see success message
      } else {
        throw new Error('Failed to create order')
      }
    } catch (error) {
      console.error('Error creating order request:', error)
      alert('Failed to create service request. Please try again.')
    } finally {
      setIsUploadingOrderPhoto(false)
    }
  }

  const handleCloseOrderRequestModal = () => {
    setShowOrderRequestModal(false)
    setOrderRequestStep(1)
    setOrderPhoto(null)
    setOrderPhotoPreview(null)
    setSelectedDuvet(null)
    // Clear weather data when completely done with the process
    closeSunDryModal()
  }

  const handleOrderNextStep = () => {
    if (orderRequestStep < 3) {
      setOrderRequestStep((prev) => (prev + 1) as 1 | 2 | 3)
    }
  }

  const handleOrderPrevStep = () => {
    if (orderRequestStep > 1) {
      setOrderRequestStep((prev) => (prev - 1) as 1 | 2 | 3)
    }
  }




  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
          Welcome to MiteSnap
        </h1>
        <p className="text-lg text-gray-600 font-light leading-relaxed">
          Manage your duvets and track mite risk levels
        </p>
      </div>

      {/* Divider */}
      <div className="border-b border-gray-200 mb-12"></div>

      {/* Latest Duvets Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Latest Duvets</h2>
        <p className="text-base text-gray-600 font-light leading-relaxed mb-8">Monitor and manage your duvets for optimal health</p>
      </div>

      <DuvetList
        duvets={duvets}
        isLoading={isLoadingDuvets}
        onSunDryingService={handleSunDryingService}
        duvetSunDryingStatus={duvetSunDryingStatus}
        onAddNewDuvet={handleOpenNewDuvetModal}
        addresses={addresses}
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
                                console.log('weatherAnalysis', weatherAnalysis.optimalWindows)
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
                              disabled={isLoadingSunDryingAnalysis}
                              className="px-12 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-2xl font-medium transition-all duration-200 text-lg flex items-center justify-center"
                            >
                              {isLoadingSunDryingAnalysis ? (
                                <>
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                  Analyzing...
                                </>
                              ) : (
                                'Dry it myself'
                              )}
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
                  ) : isManualMode ? (
                    <div className="py-8 space-y-6">
                      <div className="text-center space-y-4">
                        <div className="text-4xl text-gray-300 mb-4">⏰</div>
                        <h4 className="text-xl font-light text-gray-700">
                          Weather Analysis Unavailable
                        </h4>
                        <p className="text-gray-500 font-light">
                          Select your preferred drying time manually
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-6">
                        <TimeRangePicker
                          onTimeRangeChange={handleManualTimeSelection}
                        />
                      </div>

                      {manualTimeWindow && (
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                          <div className="flex items-start space-x-3">
                            <div className="text-amber-600 text-lg">⚠️</div>
                            <div className="flex-1">
                              <h5 className="font-medium text-amber-800 mb-1">Manual Time Selection</h5>
                              <p className="text-sm text-amber-700">
                                Weather conditions will not be considered. Ensure good drying conditions during your selected time.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col space-y-4">
                        <button
                          onClick={handleDryItMyself}
                          disabled={!manualTimeWindow || isLoadingSunDryingAnalysis}
                          className="px-12 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-2xl font-medium transition-all duration-200 text-lg flex items-center justify-center"
                        >
                          {isLoadingSunDryingAnalysis ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Analyzing...
                            </>
                          ) : (
                            'Dry it myself'
                          )}
                        </button>
                        <button
                          onClick={handleRequestHelp}
                          disabled={!manualTimeWindow}
                          className="px-12 py-4 bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white rounded-2xl font-medium transition-all duration-200 text-lg"
                        >
                          Have someone else dry it
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <p className="text-gray-500">Unable to analyze weather conditions</p>
                    </div>
                  )}
                </div>
              )}

              {sunDryStep === 2 && sunDryingAnalysis && selectedDuvet && (
                <div className="py-8 space-y-4">
                  <div className="text-center space-y-4">
                    <h4 className="text-2xl font-semibold text-black">AI Analysis Results</h4>
                    <p className="text-gray-600">
                      Based on {isManualMode ? 'selected time window' : 'weather conditions'} and current mite score
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                    <div className="space-y-3">
                      <h5 className="font-semibold text-gray-900">Predicted Mite Index Change</h5>
                      <div className="flex items-center justify-center space-x-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-800">
                            {selectedDuvet.mite_score || 50}
                          </div>
                          <div className="text-sm text-gray-500">Current</div>
                        </div>
                        <div className="text-gray-500 text-2xl">→</div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600">
                            {sunDryingAnalysis.finalMiteScore}
                          </div>
                          <div className="text-sm text-gray-500">Predicted</div>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          -{sunDryingAnalysis.miteScoreReduction} points reduction
                        </span>
                      </div>
                    </div>

                    {sunDryingAnalysis.analysisReasons && sunDryingAnalysis.analysisReasons.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-semibold text-gray-900">Analysis Summary</h5>
                        <ul className="space-y-2">
                          {sunDryingAnalysis.analysisReasons.map((reason, index) => (
                            <li key={index} className="text-gray-700 flex items-start">
                              <span className="text-blue-500 mr-2 font-medium">•</span>
                              <span className="flex-1">{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setSunDryStep(1)}
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
                      className="px-8 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                    >
                      Start Sun Drying
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Order Request Modal */}
      <OrderRequestModal
        isOpen={showOrderRequestModal}
        onClose={handleCloseOrderRequestModal}
        duvet={selectedDuvet}
        currentStep={orderRequestStep}
        selectedPhoto={orderPhoto}
        photoPreview={orderPhotoPreview}
        isUploadingPhoto={isUploadingOrderPhoto}
        onPhotoUpload={handleOrderPhotoUpload}
        onCreateOrder={handleCreateOrderRequest}
        onNextStep={handleOrderNextStep}
        onPrevStep={handleOrderPrevStep}
        optimalTimeText={
          (() => {
            const effectiveWindow = isManualMode && manualTimeWindow 
              ? manualTimeWindow 
              : weatherAnalysis?.optimalWindows?.[0]
            
            if (!effectiveWindow) return undefined
            
            const startTime = new Date(effectiveWindow.startTime).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })
            const endTime = new Date(effectiveWindow.endTime).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })
            return `${startTime} - ${endTime}${isManualMode ? ' (Manual)' : ''}`
          })()
        }
      />
    </div>
  )
}