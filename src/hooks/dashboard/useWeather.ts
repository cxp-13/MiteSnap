import { useState, useCallback } from 'react'
import { getWeatherForecast, analyzeWeatherForSunDrying, type WeatherAnalysisResult } from '@/lib/weather-analysis'
import { calculateBasicSunDryingReduction, type SunDryingAnalysisResult } from '@/lib/sun-drying-ai'
import { createSunDryRecord } from '@/lib/clean-history'
import { updateDuvetStatus } from '@/lib/database'

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
  const [sunDryStep, setSunDryStep] = useState<1 | 2>(1)

  // Analyze weather for sun drying
  const analyzeWeatherForDrying = useCallback(async (latitude: number, longitude: number) => {
    setIsLoadingWeatherAnalysis(true)
    try {
      const forecast = await getWeatherForecast(latitude, longitude)
      const analysis =  analyzeWeatherForSunDrying(forecast!)
      setWeatherAnalysis(analysis)
      return analysis
    } catch (error) {
      console.error('Error analyzing weather:', error)
      return null
    } finally {
      setIsLoadingWeatherAnalysis(false)
    }
  }, [])



  // Close sun dry modal and clear all data
  const closeSunDryModal = useCallback(() => {
    setShowSunDryModal(false)
    setSunDryStep(1)
    setWeatherAnalysis(null)
    setSunDryingAnalysis(null)
  }, [])

  // Close sun dry modal UI only (preserve weather data for order creation)
  const closeSunDryModalUIOnly = useCallback(() => {
    setShowSunDryModal(false)
    setSunDryStep(1)
    // Keep weatherAnalysis and sunDryingAnalysis for order creation
  }, [])

  // Start AI analysis (don't create record yet)
  const handleStartAIAnalysis = useCallback(async (currentMiteScore: number) => {
    if (!weatherAnalysis || !weatherAnalysis.optimalWindows.length) {
      alert('Weather analysis not available')
      return false
    }

    try {
      setIsLoadingSunDryingAnalysis(true)
      
      // Get the best weather window
      const bestWeatherWindow = weatherAnalysis.optimalWindows[0]
      
      // Calculate actual drying duration from the optimal window
      const startTime = new Date(bestWeatherWindow.startTime)
      const endTime = new Date(bestWeatherWindow.endTime)
      const durationInHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
      
      // Run AI analysis without photo (using weather-based analysis)
      const analysis = calculateBasicSunDryingReduction(
        currentMiteScore,
        bestWeatherWindow,
        durationInHours
      )
      
      setSunDryingAnalysis(analysis)
      setSunDryStep(2) // Move to results step
      return true
    } catch (error) {
      console.error('Error analyzing sun drying:', error)
      alert('Failed to analyze sun drying. Please try again.')
      return false
    } finally {
      setIsLoadingSunDryingAnalysis(false)
    }
  }, [weatherAnalysis])

  // Confirm and start sun drying (after showing results)
  const handleConfirmSunDrying = useCallback(async (duvetId: string, userId: string, currentMiteScore: number) => {
    if (!weatherAnalysis || !weatherAnalysis.optimalWindows.length || !sunDryingAnalysis) {
      alert('Weather analysis or prediction not available')
      return false
    }

    try {
      // Get the best weather window
      const bestWeatherWindow = weatherAnalysis.optimalWindows[0]
      
      // Create sun dry record with optimal time window and predicted mite score
      await createSunDryRecord(
        duvetId, 
        userId, 
        currentMiteScore,
        bestWeatherWindow.startTime,
        bestWeatherWindow.endTime,
        sunDryingAnalysis.finalMiteScore
      )
      
      // Update duvet status to waiting for optimal time
      await updateDuvetStatus(duvetId, 'waiting_optimal_time')
      
      // Close modal and indicate success
      closeSunDryModal()
      return true
    } catch (error) {
      console.error('Error confirming sun drying:', error)
      alert('Failed to start sun drying. Please try again.')
      return false
    }
  }, [weatherAnalysis, sunDryingAnalysis, closeSunDryModal])

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
    
    // Actions
    setLocation,
    setIsLoadingLocation,
    setWeather,
    setIsLoadingWeather,
    analyzeWeatherForDrying,
    handleStartAIAnalysis,
    handleConfirmSunDrying,
    closeSunDryModal,
    closeSunDryModalUIOnly,
    setShowSunDryModal,
    setSunDryStep
  }
}