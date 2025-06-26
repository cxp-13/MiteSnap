'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import { uploadDuvetImage } from '@/lib/storage'
import { analyzeDuvet } from '@/lib/ai-analysis'
import { createDuvet, getUserDuvets, type Duvet } from '@/lib/database'
import { useUnifiedUser } from '@/hooks/useUnifiedUser'
import { useMockUser } from '@/context/MockUserContext'

export default function Dashboard() {
  const { user, isLoaded, isSignedIn } = useUnifiedUser()
  const { isMockMode, signOut } = useMockUser()
  const [activeTab, setActiveTab] = useState<'duvets' | 'orders'>('duvets')
  const [showNewDuvetModal, setShowNewDuvetModal] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [weather, setWeather] = useState<{ temperature: number; humidity: number } | null>(null)
  const [isLoadingWeather, setIsLoadingWeather] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [duvetName, setDuvetName] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStep, setAnalysisStep] = useState('')
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState(0)
  const [stepCompleted, setStepCompleted] = useState<boolean[]>([false, false, false])
  const [analysisResult, setAnalysisResult] = useState<{material: string, miteScore: number, reasons: string[], imageUrl: string} | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<string>('')
  const [cleaningHistory, setCleaningHistory] = useState<'new' | 'long_time' | 'recent'>('new')
  const [isEditingMaterial, setIsEditingMaterial] = useState(false)
  const [isEditingThickness, setIsEditingThickness] = useState(false)
  const [duvetThickness, setDuvetThickness] = useState('Medium')
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)

  const [duvets, setDuvets] = useState<Duvet[]>([])
  const [isLoadingDuvets, setIsLoadingDuvets] = useState(false)

  // Load user's duvets from database
  const loadDuvets = useCallback(async () => {
    if (!user?.id) return
    
    setIsLoadingDuvets(true)
    try {
      const userDuvets = await getUserDuvets(user.id)
      setDuvets(userDuvets)
    } catch (error) {
      console.error('Error loading duvets:', error)
    } finally {
      setIsLoadingDuvets(false)
    }
  }, [user?.id])

  // Load duvets when user is available
  useEffect(() => {
    if (user?.id) {
      loadDuvets()
    }
  }, [user?.id, loadDuvets])

  const getMiteRiskLevel = (score: number) => {
    if (score < 30) return 'Low Risk'
    if (score < 60) return 'Moderate'
    return 'High'
  }

  const getRiskColor = (score: number) => {
    if (score < 30) return { bg: 'from-emerald-400 to-emerald-600', text: 'text-emerald-600', border: 'border-emerald-200' }
    if (score < 60) return { bg: 'from-amber-400 to-amber-600', text: 'text-amber-600', border: 'border-amber-200' }
    return { bg: 'from-red-400 to-red-600', text: 'text-red-600', border: 'border-red-200' }
  }

  const CircularProgress = ({ score }: { score: number }) => {
    const colors = getRiskColor(score)
    const circumference = 2 * Math.PI * 45
    const strokeDasharray = `${(score / 100) * circumference} ${circumference}`
    
    // Get stroke color based on score
    const getStrokeColor = (score: number) => {
      if (score < 30) return 'rgb(52, 211, 153)' // emerald-400
      if (score < 60) return 'rgb(251, 191, 36)' // amber-400
      return 'rgb(248, 113, 113)' // red-400
    }
    
    return (
      <div className="relative w-32 h-32 mx-auto">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="rgb(229, 231, 235)"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={getStrokeColor(score)}
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-4xl font-bold ${colors.text}`}>{score}</div>
            <div className="text-sm text-gray-600 font-medium">Risk Score</div>
          </div>
        </div>
      </div>
    )
  }

  const getRiskIcon = (score: number) => {
    const risk = getMiteRiskLevel(score)
    switch (risk) {
      case 'Low Risk': return '●'
      case 'Moderate': return '●●'
      case 'High': return '●●●'
      default: return '●'
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedPhoto(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCloseModal = () => {
    setSelectedPhoto(null)
    setPhotoPreview(null)
    setDuvetName('')
    setSelectedMaterial('')
    setCleaningHistory('new')
    setIsEditingMaterial(false)
    setIsEditingThickness(false)
    setDuvetThickness('Medium')
    setCurrentStep(1)
    setLocation(null)
    setWeather(null)
    setIsAnalyzing(false)
    setAnalysisStep('')
    setCurrentAnalysisStep(0)
    setStepCompleted([false, false, false])
    setAnalysisResult(null)
    setShowNewDuvetModal(false)
  }

  const getWeatherData = async (latitude: number, longitude: number) => {
    setIsLoadingWeather(true)
    try {
      const response = await fetch(`https://api.tomorrow.io/v4/weather/realtime?location=${latitude}%2C${longitude}&apikey=${process.env.NEXT_PUBLIC_TOMORROW_API_KEY}`, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setWeather({
          temperature: data.data.values.temperature,
          humidity: data.data.values.humidity
        })
      } else {
        console.error('Weather API request failed:', response.statusText)
        // Set default weather data if API fails
        setWeather({ temperature: 22, humidity: 50 })
      }
    } catch (error) {
      console.error('Error fetching weather data:', error)
      // Set default weather data if request fails
      setWeather({ temperature: 22, humidity: 50 })
    } finally {
      setIsLoadingWeather(false)
    }
  }

  const getCurrentLocation = () => {
    setIsLoadingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setLocation({ latitude, longitude })
          setIsLoadingLocation(false)
          
          // Get weather data for this location
          await getWeatherData(latitude, longitude)
          
          // Optional: Reverse geocoding to get address
          fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`)
            .then(response => response.json())
            .then(data => {
              if (data.results && data.results[0]) {
                setLocation(prev => ({ ...prev!, address: data.results[0].formatted }))
              }
            })
            .catch(() => {
              // Fallback if geocoding fails
              setLocation(prev => ({ ...prev!, address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }))
            })
        },
        (error) => {
          console.error('Error getting location:', error)
          setIsLoadingLocation(false)
          // Set default location and weather data instead of showing alert
          setLocation({ latitude: 40.7128, longitude: -74.0060, address: 'Default Location' })
          setWeather({ temperature: 22, humidity: 50 })
        }
      )
    } else {
      setIsLoadingLocation(false)
      // Set default location and weather data for unsupported browsers
      setLocation({ latitude: 40.7128, longitude: -74.0060, address: 'Default Location' })
      setWeather({ temperature: 22, humidity: 50 })
    }
  }

  const handleSubmitNewDuvet = async () => {
    if (!selectedPhoto) {
      alert('Please upload a photo of your duvet.')
      return
    }
    if (!location) {
      alert('Please get your location.')
      return
    }
    if (!user?.id) {
      alert('Please log in to upload a duvet.')
      return
    }
    
    try {
      // Step 1: Upload photo
      setIsUploadingPhoto(true)
      const uploadResult = await uploadDuvetImage(selectedPhoto, user.id)
      
      if (!uploadResult) {
        alert('Failed to upload photo. Please try again.')
        return
      }
      setIsUploadingPhoto(false)
      
      // Step 2: Start enhanced AI Analysis
      setIsAnalyzing(true)
      setCurrentAnalysisStep(0)
      setStepCompleted([false, false, false])
      
      // Step 2.1: Analyze material and thickness
      setAnalysisStep('Analyzing duvet material and thickness...')
      await new Promise(resolve => setTimeout(resolve, 5500))
      setStepCompleted([true, false, false])
      setCurrentAnalysisStep(1)
      
      // Step 2.2: Combine with weather data
      setAnalysisStep('Combining with environmental data...')
      await new Promise(resolve => setTimeout(resolve, 4500))
      setStepCompleted([true, true, false])
      setCurrentAnalysisStep(2)
      
      // Step 2.3: Generate mite analysis
      setAnalysisStep('Generating mite risk assessment...')
      const analysisResult = await analyzeDuvet(
        uploadResult.url, 
        weather?.temperature || 22, 
        weather?.humidity || 50
      )
      await new Promise(resolve => setTimeout(resolve, 3500))
      setStepCompleted([true, true, true])
      
      if (!analysisResult) {
        alert('Failed to analyze duvet. Please try again.')
        return
      }
      
      // Set analysis result and go to step 3
      setAnalysisResult({
        ...analysisResult,
        imageUrl: uploadResult.url
      })
      setSelectedMaterial(analysisResult.material)
      setIsEditingMaterial(false)
      setIsAnalyzing(false)
      setCurrentStep(4)
      
    } catch (error) {
      console.error('Error creating duvet:', error)
      alert('Failed to add duvet. Please try again.')
      setIsAnalyzing(false)
      setAnalysisStep('')
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleConfirmAnalysis = async () => {
    if (!analysisResult || !user?.id || !analysisResult.imageUrl) return

    try {
      // Calculate last_clean based on cleaning history
      let lastCleanDate: Date | null = null
      const now = new Date()
      
      switch (cleaningHistory) {
        case 'new':
          lastCleanDate = now // Just bought, set to current time
          break
        case 'recent':
          lastCleanDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
          break
        case 'long_time':
          lastCleanDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 1 month ago
          break
      }

      // Create duvet record with calculated last_clean
      const duvetRecord = await createDuvet(
        duvetName.trim(),
        selectedMaterial || analysisResult.material,
        analysisResult.miteScore,
        analysisResult.imageUrl,
        user.id,
        lastCleanDate?.toISOString() || null
      )
      
      if (!duvetRecord) {
        alert('Failed to save duvet. Please try again.')
        return
      }
      
      // Reset form and close modal
      handleCloseModal()
      alert('Duvet added successfully!')
      
      // Refresh duvet list
      await loadDuvets()
      
    } catch (error) {
      console.error('Error saving duvet:', error)
      alert('Failed to save duvet. Please try again.')
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-4">Please sign in to access the dashboard</div>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <Image 
              src="/logo.png" 
              alt="Acarid Bloom Logo" 
              width={32} 
              height={32}
            />
            <h1 className="text-xl font-semibold">Acarid Bloom</h1>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('duvets')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'duvets'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-900 hover:text-white'
              }`}
            >
              My Duvets
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'orders'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-900 hover:text-white'
              }`}
            >
              View Nearby Orders
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image 
                src="/logo.png" 
                alt="Acarid Bloom Logo" 
                width={24} 
                height={24}
              />
              <span className="text-lg font-semibold text-black">Acarid Bloom</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name || 'User'}
              </span>
              {isMockMode ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {user?.name?.[0] || 'D'}
                  </div>
                  <button
                    onClick={signOut}
                    className="text-xs text-gray-600 hover:text-gray-800"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <UserButton />
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'duvets' && (
              <div className="bg-white">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-black">My Duvets</h2>
                  <button 
                    onClick={() => setShowNewDuvetModal(true)}
                    className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <span className="text-lg">+</span>
                    <span>New Duvet</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoadingDuvets ? (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      Loading your duvets...
                    </div>
                  ) : duvets.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No duvets yet. Add your first duvet to get started!
                    </div>
                  ) : (
                    duvets.map((duvet) => (
                      <div
                        key={duvet.id}
                        className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-black hover:shadow-lg transition-all duration-200 cursor-pointer group"
                      >
                        <div className="space-y-4">
                          {/* Duvet Image */}
                          <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={duvet.image_url} 
                              alt={duvet.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div>
                            <h3 className="text-xl font-semibold text-black mb-2 group-hover:text-gray-800">
                              {duvet.name}
                            </h3>
                            <p className="text-sm text-gray-600">Material: {duvet.material}</p>
                          </div>
                          
                          <div className="border-t border-gray-100 pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-gray-700">Mite Risk Status</span>
                              <span className={`text-lg ${getRiskColor(duvet.mite_score)}`}>
                                {getRiskIcon(duvet.mite_score)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={`text-lg font-semibold ${getRiskColor(duvet.mite_score)}`}>
                                {getMiteRiskLevel(duvet.mite_score)}
                              </span>
                              <span className="text-sm text-gray-500">
                                {duvet.mite_score}/100
                              </span>
                            </div>
                          </div>
                        
                        <div className="border-t border-gray-100 pt-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-700">Last Cleaned</p>
                            {duvet.last_clean ? (
                              <>
                                <p className="text-base text-black">
                                  {new Date(duvet.last_clean).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(duvet.last_clean).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </>
                            ) : (
                              <p className="text-base text-gray-500 italic">Never cleaned</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'orders' && (
              <div className="bg-white">
                <h2 className="text-2xl font-bold text-black mb-6">View Nearby Orders</h2>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-500">Content will be displayed here</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* New Duvet Modal */}
      {showNewDuvetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-gray-50 rounded-2xl p-10 w-full mx-4 shadow-2xl ${currentStep === 4 ? 'max-w-7xl' : 'max-w-4xl'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-black">Add New Duvet</h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-black text-2xl"
              >
                ×
              </button>
            </div>

            {/* Dynamic Content Based on State */}
            {currentStep === 1 ? (
              /* Step 1: Photo Upload Only */
              <div className="space-y-8">
                <div className="text-center">
                  <h4 className="text-2xl font-semibold text-black mb-4">Step 1: Upload Photo</h4>
                  <p className="text-gray-600 text-lg">Take a clear photo of your duvet</p>
                </div>
                
                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-black transition-colors cursor-pointer">
                  {photoPreview ? (
                    <div className="space-y-4">
                      <img 
                        src={photoPreview} 
                        alt="Duvet preview" 
                        className="max-h-48 mx-auto rounded-xl shadow-md"
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
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                {/* Next Button */}
                <button
                  onClick={() => {
                    if (selectedPhoto) {
                      setCurrentStep(2)
                    }
                  }}
                  disabled={!selectedPhoto}
                  className="w-full bg-black text-white px-6 py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {!selectedPhoto ? 'Please upload a photo first' : 'Continue to Location'}
                </button>
              </div>
            ) : currentStep === 2 ? (
              /* Step 2: Location Collection */
              <div className="space-y-8">
                <div className="text-center">
                  <h4 className="text-2xl font-semibold text-black mb-4">Step 2: Get Location</h4>
                  <p className="text-gray-600 text-lg">We need your location to analyze environmental factors</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <div className="space-y-6">
                    <div className="text-5xl text-gray-400">📍</div>
                    <div>
                      <p className="text-xl text-gray-700 font-medium mb-2">Location & Weather Data</p>
                      <p className="text-sm text-gray-500">This helps us provide accurate mite risk analysis</p>
                    </div>
                  </div>
                </div>

                {/* Location Status */}
                {isLoadingLocation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-blue-700 font-medium">Getting your location...</span>
                    </div>
                  </div>
                )}

                {isLoadingWeather && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-blue-700 font-medium">Getting weather data...</span>
                    </div>
                  </div>
                )}

                {location && weather && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-green-600">✓</div>
                      <div>
                        <p className="text-green-700 font-medium">Environment data collected</p>
                        <p className="text-sm text-green-600">
                          {weather.temperature}°C, {weather.humidity}% humidity
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                  
                  {!(location && weather) ? (
                    <button
                      onClick={getCurrentLocation}
                      disabled={isLoadingLocation || isLoadingWeather}
                      className="flex-1 px-6 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                    >
                      {isLoadingLocation || isLoadingWeather ? 'Getting Data...' : 'Get My Location'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setCurrentStep(3)
                        handleSubmitNewDuvet()
                      }}
                      className="flex-1 px-6 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                    >
                      Continue to Analysis
                    </button>
                  )}
                </div>
              </div>
            ) : currentStep === 3 ? (
              /* Step 3: Analysis Interface */
              <div className="space-y-8 py-8">
                <div className="text-center">
                  <h4 className="text-2xl font-semibold text-black mb-8">Step 3: Analyzing Your Duvet</h4>
                  
                  {/* Progress Steps */}
                  <div className="space-y-6">
                    {['Analyzing duvet material and thickness...', 'Combining with environmental data...', 'Generating mite risk assessment...'].map((step, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          stepCompleted[index] 
                            ? 'bg-green-500 text-white' 
                            : currentAnalysisStep === index 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-300 text-gray-600'
                        }`}>
                          {stepCompleted[index] ? '✓' : index + 1}
                        </div>
                        <span className={`text-lg ${
                          stepCompleted[index] 
                            ? 'text-green-700 font-semibold' 
                            : currentAnalysisStep === index 
                              ? 'text-blue-700 font-semibold' 
                              : 'text-gray-500'
                        }`}>
                          {step}
                        </span>
                        {currentAnalysisStep === index && !stepCompleted[index] && (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Overall Progress Bar */}
                  <div className="mt-8">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${((currentAnalysisStep + 1) / 3) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Step {currentAnalysisStep + 1} / 3
                    </p>
                  </div>
                </div>
              </div>
            ) : currentStep === 4 ? (
              /* Step 4: Final Details */
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center py-2">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2 tracking-wide">Step 4: Complete Your Duvet</h4>
                  <p className="text-base text-gray-600">Add final details and save to your collection</p>
                </div>

                {/* Main Content - Compact Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {/* Left Panel - Risk Score + Duvet Specifications */}
                  <div className="space-y-4">
                    {/* Risk Score Section */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="text-center">
                        <h5 className="text-sm font-bold text-gray-900 mb-3">Risk Assessment</h5>
                        <div className="scale-50 -my-8">
                          <CircularProgress score={analysisResult?.miteScore || 0} />
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-semibold text-gray-800">{getMiteRiskLevel(analysisResult?.miteScore || 0)}</p>
                          <p className="text-xs text-gray-600">Mite Risk Level</p>
                        </div>
                      </div>
                    </div>

                    {/* Duvet Specifications */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <h5 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Duvet Specifications</h5>
                      
                      <div className="space-y-3">
                        {/* Material Specification */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1 tracking-wider uppercase">Material</label>
                          
                          {!isEditingMaterial ? (
                            <div className="space-y-1">
                              <div className="px-2 py-1 bg-gray-50 rounded border border-gray-200">
                                <span className="text-xs font-medium text-gray-900">
                                  {selectedMaterial || analysisResult?.material}
                                </span>
                              </div>
                              <button
                                onClick={() => setIsEditingMaterial(true)}
                                className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
                              >
                                Wrong? Fix it
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <select
                                value={selectedMaterial}
                                onChange={(e) => setSelectedMaterial(e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-900 bg-white focus:ring-1 focus:ring-gray-400 focus:border-gray-500"
                                autoFocus
                              >
                                <option value="Cotton">Cotton</option>
                                <option value="Polyester">Polyester</option>
                                <option value="Down">Down</option>
                                <option value="Silk">Silk</option>
                                <option value="Bamboo Fiber">Bamboo Fiber</option>
                                <option value="Memory Foam">Memory Foam</option>
                                <option value="Wool">Wool</option>
                                <option value="Linen">Linen</option>
                                <option value="Microfiber">Microfiber</option>
                              </select>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setIsEditingMaterial(false)}
                                  className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedMaterial(analysisResult?.material || '')
                                    setIsEditingMaterial(false)
                                  }}
                                  className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Thickness Specification */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1 tracking-wider uppercase">Thickness</label>
                          
                          {!isEditingThickness ? (
                            <div className="space-y-1">
                              <div className="px-2 py-1 bg-gray-50 rounded border border-gray-200">
                                <span className="text-xs font-medium text-gray-900">
                                  {duvetThickness}
                                </span>
                              </div>
                              <button
                                onClick={() => setIsEditingThickness(true)}
                                className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
                              >
                                Wrong? Fix it
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <select
                                value={duvetThickness}
                                onChange={(e) => setDuvetThickness(e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-900 bg-white focus:ring-1 focus:ring-gray-400 focus:border-gray-500"
                                autoFocus
                              >
                                <option value="Thin">Thin</option>
                                <option value="Medium">Medium</option>
                                <option value="Thick">Thick</option>
                                <option value="Extra Thick">Extra Thick</option>
                              </select>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setIsEditingThickness(false)}
                                  className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => {
                                    setDuvetThickness('Medium')
                                    setIsEditingThickness(false)
                                  }}
                                  className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Panel - User Input Form + Risk Factors */}
                  <div className="space-y-4">
                    {/* Duvet Name Input */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <h5 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Duvet Details</h5>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1 tracking-wider uppercase">
                            Duvet Name
                          </label>
                          <input
                            type="text"
                            value={duvetName}
                            onChange={(e) => setDuvetName(e.target.value)}
                            placeholder="e.g., Master Bedroom Duvet"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-900 bg-white focus:ring-1 focus:ring-gray-400 focus:border-gray-500 placeholder-gray-400"
                          />
                        </div>

                        {/* Cleaning History */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1 tracking-wider uppercase">
                            Cleaning History
                          </label>
                          <div className="space-y-1">
                            <label className="flex items-center p-1 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                              <input
                                type="radio"
                                value="new"
                                checked={cleaningHistory === 'new'}
                                onChange={(e) => setCleaningHistory(e.target.value as 'new' | 'long_time' | 'recent')}
                                className="mr-2 text-black focus:ring-black w-3 h-3"
                              />
                              <span className="text-gray-900 font-medium text-xs">Brand New</span>
                            </label>
                            <label className="flex items-center p-1 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                              <input
                                type="radio"
                                value="recent"
                                checked={cleaningHistory === 'recent'}
                                onChange={(e) => setCleaningHistory(e.target.value as 'new' | 'long_time' | 'recent')}
                                className="mr-2 text-black focus:ring-black w-3 h-3"
                              />
                              <span className="text-gray-900 font-medium text-xs">Recently Cleaned</span>
                            </label>
                            <label className="flex items-center p-1 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                              <input
                                type="radio"
                                value="long_time"
                                checked={cleaningHistory === 'long_time'}
                                onChange={(e) => setCleaningHistory(e.target.value as 'new' | 'long_time' | 'recent')}
                                className="mr-2 text-black focus:ring-black w-3 h-3"
                              />
                              <span className="text-gray-900 font-medium text-xs">Not Cleaned for Long Time</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Risk Factors */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <h5 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Risk Factors</h5>
                      
                      <div className="max-h-48 overflow-y-auto minimal-scrollbar">
                        <div className="space-y-2">
                          {analysisResult?.reasons?.map((reason: string, index: number) => (
                            <div key={index} className="p-2 bg-gray-50 rounded border border-gray-100">
                              <div className="flex items-start space-x-2">
                                <div className="flex-shrink-0 w-1 h-1 bg-gray-400 rounded-full mt-1.5"></div>
                                <p className="text-xs text-gray-800 font-medium leading-relaxed">{reason}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-100 max-w-4xl mx-auto">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-medium border border-gray-200 hover:border-gray-300 transition-all duration-300 text-sm"
                  >
                    Back to Start
                  </button>
                  <button
                    onClick={handleConfirmAnalysis}
                    disabled={!duvetName.trim()}
                    className="flex-1 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-lg font-medium transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                  >
                    Save to My Duvets
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}