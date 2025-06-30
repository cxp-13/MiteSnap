'use client'

import { useState } from 'react'
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
    analyzeWeatherForDrying,
    closeSunDryModal,
    setShowSunDryModal
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
    closeSunDryModal()
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
    // This would ideally trigger a callback to switch to addresses tab
    // For now, we'll show a more user-friendly message
    console.log('Navigate to addresses tab')
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
          showAddressPrompt={showAddressPrompt}
          onCloseAddressPrompt={handleCloseAddressPrompt}
        />
      )}

      {/* Sun-Drying Modal */}
      {showSunDryModal && selectedDuvet && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
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

            {/* Simplified Single Step Display */}
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
                          OPTIMAL DRYING TIME (NEXT 12 HOURS)
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
                          className="px-12 py-4 bg-gray-400 hover:bg-gray-500 text-white rounded-2xl font-medium transition-all duration-200 text-lg"
                        >
                          Have someone else dry it
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
          </div>
        </div>
      )}
    </div>
  )
}