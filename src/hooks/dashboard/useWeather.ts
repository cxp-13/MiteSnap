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

  // Submit sun drying analysis
  const handleSubmitSunDrying = useCallback(async (duvetId: string, userId: string) => {
    if (!sunDryPhoto || !location) return

    setIsUploadingSunDryPhoto(true)
    try {
      // Upload photo
      const photoUrl = await uploadDuvetImage(sunDryPhoto, userId, 'sun-dry')
      
      // Analyze sun drying effectiveness
      setIsLoadingSunDryingAnalysis(true)
      const analysis = await analyzeSunDryingEffectiveness(photoUrl, weatherAnalysis)
      setSunDryingAnalysis(analysis)
      
      // Create sun dry record
      await createSunDryRecord(duvetId, userId, {
        placed_photo: photoUrl,
        weather_conditions: weatherAnalysis || undefined,
        analysis_result: analysis
      })
      
      // Update duvet mite score if analysis shows improvement
      if (analysis.effectiveness > 0.7) {
        const miteReduction = Math.min(20, analysis.effectiveness * 30)
        await updateDuvetMiteScore(duvetId, -miteReduction)
      }
      
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
    closeSunDryModal,
    setShowSunDryModal,
    setSunDryStep
  }
}