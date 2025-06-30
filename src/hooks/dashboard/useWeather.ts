import { useState, useCallback } from 'react'
import { getWeatherForecast, analyzeWeatherForSunDrying, type WeatherAnalysisResult } from '@/lib/weather-analysis'
import { analyzeSunDryingEffectiveness, type SunDryingAnalysisResult } from '@/lib/sun-drying-ai'
import { createSunDryRecord, updateDuvetMiteScore } from '@/lib/clean-history'
import { uploadDuvetImage } from '@/lib/storage'

export function useWeather() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [weather, setWeather] = useState<{ temperature: number; humidity: number } | null>(null)
  const [isLoadingWeather, setIsLoadingWeather] = useState(false)
  const [weatherAnalysis, setWeatherAnalysis] = useState<WeatherAnalysisResult | null>(null)
  const [isLoadingWeatherAnalysis, setIsLoadingWeatherAnalysis] = useState(false)
  const [sunDryingAnalysis, setSunDryingAnalysis] = useState<SunDryingAnalysisResult | null>(null)
  const [isLoadingSunDryingAnalysis, setIsLoadingSunDryingAnalysis] = useState(false)

  // Sun drying modal state
  const [showSunDryModal, setShowSunDryModal] = useState(false)
  const [sunDryStep, setSunDryStep] = useState<1 | 2 | 3>(1)
  const [sunDryPhoto, setSunDryPhoto] = useState<File | null>(null)
  const [sunDryPhotoPreview, setSunDryPhotoPreview] = useState<string | null>(null)
  const [isUploadingSunDryPhoto, setIsUploadingSunDryPhoto] = useState(false)

  // Analyze weather for sun drying
  const analyzeWeatherForDrying = useCallback(async (latitude: number, longitude: number) => {
    setIsLoadingWeatherAnalysis(true)
    try {
      const forecast = await getWeatherForecast(latitude, longitude)
      const analysis = await analyzeWeatherForSunDrying(forecast)
      setWeatherAnalysis(analysis)
      return analysis
    } catch (error) {
      console.error('Error analyzing weather:', error)
      return null
    } finally {
      setIsLoadingWeatherAnalysis(false)
    }
  }, [])

  // Handle sun dry photo upload
  const handleSunDryPhotoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSunDryPhoto(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setSunDryPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  // Submit sun drying analysis (Step 2: Photo upload and AI analysis only)
  const handleSubmitSunDrying = useCallback(async (duvetId: string, userId: string, currentMiteScore: number) => {
    if (!sunDryPhoto || !location || !weatherAnalysis) return

    setIsUploadingSunDryPhoto(true)
    try {
      // Upload photo
      const photo = await uploadDuvetImage(sunDryPhoto, userId, 'sun-dry')
      
      // Get the best weather window from the analysis
      const bestWeatherWindow = weatherAnalysis.optimalWindows[0]
      if (!bestWeatherWindow) {
        throw new Error('No optimal weather window available for analysis')
      }
      
      // Calculate sun drying duration (default to 3 hours if not specified)
      const sunDryingDuration = 3 // hours - could be made configurable
      
      // Analyze sun drying effectiveness
      setIsLoadingSunDryingAnalysis(true)
      const analysis = await analyzeSunDryingEffectiveness(
        photo!.url, 
        currentMiteScore, 
        bestWeatherWindow, 
        sunDryingDuration
      )
      setSunDryingAnalysis(analysis)
      
      // Move to step 3 to show results and confirmation
      setSunDryStep(3)
    } catch (error) {
      console.error('Error submitting sun drying:', error)
      alert('Failed to submit sun drying. Please try again.')
    } finally {
      setIsUploadingSunDryPhoto(false)
      setIsLoadingSunDryingAnalysis(false)
    }
  }, [sunDryPhoto, location, weatherAnalysis])

  // Close sun dry modal
  const closeSunDryModal = useCallback(() => {
    setShowSunDryModal(false)
    setSunDryStep(1)
    setSunDryPhoto(null)
    setSunDryPhotoPreview(null)
    setWeatherAnalysis(null)
    setSunDryingAnalysis(null)
  }, [])

  // Confirm and start sun drying (Step 3: Create record and update duvet)
  const handleConfirmSunDrying = useCallback(async (duvetId: string, userId: string, currentMiteScore: number) => {
    if (!sunDryingAnalysis) return

    try {
      // Create sun dry record with correct parameters
      await createSunDryRecord(duvetId, userId, currentMiteScore)
      
      // Update duvet mite score if analysis shows improvement
      if (sunDryingAnalysis.effectivenessScore > 70) {
        await updateDuvetMiteScore(duvetId, sunDryingAnalysis.finalMiteScore)
      }
      
      // Close modal and indicate success
      closeSunDryModal()
      return true
    } catch (error) {
      console.error('Error confirming sun drying:', error)
      alert('Failed to start sun drying. Please try again.')
      return false
    }
  }, [sunDryingAnalysis, closeSunDryModal])

  return {
    // Location & Weather State
    location,
    isLoadingLocation,
    weather,
    isLoadingWeather,
    weatherAnalysis,
    isLoadingWeatherAnalysis,
    sunDryingAnalysis,
    isLoadingSunDryingAnalysis,
    
    // Sun Drying Modal State
    showSunDryModal,
    sunDryStep,
    sunDryPhoto,
    sunDryPhotoPreview,
    isUploadingSunDryPhoto,
    
    // Actions
    setLocation,
    setIsLoadingLocation,
    setWeather,
    setIsLoadingWeather,
    analyzeWeatherForDrying,
    handleSunDryPhotoUpload,
    handleSubmitSunDrying,
    handleConfirmSunDrying,
    closeSunDryModal,
    setShowSunDryModal,
    setSunDryStep
  }
}