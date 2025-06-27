'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import { uploadDuvetImage } from '@/lib/storage'
import { analyzeDuvet } from '@/lib/ai-analysis'
import { createDuvet, getUserDuvets, type Duvet } from '@/lib/database'
import { useUnifiedUser } from '@/hooks/useUnifiedUser'
import { useMockUser } from '@/context/MockUserContext'
import { getWeatherForecast, analyzeWeatherForSunDrying, type WeatherAnalysisResult } from '@/lib/weather-analysis'
import { analyzeSunDryingEffectiveness, calculateBasicSunDryingReduction, type SunDryingAnalysisResult } from '@/lib/sun-drying-ai'
import { createSunDryRecord, updateSunDryRecord, updateDuvetMiteScore, getDuvetSunDryHistory, getCurrentSunDryingStatus, type CleanHistoryRecord } from '@/lib/clean-history'

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
  const [duvetSunDryingStatus, setDuvetSunDryingStatus] = useState<Record<string, CleanHistoryRecord | null>>({})

  // Sun-drying modal states
  const [showSunDryModal, setShowSunDryModal] = useState(false)
  const [sunDryStep, setSunDryStep] = useState<1 | 2 | 3>(1)
  const [selectedDuvet, setSelectedDuvet] = useState<Duvet | null>(null)
  const [weatherAnalysis, setWeatherAnalysis] = useState<WeatherAnalysisResult | null>(null)
  const [isLoadingWeatherAnalysis, setIsLoadingWeatherAnalysis] = useState(false)
  const [sunDryPhoto, setSunDryPhoto] = useState<File | null>(null)
  const [sunDryPhotoPreview, setSunDryPhotoPreview] = useState<string | null>(null)
  const [isUploadingSunDryPhoto, setIsUploadingSunDryPhoto] = useState(false)
  const [isSunDryAnalyzing, setIsSunDryAnalyzing] = useState(false)
  const [sunDryAnalysisResult, setSunDryAnalysisResult] = useState<SunDryingAnalysisResult | null>(null)
  const [, setSunDryRecord] = useState<CleanHistoryRecord | null>(null)

  // Duvet details page states
  const [showDuvetDetails, setShowDuvetDetails] = useState(false)
  const [selectedDuvetForDetails, setSelectedDuvetForDetails] = useState<Duvet | null>(null)
  const [duvetHistory, setDuvetHistory] = useState<CleanHistoryRecord[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // Sun dry handler
  const handleSunDry = (duvetId: string) => {
    const duvet = duvets.find(d => d.id === duvetId)
    if (duvet) {
      setSelectedDuvet(duvet)
      setShowSunDryModal(true)
      setSunDryStep(1)
      // Start weather analysis immediately
      getCurrentLocationForSunDrying()
    }
  }

  // Load sun-drying status for all duvets
  const loadDuvetsSunDryingStatus = useCallback(async (duvets: Duvet[]) => {
    const statusMap: Record<string, CleanHistoryRecord | null> = {}
    
    await Promise.all(
      duvets.map(async (duvet) => {
        try {
          const status = await getCurrentSunDryingStatus(duvet.id)
          statusMap[duvet.id] = status
        } catch (error) {
          console.error(`Error loading sun-drying status for duvet ${duvet.id}:`, error)
          statusMap[duvet.id] = null
        }
      })
    )
    
    setDuvetSunDryingStatus(statusMap)
  }, [])

  // Load user's duvets from database
  const loadDuvets = useCallback(async () => {
    if (!user?.id) return
    
    setIsLoadingDuvets(true)
    try {
      const userDuvets = await getUserDuvets(user.id)
      setDuvets(userDuvets)
      // Load sun-drying status for all duvets
      await loadDuvetsSunDryingStatus(userDuvets)
    } catch (error) {
      console.error('Error loading duvets:', error)
    } finally {
      setIsLoadingDuvets(false)
    }
  }, [user?.id, loadDuvetsSunDryingStatus])

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

  // Sun-drying specific functions
  const getCurrentLocationForSunDrying = () => {
    setIsLoadingWeatherAnalysis(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          await analyzeSunDryingWeather(latitude, longitude)
        },
        (error) => {
          console.error('Error getting location for sun-drying:', error)
          setIsLoadingWeatherAnalysis(false)
          // Use default location for demo
          analyzeSunDryingWeather(40.7128, -74.0060)
        }
      )
    } else {
      // Use default location for demo
      analyzeSunDryingWeather(40.7128, -74.0060)
    }
  }

  const analyzeSunDryingWeather = async (latitude: number, longitude: number) => {
    try {
      const weatherData = await getWeatherForecast(latitude, longitude)
      if (weatherData) {
        const analysis = analyzeWeatherForSunDrying(weatherData)
        setWeatherAnalysis(analysis)
      } else {
        // Fallback analysis for demo
        setWeatherAnalysis({
          isOptimalForSunDrying: false,
          optimalWindows: [],
          reason: 'Unable to fetch weather data, please try again',
          overallConditions: {
            averageTemperature: 20,
            averageHumidity: 70,
            rainHours: 6,
            totalHours: 12
          }
        })
      }
    } catch (error) {
      console.error('Error analyzing sun-drying weather:', error)
      setWeatherAnalysis({
        isOptimalForSunDrying: false,
        optimalWindows: [],
        reason: 'Weather analysis failed, please try again',
        overallConditions: {
          averageTemperature: 20,
          averageHumidity: 70,
          rainHours: 6,
          totalHours: 12
        }
      })
    } finally {
      setIsLoadingWeatherAnalysis(false)
    }
  }

  const handleSunDryPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSunDryPhoto(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setSunDryPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmitSunDrying = async () => {
    if (!selectedDuvet || !user?.id || !sunDryPhoto || !weatherAnalysis) {
      alert('Missing required information, please try again')
      return
    }

    try {
      // Upload photo
      setIsUploadingSunDryPhoto(true)
      const uploadResult = await uploadDuvetImage(sunDryPhoto, user.id)
      setIsUploadingSunDryPhoto(false)
      
      if (!uploadResult) {
        alert('Photo upload failed')
        return
      }
      
      // AI Analysis (for preview only)
      setIsSunDryAnalyzing(true)
      setSunDryStep(3)
      
      let analysisResult: SunDryingAnalysisResult | null = null
      
      if (weatherAnalysis.optimalWindows.length > 0) {
        // Calculate duration based on the optimal time window
        const optimalWindow = weatherAnalysis.optimalWindows[0]
        const startTime = new Date(optimalWindow.startTime)
        const endTime = new Date(optimalWindow.endTime)
        const calculatedDuration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)) // Convert to hours
        
        // Use AI analysis with the best weather window
        analysisResult = await analyzeSunDryingEffectiveness(
          uploadResult.url,
          selectedDuvet.mite_score,
          optimalWindow,
          calculatedDuration
        )
      }
      
      // Fallback to basic calculation if AI fails
      if (!analysisResult && weatherAnalysis.optimalWindows.length > 0) {
        const optimalWindow = weatherAnalysis.optimalWindows[0]
        const startTime = new Date(optimalWindow.startTime)
        const endTime = new Date(optimalWindow.endTime)
        const calculatedDuration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60))
        
        analysisResult = calculateBasicSunDryingReduction(
          selectedDuvet.mite_score,
          optimalWindow,
          calculatedDuration
        )
      }
      
      if (analysisResult) {
        setSunDryAnalysisResult(analysisResult)
      } else {
        alert('Analysis failed, please try again')
      }
    } catch (error) {
      console.error('Error processing sun-drying:', error)
      alert('Processing failed, please try again')
    } finally {
      setIsSunDryAnalyzing(false)
    }
  }

  // Handle when user confirms they did the sun-drying (clicks "Got It")
  const handleConfirmSunDrying = async () => {
    if (!selectedDuvet || !user?.id || !sunDryAnalysisResult) {
      alert('Missing required information')
      return
    }

    try {
      // Create sun dry record
      const record = await createSunDryRecord(
        selectedDuvet.id,
        user.id,
        selectedDuvet.mite_score
      )
      
      if (!record) {
        alert('Failed to create sun-drying record')
        return
      }
      
      // Update database records
      await updateSunDryRecord(record.id, sunDryAnalysisResult.finalMiteScore)
      await updateDuvetMiteScore(selectedDuvet.id, sunDryAnalysisResult.finalMiteScore)
      
      // Refresh duvets list
      await loadDuvets()
      
      // Close modal
      closeSunDryModal()
    } catch (error) {
      console.error('Error confirming sun-drying:', error)
      alert('Failed to save sun-drying record')
    }
  }

  const closeSunDryModal = () => {
    setShowSunDryModal(false)
    setSunDryStep(1)
    setSelectedDuvet(null)
    setWeatherAnalysis(null)
    setSunDryPhoto(null)
    setSunDryPhotoPreview(null)
    setSunDryAnalysisResult(null)
    setSunDryRecord(null)
  }

  // Duvet details page handlers
  const handleDuvetCardClick = async (duvet: Duvet) => {
    setSelectedDuvetForDetails(duvet)
    setShowDuvetDetails(true)
    
    // Load duvet history
    setIsLoadingHistory(true)
    try {
      const history = await getDuvetSunDryHistory(duvet.id)
      setDuvetHistory(history)
    } catch (error) {
      console.error('Error loading duvet history:', error)
      setDuvetHistory([])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const closeDuvetDetails = () => {
    setShowDuvetDetails(false)
    setSelectedDuvetForDetails(null)
    setDuvetHistory([])
  }

  // Utility function to check if current time is within optimal drying window
  const isCurrentTimeOptimal = (weatherAnalysis: WeatherAnalysisResult | null): boolean => {
    if (!weatherAnalysis || !weatherAnalysis.isOptimalForSunDrying || weatherAnalysis.optimalWindows.length === 0) {
      return false
    }

    const now = new Date()
    const currentTime = now.getTime()

    // Check if current time falls within any optimal window with sufficient remaining time
    const currentWindow = weatherAnalysis.optimalWindows.find(window => {
      const startTime = new Date(window.startTime).getTime()
      const endTime = new Date(window.endTime).getTime()
      const minimumDryingTime = 2 * 60 * 60 * 1000 // 2 hours in milliseconds
      
      return currentTime >= startTime && 
             currentTime <= endTime && 
             (endTime - currentTime) >= minimumDryingTime
    })

    return !!currentWindow
  }

  // Utility functions for duvet cards
  const getDaysSinceLastDry = (lastClean: string | null): number | null => {
    if (!lastClean) return null
    const lastCleanDate = new Date(lastClean)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - lastCleanDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getMiteRiskColor = (score: number): string => {
    if (score <= 30) return 'bg-green-100 text-green-800'
    if (score <= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getMiteRiskBarColor = (score: number): string => {
    if (score <= 30) return 'bg-green-500'
    if (score <= 60) return 'bg-yellow-500'
    return 'bg-red-500'
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
              alt="MiteSnap Logo" 
              width={32} 
              height={32}
            />
            <h1 className="text-xl font-semibold">MiteSnap</h1>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            <button
              onClick={() => {
                setActiveTab('duvets')
                if (showDuvetDetails) {
                  closeDuvetDetails()
                }
              }}
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
                alt="MiteSnap Logo" 
                width={24} 
                height={24}
              />
              <span className="text-lg font-semibold text-black">MiteSnap</span>
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
            {activeTab === 'duvets' && !showDuvetDetails && (
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
                    duvets.map((duvet) => {
                      const daysSinceLastDry = getDaysSinceLastDry(duvet.last_clean)
                      const showUrgency = daysSinceLastDry && daysSinceLastDry > 14
                      const sunDryingStatus = duvetSunDryingStatus[duvet.id]
                      const isCurrentlySunDrying = sunDryingStatus !== null
                      
                      // Calculate remaining time if sun drying
                      let remainingTime = ''
                      if (isCurrentlySunDrying && sunDryingStatus?.start_time) {
                        const startTime = new Date(sunDryingStatus.start_time)
                        const now = new Date()
                        const elapsedHours = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60)
                        const totalDryingTime = 6 // Assume 6 hours total drying time
                        const remainingHours = Math.max(0, totalDryingTime - elapsedHours)
                        
                        if (remainingHours > 1) {
                          remainingTime = `${Math.ceil(remainingHours)}h remaining`
                        } else if (remainingHours > 0) {
                          remainingTime = `${Math.ceil(remainingHours * 60)}min remaining`
                        } else {
                          remainingTime = 'Almost done!'
                        }
                      }
                      
                      return (
                        <div
                          key={duvet.id}
                          className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-400 hover:shadow-lg transition-all duration-200 cursor-pointer"
                          onClick={() => handleDuvetCardClick(duvet)}
                        >
                          {/* Duvet Photo */}
                          <div className="aspect-video w-full bg-gray-100 overflow-hidden">
                            <Image
                              src={duvet.image_url}
                              alt={duvet.name}
                              width={300}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="p-6 space-y-6">
                            {/* Duvet Name - Prominent */}
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
                                {duvet.name}
                              </h3>
                            </div>

                            {/* Days Since Last Dry - Only show if > 14 days */}
                            {showUrgency && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm font-medium text-red-700 mb-1">Days Since Last Dry</p>
                                <p className="text-3xl font-bold text-red-600">
                                  {daysSinceLastDry}
                                </p>
                              </div>
                            )}

                            {/* Mite Level - Color-coded with progress bar */}
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-medium text-gray-700">Mite Level</p>
                                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getMiteRiskColor(duvet.mite_score)}`}>
                                  {duvet.mite_score}
                                </div>
                              </div>
                              
                              {/* Progress Bar */}
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${getMiteRiskBarColor(duvet.mite_score)}`}
                                  style={{ width: `${duvet.mite_score}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Sun Dry Button or Status */}
                            <div className="pt-2">
                              {isCurrentlySunDrying ? (
                                <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                                  <div className="flex items-center justify-center space-x-2 mb-2">
                                    <span className="text-yellow-600">☀️</span>
                                    <span className="text-yellow-800 font-semibold">Currently Sun Drying</span>
                                  </div>
                                  <p className="text-sm text-yellow-700 font-medium">{remainingTime}</p>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSunDry(duvet.id)
                                  }}
                                  className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold py-3 px-4 transition-colors duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
                                >
                                  <span>☀️</span>
                                  <span>Sun Dry</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}

            {/* Duvet Details Page */}
            {activeTab === 'duvets' && showDuvetDetails && selectedDuvetForDetails && (
              <div className="bg-white">
                {/* Header with Back Button */}
                <div className="flex items-center mb-8">
                  <button
                    onClick={closeDuvetDetails}
                    className="mr-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                  >
                    <span className="text-lg">←</span>
                    <span className="font-medium">Back</span>
                  </button>
                  <h2 className="text-2xl font-bold text-black">{selectedDuvetForDetails.name}</h2>
                </div>

                {/* Duvet Overview Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  {/* Duvet Image */}
                  <div className="lg:col-span-1">
                    <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={selectedDuvetForDetails.image_url}
                        alt={selectedDuvetForDetails.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Duvet Info */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-black mb-2">Material</h3>
                        <p className="text-gray-600">{selectedDuvetForDetails.material}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-black mb-2">Current Mite Score</h3>
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl font-bold text-red-500">{selectedDuvetForDetails.mite_score}</span>
                          <span className="text-gray-500">/100</span>
                        </div>
                      </div>
                    </div>

                    {/* Last Cleaned */}
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-2">Last Cleaned</h3>
                      {selectedDuvetForDetails.last_clean ? (
                        <p className="text-gray-600">
                          {new Date(selectedDuvetForDetails.last_clean).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      ) : (
                        <p className="text-gray-500 italic">Never cleaned</p>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-3">Quick Actions</h3>
                      <button
                        onClick={() => handleSunDry(selectedDuvetForDetails.id)}
                        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                      >
                        <span>☀️</span>
                        <span>Sun Dry</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sun-Drying History Section */}
                <div>
                  <h3 className="text-xl font-bold text-black mb-6">Sun-Drying History</h3>
                  {isLoadingHistory ? (
                    <div className="text-center py-8 text-gray-500">
                      Loading history...
                    </div>
                  ) : duvetHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-4">☀️</div>
                      <p>No sun-drying sessions yet.</p>
                      <p className="text-sm mt-2">Start your first sun-drying session to see history here!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {duvetHistory.map((record) => (
                        <div
                          key={record.id}
                          className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-lg p-6"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                            {/* Date and Time */}
                            <div>
                              <p className="text-lg font-semibold text-slate-800">
                                {new Date(record.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="text-sm text-slate-600">
                                {record.start_time && record.end_time
                                  ? `${new Date(record.start_time).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })} - ${new Date(record.end_time).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}`
                                  : 'Time not recorded'
                                }
                              </p>
                            </div>

                            {/* Score Change */}
                            <div className="flex items-center space-x-6">
                              <div className="text-center">
                                <p className="text-sm text-slate-500 uppercase tracking-wide">Before</p>
                                <p className="text-xl font-bold text-red-400">{record.before_mite_score}</p>
                              </div>
                              <div className="text-slate-400">→</div>
                              <div className="text-center">
                                <p className="text-sm text-slate-500 uppercase tracking-wide">After</p>
                                <p className="text-xl font-bold text-green-500">{record.after_mite_score}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-slate-500 uppercase tracking-wide">Reduction</p>
                                <p className="text-xl font-bold text-green-600">
                                  -{(record.before_mite_score || 0) - (record.after_mite_score || 0)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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

            {/* Step 1: Minimalist Best Drying Time Display */}
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
                        {/* Best Drying Time - Single Focus Element */}
                        <div className="space-y-6">
                          <h4 className="text-gray-500 font-light text-base uppercase tracking-[0.2em] mb-8">BEST DRYING TIME (NEXT 12 HOURS)</h4>
                          <div className="text-7xl font-extralight text-black tracking-tight leading-none">
                            {(() => {
                              const now = new Date()
                              const currentTime = now.getTime()
                              let optimalWindow = weatherAnalysis.optimalWindows[0]
                              
                              // Find the first window that starts after current time
                              const futureWindow = weatherAnalysis.optimalWindows.find(window => {
                                const windowStartTime = new Date(window.startTime).getTime()
                                return windowStartTime > currentTime
                              })
                              
                              if (futureWindow) {
                                optimalWindow = futureWindow
                              } else {
                                // If no future window today, create a fallback within daylight hours
                                const currentHour = now.getHours()
                                let adjustedStart: Date
                                
                                if (currentHour < 7) {
                                  // Before sunrise, start at 7:00 AM
                                  adjustedStart = new Date(now)
                                  adjustedStart.setHours(7, 0, 0, 0)
                                } else if (currentHour >= 16) {
                                  // Too late for sun-drying today, suggest tomorrow at 7:00 AM
                                  adjustedStart = new Date(now)
                                  adjustedStart.setDate(adjustedStart.getDate() + 1)
                                  adjustedStart.setHours(7, 0, 0, 0)
                                } else {
                                  // Current time is within daylight, start 30 minutes from now
                                  adjustedStart = new Date(currentTime + 30 * 60 * 1000)
                                }
                                
                                const adjustedEnd = new Date(adjustedStart.getTime() + 3 * 60 * 60 * 1000) // 3 hour window
                                // Ensure end time doesn't go past sunset (7 PM)
                                const maxEnd = new Date(adjustedStart)
                                maxEnd.setHours(19, 0, 0, 0)
                                const finalEnd = adjustedEnd > maxEnd ? maxEnd : adjustedEnd
                                
                                const startHour = adjustedStart.getHours().toString().padStart(2, '0')
                                const startMin = adjustedStart.getMinutes().toString().padStart(2, '0')
                                const endHour = finalEnd.getHours().toString().padStart(2, '0')
                                const endMin = finalEnd.getMinutes().toString().padStart(2, '0')
                                return `${startHour}:${startMin} – ${endHour}:${endMin}`
                              }
                              
                              const startTime = new Date(optimalWindow.startTime)
                              const endTime = new Date(optimalWindow.endTime)
                              const startHour = startTime.getHours().toString().padStart(2, '0')
                              const startMin = startTime.getMinutes().toString().padStart(2, '0')
                              const endHour = endTime.getHours().toString().padStart(2, '0')
                              const endMin = endTime.getMinutes().toString().padStart(2, '0')
                              return `${startHour}:${startMin} – ${endHour}:${endMin}`
                            })()
                          }
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-16 space-y-8">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-3xl text-gray-400">☁️</span>
                        </div>
                        <div className="space-y-4">
                          <h4 className="text-2xl font-light text-gray-800">Conditions Not Suitable</h4>
                          <p className="text-gray-500 font-light max-w-sm mx-auto leading-relaxed text-lg">
                            {weatherAnalysis.reason}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-6 pt-8">
                      <button
                        onClick={closeSunDryModal}
                        className="flex-1 px-8 py-4 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200 font-light text-lg"
                      >
                        Cancel
                      </button>
                      {weatherAnalysis.isOptimalForSunDrying ? (
                        isCurrentTimeOptimal(weatherAnalysis) ? (
                          <button
                            onClick={() => setSunDryStep(2)}
                            className="flex-1 px-8 py-4 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-all duration-200 text-lg"
                          >
                            Start Drying
                          </button>
                        ) : (
                          <button
                            onClick={closeSunDryModal}
                            className="flex-1 px-8 py-4 bg-amber-100 text-amber-700 rounded-lg font-light cursor-not-allowed text-lg"
                          >
                            Wait for Optimal Time
                          </button>
                        )
                      ) : (
                        <button
                          onClick={closeSunDryModal}
                          className="flex-1 px-8 py-4 bg-gray-200 text-gray-400 rounded-lg font-light cursor-not-allowed text-lg"
                        >
                          Not Available
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 space-y-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl text-red-400">⚠️</span>
                    </div>
                    <div className="space-y-3">
                      <p className="text-slate-600 font-light">Weather data unavailable</p>
                      <button
                        onClick={getCurrentLocationForSunDrying}
                        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-medium transition-all duration-200"
                      >
                        Try Again
                      </button>
                    </div>
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

                <label htmlFor="sunDryPhotoInput" className="block cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 bg-gray-50 hover:bg-gray-100 transition-all duration-200">
                    {sunDryPhotoPreview ? (
                      <div className="text-center space-y-4">
                        <img
                          src={sunDryPhotoPreview}
                          alt="Sun-drying preview"
                          className="max-w-full h-48 object-contain mx-auto rounded-lg"
                        />
                        <p className="text-sm text-gray-500 font-light">Click to change photo</p>
                      </div>
                    ) : (
                      <div className="text-center space-y-6">
                        <div className="text-6xl text-gray-400">📸</div>
                        <div className="space-y-3">
                          <p className="text-xl font-light text-gray-700">Upload Drying Photo</p>
                          <p className="text-sm text-gray-500 font-light">Click here to select photo • JPG, PNG formats</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSunDryPhotoUpload}
                    className="hidden"
                    id="sunDryPhotoInput"
                  />
                </label>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setSunDryStep(1)}
                    className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all duration-200 font-light"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmitSunDrying}
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
                {isSunDryAnalyzing ? (
                  <div className="text-center py-16 space-y-6">
                    <div className="flex items-center justify-center mb-6">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-2xl font-light text-slate-800">
                        AI Analyzing Drying Results...
                      </h4>
                      <p className="text-slate-600 font-light">
                        Analyzing photo quality, weather conditions, and mite reduction effectiveness
                      </p>
                    </div>
                  </div>
                ) : sunDryAnalysisResult ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h4 className="text-2xl font-light text-slate-800 mb-4">
                        Predicted Sun Drying Results
                      </h4>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-100">
                      <div className="text-center mb-6">
                        <div className="text-4xl mb-4">☀️</div>
                        <h5 className="text-xl font-light text-slate-800">
                          Expected Mite Risk Reduction
                        </h5>
                      </div>

                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="text-center space-y-2">
                          <div className="text-3xl font-light text-red-400">
                            {selectedDuvet.mite_score}
                          </div>
                          <div className="text-sm text-slate-500 uppercase tracking-wide font-light">Before</div>
                        </div>
                        <div className="text-center space-y-2">
                          <div className="text-3xl font-light text-green-500">
                            {sunDryAnalysisResult.finalMiteScore}
                          </div>
                          <div className="text-sm text-slate-500 uppercase tracking-wide font-light">Predicted</div>
                        </div>
                      </div>

                      <div className="text-center mb-6">
                        <div className="text-lg font-light text-slate-700">
                          Expected reduction: <span className="text-green-600 font-medium">
                            {sunDryAnalysisResult.miteScoreReduction} points
                          </span>
                        </div>
                      </div>

                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={handleConfirmSunDrying}
                        className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        Got it!
                      </button>
                      <button
                        onClick={closeSunDryModal}
                        className="w-full px-6 py-3 border border-slate-200 text-slate-500 rounded-2xl font-light hover:bg-slate-50 transition-all duration-200"
                      >
                        Maybe next time
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 space-y-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl text-red-400">⚠️</span>
                    </div>
                    <div className="space-y-3">
                      <p className="text-slate-600 font-light">Analysis failed, please try again</p>
                      <button
                        onClick={closeSunDryModal}
                        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-medium transition-all duration-200"
                      >
                        Close
                      </button>
                    </div>
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