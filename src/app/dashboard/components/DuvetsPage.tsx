'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { type Duvet, updateDuvetStatus, type Address } from '@/lib/database'
import { useDuvets } from '@/hooks/dashboard/useDuvets'
import { useWeather } from '@/hooks/dashboard/useWeather'
import { useAddresses } from '@/hooks/dashboard/useAddresses'
import { useOrders } from '@/hooks/dashboard/useOrders'
import { getCleanHistoryRecord, type CleanHistoryRecord } from '@/lib/clean-history'
import type { OrderWithDuvet } from '@/lib/database'
import { useUnifiedUser } from '@/hooks/useUnifiedUser'
import { uploadDuvetImage } from '@/lib/storage'
import { getCostBreakdown, type CostBreakdown } from '@/lib/pricing'
import DuvetList from '@/components/dashboard/DuvetList'
import NewDuvetModal from '@/components/dashboard/modals/NewDuvetModal'
import OrderRequestModal from '@/components/dashboard/modals/OrderRequestModal'
import TimeRangePicker from '@/components/dashboard/shared/TimeRangePicker'

interface DuvetsPageProps {
  userId: string
}

export default function DuvetsPage({ userId }: DuvetsPageProps) {
  const router = useRouter()
  const { user } = useUnifiedUser()
  const [selectedDuvet, setSelectedDuvet] = useState<Duvet | null>(null)
  const [showAddressPrompt, setShowAddressPrompt] = useState(false)
  const [analysisMessageIndex, setAnalysisMessageIndex] = useState(0)

  // Order request modal state
  const [showOrderRequestModal, setShowOrderRequestModal] = useState(false)
  const [orderRequestStep, setOrderRequestStep] = useState<1 | 2 | 3 | 4>(1)
  const [orderPhoto, setOrderPhoto] = useState<File | null>(null)
  const [orderPhotoPreview, setOrderPhotoPreview] = useState<string | null>(null)
  const [isUploadingOrderPhoto, setIsUploadingOrderPhoto] = useState(false)
  
  // AI Analysis state for order request
  const [isAnalyzingOrder, setIsAnalyzingOrder] = useState(false)
  const [orderAiAnalysis, setOrderAiAnalysis] = useState<{
    beforeMiteScore: number
    afterMiteScore: number
    reductionPoints: number
  } | null>(null)

  // Cost calculation state
  const [orderCostBreakdown, setOrderCostBreakdown] = useState<CostBreakdown | null>(null)
  const [orderSelectedAddress, setOrderSelectedAddress] = useState<Address | null>(null)

  // Custom hooks
  const duvetsHook = useDuvets(userId)
  const weatherHook = useWeather()
  const addressesHook = useAddresses(userId)
  const ordersHook = useOrders(userId)

  // State for help-drying orders and clean history data
  const [helpDryingData, setHelpDryingData] = useState<Record<string, { order: OrderWithDuvet; cleanHistory: CleanHistoryRecord | null }>>({})

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
  const { orders, handleCreateOrder, handleDeleteOrder } = ordersHook

  // Analysis messages for the animation
  const analysisMessages = [
    'Analyzing recent weather data...',
    'Evaluating air humidity conditions...',
    'Calculating optimal drying effectiveness...',
    'Generating personalized recommendations...'
  ]

  // Cycle through analysis messages during animation
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (sunDryStep === 2 && !sunDryingAnalysis) {
      interval = setInterval(() => {
        setAnalysisMessageIndex((prev) => (prev + 1) % analysisMessages.length)
      }, 800) // Change message every 800ms
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [sunDryStep, sunDryingAnalysis, analysisMessages.length])

  // Load help-drying data for duvets that have help_drying status
  useEffect(() => {
    const loadHelpDryingData = async () => {
      if (!duvets || !orders) return

      const helpDryingDuvets = duvets.filter(duvet => duvet.status === 'help_drying')
      if (helpDryingDuvets.length === 0) {
        setHelpDryingData({})
        return
      }

      try {
        const helpDryingMap: Record<string, { order: OrderWithDuvet; cleanHistory: CleanHistoryRecord | null }> = {}

        for (const duvet of helpDryingDuvets) {
          // Find the order for this duvet
          const order = orders.find(o => o.quilt_id === duvet.id)
          if (order) {
            let cleanHistory = null
            if (order.clean_history_id) {
              cleanHistory = await getCleanHistoryRecord(order.clean_history_id)
            }
            helpDryingMap[duvet.id] = { order, cleanHistory }
          }
        }

        setHelpDryingData(helpDryingMap)
      } catch (error) {
        console.error('Error loading help-drying data:', error)
      }
    }

    loadHelpDryingData()
  }, [duvets, orders])



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

    // Show the AI analysis animation (step 2)
    setSunDryStep(2)
    setAnalysisMessageIndex(0) // Reset message index

    // Wait for 3.2 seconds (4 messages × 800ms) for the animation to complete
    setTimeout(async () => {
      // Start actual AI analysis which will show results on the same step
      await handleStartAIAnalysis(selectedDuvet.mite_score || 50)
    }, 3200)
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

    // Calculate cost breakdown if we have all the required data
    let costBreakdown: CostBreakdown | null = null
    console.log('Cost calculation check:', {
      duvetWeight: selectedDuvet.weight,
      addressFloor: defaultAddress.floor_number,
      addressElevator: defaultAddress.has_elevator,
      duvetId: selectedDuvet.id,
      addressId: defaultAddress.id
    })

    if (selectedDuvet.weight && defaultAddress.floor_number !== null && defaultAddress.has_elevator !== null) {
      try {
        costBreakdown = getCostBreakdown(
          selectedDuvet.weight,
          defaultAddress.floor_number || 1,
          defaultAddress.has_elevator || false
        )
        console.log('✅ Cost breakdown calculated successfully:', costBreakdown)
      } catch (error) {
        console.error('❌ Error calculating cost breakdown:', error)
      }
    } else {
      console.warn('⚠️ Missing data for cost calculation:', {
        hasWeight: !!selectedDuvet.weight,
        hasFloor: defaultAddress.floor_number !== null,
        hasElevator: defaultAddress.has_elevator !== null,
        weight: selectedDuvet.weight,
        floor: defaultAddress.floor_number,
        elevator: defaultAddress.has_elevator
      })
      
      // Create a fallback cost breakdown with default values for demonstration
      if (!selectedDuvet.weight) {
        console.warn('⚠️ Duvet missing weight, using default Medium weight')
      }
      if (defaultAddress.floor_number === null) {
        console.warn('⚠️ Address missing floor number, using default floor 1')
      }
      if (defaultAddress.has_elevator === null) {
        console.warn('⚠️ Address missing elevator info, assuming no elevator')
      }

      try {
        costBreakdown = getCostBreakdown(
          selectedDuvet.weight || 'Medium',
          defaultAddress.floor_number || 1,
          defaultAddress.has_elevator || false
        )
        console.log('✅ Fallback cost breakdown calculated:', costBreakdown)
      } catch (error) {
        console.error('❌ Error calculating fallback cost breakdown:', error)
      }
    }

    // Set cost breakdown and address for the modal
    setOrderCostBreakdown(costBreakdown)
    setOrderSelectedAddress(defaultAddress)

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
    if (!selectedDuvet || !orderPhoto || !orderAiAnalysis) return

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

      // Effective window is valid, proceed with order creation

      // Use pre-calculated AI analysis from orderAiAnalysis state
      const aiAnalysis = {
        finalMiteScore: orderAiAnalysis.afterMiteScore
      }

      console.log('DEBUG: DuvetsPage - orderAiAnalysis state:', orderAiAnalysis)
      console.log('DEBUG: DuvetsPage - formatted aiAnalysis for createOrder:', aiAnalysis)
      console.log('DEBUG: DuvetsPage - finalMiteScore value:', aiAnalysis.finalMiteScore)
      console.log('DEBUG: DuvetsPage - finalMiteScore type:', typeof aiAnalysis.finalMiteScore)

      console.log('Order creation debug:')
      console.log('- Is manual mode:', isManualMode)
      console.log('- Effective window:', effectiveWindow)
      console.log('- AI Analysis:', aiAnalysis)

      // Create order with effective time window and AI analysis information
      const success = await handleCreateOrder(
        selectedDuvet.id,
        defaultAddress.id,
        uploadResult.url,
        effectiveWindow.startTime,
        effectiveWindow.endTime,
        aiAnalysis
      )

      if (success) {
        // Update duvet status to waiting for pickup
        await updateDuvetStatus(selectedDuvet.id, 'waiting_pickup')

        // Refresh the duvets list to show updated status
        await loadDuvets()

        setOrderRequestStep(4) // Move to success step (now step 4)
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
    setOrderAiAnalysis(null)
    setIsAnalyzingOrder(false)
    setOrderCostBreakdown(null)
    setOrderSelectedAddress(null)
    // Clear weather data when completely done with the process
    closeSunDryModal()
  }

  const handleOrderNextStep = async () => {
    if (orderRequestStep === 2) {
      // Moving from step 2 to step 3: start AI analysis
      await handleAnalyzeOrder()
    } else if (orderRequestStep < 4) {
      setOrderRequestStep((prev) => (prev + 1) as 1 | 2 | 3 | 4)
    }
  }

  const handleOrderPrevStep = () => {
    if (orderRequestStep > 1) {
      setOrderRequestStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)
    }
  }

  const handleAnalyzeOrder = async () => {
    if (!selectedDuvet || !orderPhoto) return

    try {
      setIsAnalyzingOrder(true)
      setOrderRequestStep(3) // Move to analysis step
      
      // First upload the photo to get a URL for AI analysis
      const uploadResult = await uploadDuvetImage(orderPhoto, userId, 'ai-analysis')
      if (!uploadResult) {
        throw new Error('Failed to upload photo for AI analysis')
      }

      // Get effective time window (weather analysis or manual selection)
      const effectiveWindow = isManualMode && manualTimeWindow 
        ? manualTimeWindow 
        : weatherAnalysis?.optimalWindows?.[0]
      
      if (!effectiveWindow) {
        console.error('No effective time window available')
        alert('No optimal drying time available for today')
        setOrderRequestStep(2) // Go back to photo step
        return
      }

      const startTime = new Date(effectiveWindow.startTime)
      const endTime = new Date(effectiveWindow.endTime)
      const durationInHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)

      // Import and run REAL AI analysis
      const { analyzeSunDryingEffectiveness } = await import('@/lib/sun-drying-ai')
      const aiAnalysis = await analyzeSunDryingEffectiveness(
        uploadResult.url,
        selectedDuvet.mite_score || 50,
        effectiveWindow,
        durationInHours
      )

      if (!aiAnalysis) {
        throw new Error('AI analysis failed')
      }

      // Set AI analysis result
      setOrderAiAnalysis({
        beforeMiteScore: selectedDuvet.mite_score || 50,
        afterMiteScore: aiAnalysis.finalMiteScore,
        reductionPoints: aiAnalysis.miteScoreReduction
      })

      console.log('Order AI analysis completed:', aiAnalysis)
    } catch (error) {
      console.error('Error analyzing order:', error)
      alert('Failed to analyze duvet. Please try again.')
      setOrderRequestStep(2) // Go back to photo step
    } finally {
      setIsAnalyzingOrder(false)
    }
  }

  // Handle canceling help-drying order
  const handleCancelHelpDryingOrder = async (duvet: Duvet) => {
    const helpData = helpDryingData[duvet.id]
    if (!helpData?.order) return

    try {
      const success = await handleDeleteOrder(helpData.order.id)
      if (success) {
        // Refresh duvets to update status
        await loadDuvets()
        // This will trigger the useEffect to reload help-drying data
      }
    } catch (error) {
      console.error('Error canceling help-drying order:', error)
      alert('Failed to cancel service request. Please try again.')
    }
  }




  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
          Welcome{user?.name ? ` ${user.name}` : ''}
        </h1>
        <p className="text-lg text-gray-600 font-light leading-relaxed">
          Manage your duvets and track mite risk levels
        </p>
      </div>

      {/* Divider */}
      <div className="border-b border-gray-200 mb-8"></div>

      {/* Latest Duvets Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Latest Duvets</h2>
          <button
            onClick={handleOpenNewDuvetModal}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Duvet</span>
          </button>
        </div>
        <p className="text-base text-gray-600 font-light leading-relaxed mb-8">Monitor and manage your duvets for optimal health</p>
      </div>

      <DuvetList
        duvets={duvets}
        isLoading={isLoadingDuvets}
        onSunDryingService={handleSunDryingService}
        duvetSunDryingStatus={duvetSunDryingStatus}
        addresses={addresses}
        helpDryingData={helpDryingData}
        onCancelHelpDryingOrder={handleCancelHelpDryingOrder}
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 w-full mx-4 shadow-lg max-w-md">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-medium text-black">
                AI Blanket Drying - {selectedDuvet.name}
              </h3>
              <button
                onClick={closeSunDryModal}
                className="text-gray-400 hover:text-gray-600 text-xl font-normal"
              >
                ×
              </button>
            </div>

            {/* Multi-Step Display */}
            <div className="space-y-6">
              {sunDryStep === 1 && (
                <div>
                  {isLoadingWeatherAnalysis ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mb-4"></div>
                      <p className="text-gray-500 font-normal text-sm">Analyzing conditions...</p>
                    </div>
                  ) : weatherAnalysis ? (
                    <div className="space-y-6">
                      {weatherAnalysis.isOptimalForSunDrying && weatherAnalysis.optimalWindows.length > 0 ? (
                        <div className="text-center py-8 space-y-6">
                          {/* Best Drying Time */}
                          <div className="space-y-4">
                            <h4 className="text-gray-500 font-medium text-sm uppercase tracking-wider">
                              OPTIMAL DRYING TIME (NEXT 12 HOURS)
                            </h4>
                            <div className="text-4xl font-light text-black tracking-tight leading-none">
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
                            <p className="text-gray-500 font-normal text-sm">
                              Optimal conditions detected
                            </p>
                          </div>

                          {/* Two Option Buttons */}
                          <div className="flex flex-col space-y-3">
                            <button
                              onClick={handleDryItMyself}
                              disabled={isLoadingSunDryingAnalysis}
                              className="px-8 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 text-base flex items-center justify-center"
                            >
                              {isLoadingSunDryingAnalysis ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Analyzing...
                                </>
                              ) : (
                                'Dry it myself'
                              )}
                            </button>
                            <button
                              onClick={handleRequestHelp}
                              className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-all duration-200 text-base border border-gray-300"
                            >
                              Hire Helper
                            </button>

                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 space-y-6">
                          <div className="text-4xl text-gray-300 mb-4">☁️</div>
                          <div className="space-y-3">
                            <h4 className="text-lg font-medium text-gray-700">
                              Not Optimal for Sun Drying
                            </h4>
                            <p className="text-gray-500 font-normal text-sm">
                              {weatherAnalysis.reason}
                            </p>
                          </div>

                          {/* Single Button */}
                          <div className="flex justify-center">
                            <button
                              onClick={handleDryItMyself}
                              className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-all duration-200 text-base"
                            >
                              I got it
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : isManualMode ? (
                    <div className="py-6 space-y-4">
                      <div className="text-center space-y-3">
                        <div className="text-3xl text-gray-300 mb-3">⏰</div>
                        <h4 className="text-lg font-medium text-gray-700">
                          Weather Analysis Unavailable
                        </h4>
                        <p className="text-gray-500 font-normal text-sm">
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

                      <div className="flex flex-col space-y-3">
                        <button
                          onClick={handleDryItMyself}
                          disabled={!manualTimeWindow || isLoadingSunDryingAnalysis}
                          className="px-8 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 text-base flex items-center justify-center"
                        >
                          {isLoadingSunDryingAnalysis ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Analyzing...
                            </>
                          ) : (
                            'Dry it myself'
                          )}
                        </button>
                        <button
                          onClick={handleRequestHelp}
                          disabled={!manualTimeWindow}
                          className="px-8 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-900 rounded-lg font-medium transition-all duration-200 text-base border border-gray-300"
                        >
                          Hire Helper
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">Unable to analyze weather conditions</p>
                    </div>
                  )}
                </div>
              )}

              {sunDryStep === 2 && !sunDryingAnalysis && (
                <div className="py-12 space-y-6">
                  <div className="flex flex-col items-center justify-center space-y-6">
                    {/* AI Analysis Animation */}
                    <div className="relative">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-8 h-8 bg-gray-400 rounded-full animate-spin"></div>
                      </div>
                      <div className="absolute inset-0 w-16 h-16 border-2 border-gray-300 rounded-full animate-ping opacity-20"></div>
                    </div>
                    
                    {/* Cycling Analysis Messages */}
                    <div className="text-center space-y-2">
                      <h4 className="text-lg font-medium text-black">AI Analysis in Progress</h4>
                      <p className="text-gray-600 text-sm">
                        <span className="transition-opacity duration-300">
                          {analysisMessages[analysisMessageIndex]}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {sunDryStep === 2 && sunDryingAnalysis && selectedDuvet && (
                <div className="py-6 space-y-4">
                  <div className="text-center space-y-3">
                    <h4 className="text-lg font-medium text-black">AI Analysis Results</h4>
                    <p className="text-gray-600 text-sm">
                      Based on {isManualMode ? 'selected time window' : 'weather conditions'} and current mite score
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-900 text-sm">Predicted Mite Index Change</h5>
                      <div className="flex items-center justify-center space-x-4">
                        <div className="text-center">
                          <div className="text-2xl font-medium text-gray-800">
                            {selectedDuvet.mite_score || 50}
                          </div>
                          <div className="text-xs text-gray-500">Current</div>
                        </div>
                        <div className="text-gray-500 text-lg">→</div>
                        <div className="text-center">
                          <div className="text-2xl font-medium text-gray-800">
                            {sunDryingAnalysis.finalMiteScore}
                          </div>
                          <div className="text-xs text-gray-500">Predicted</div>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          -{sunDryingAnalysis.miteScoreReduction} points reduction
                        </span>
                      </div>
                    </div>

                  </div>

                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => setSunDryStep(1)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
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
                      className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
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
        aiAnalysis={orderAiAnalysis}
        isAnalyzing={isAnalyzingOrder}
        address={orderSelectedAddress}
        costBreakdown={orderCostBreakdown}
        // optimalTimeText={
        //   (() => {
        //     const effectiveWindow = isManualMode && manualTimeWindow 
        //       ? manualTimeWindow 
        //       : weatherAnalysis?.optimalWindows?.[0]
            
        //     if (!effectiveWindow) return undefined
            
        //     const startTime = new Date(effectiveWindow.startTime).toLocaleTimeString('en-US', {
        //       hour: 'numeric',
        //       minute: '2-digit',
        //       hour12: true
        //     })
        //     const endTime = new Date(effectiveWindow.endTime).toLocaleTimeString('en-US', {
        //       hour: 'numeric',
        //       minute: '2-digit',
        //       hour12: true
        //     })
        //     return `${startTime} - ${endTime}${isManualMode ? ' (Manual)' : ''}`
        //   })()
        // }
      />
    </div>
  )
}