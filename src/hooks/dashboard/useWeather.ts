import { useState, useCallback } from 'react'
import { getWeatherForecast, analyzeWeatherForSunDrying, type WeatherAnalysisResult, type OptimalTimeWindow } from '@/lib/weather-analysis'
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
  
  // Manual time selection state
  const [isManualMode, setIsManualMode] = useState(false)
  const [manualTimeWindow, setManualTimeWindow] = useState<OptimalTimeWindow | null>(null)

  // Analyze weather for sun drying
  const analyzeWeatherForDrying = useCallback(async (latitude: number, longitude: number) => {
    setIsLoadingWeatherAnalysis(true)
    setIsManualMode(false) // Reset manual mode when trying weather analysis
    try {
      const forecast = await getWeatherForecast(latitude, longitude)
      const analysis =  analyzeWeatherForSunDrying(forecast!)
      setWeatherAnalysis(analysis)
      return analysis
    } catch (error) {
      console.error('Error analyzing weather:', error)
      setIsManualMode(true) // Enable manual mode when weather fails
      return null
    } finally {
      setIsLoadingWeatherAnalysis(false)
    }
  }, [])

  // Handle manual time selection
  const handleManualTimeSelection = useCallback((startTime: string, endTime: string) => {
    const manualWindow: OptimalTimeWindow = {
      startTime,
      endTime,
      temperature: 15, // Default values for manual mode
      humidity: 70,
      precipitationProbability: 20,
      suitabilityScore: 50
    }
    setManualTimeWindow(manualWindow)
  }, [])



  // Close sun dry modal and clear all data
  const closeSunDryModal = useCallback(() => {
    setShowSunDryModal(false)
    setSunDryStep(1)
    setWeatherAnalysis(null)
    setSunDryingAnalysis(null)
    setIsManualMode(false)
    setManualTimeWindow(null)
  }, [])

  // Close sun dry modal UI only (preserve weather data for order creation)
  const closeSunDryModalUIOnly = useCallback(() => {
    setShowSunDryModal(false)
    setSunDryStep(1)
    // Keep weatherAnalysis and sunDryingAnalysis for order creation
  }, [])

  // Start AI analysis (don't create record yet)
  const handleStartAIAnalysis = useCallback(async (currentMiteScore: number) => {
    // Use manual time window if in manual mode, otherwise use weather analysis
    const effectiveWindow = isManualMode && manualTimeWindow 
      ? manualTimeWindow 
      : weatherAnalysis?.optimalWindows?.[0]
    
    if (!effectiveWindow) {
      alert(isManualMode ? 'Please select a time window first' : 'Weather analysis not available')
      return false
    }

    try {
      setIsLoadingSunDryingAnalysis(true)
      
      // Calculate actual drying duration from the effective window
      const startTime = new Date(effectiveWindow.startTime)
      const endTime = new Date(effectiveWindow.endTime)
      const durationInHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
      
      // Run AI analysis
      const analysis = calculateBasicSunDryingReduction(
        currentMiteScore,
        effectiveWindow,
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
  }, [weatherAnalysis, isManualMode, manualTimeWindow])

  // Confirm and start sun drying (after showing results)
  const handleConfirmSunDrying = useCallback(async (duvetId: string, userId: string, currentMiteScore: number) => {
    // Use manual time window if in manual mode, otherwise use weather analysis
    const effectiveWindow = isManualMode && manualTimeWindow 
      ? manualTimeWindow 
      : weatherAnalysis?.optimalWindows?.[0]
    
    if (!effectiveWindow || !sunDryingAnalysis) {
      alert('Time window or prediction not available')
      return false
    }

    try {
      // Create sun dry record with effective time window and predicted mite score
      await createSunDryRecord(
        duvetId, 
        userId, 
        currentMiteScore,
        effectiveWindow.startTime,
        effectiveWindow.endTime,
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
  }, [weatherAnalysis, sunDryingAnalysis, closeSunDryModal, isManualMode, manualTimeWindow])

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
    
    // Manual Time Selection State
    isManualMode,
    manualTimeWindow,
    
    // Actions
    setLocation,
    setIsLoadingLocation,
    setWeather,
    setIsLoadingWeather,
    analyzeWeatherForDrying,
    handleStartAIAnalysis,
    handleConfirmSunDrying,
    handleManualTimeSelection,
    closeSunDryModal,
    closeSunDryModalUIOnly,
    setShowSunDryModal,
    setSunDryStep,
    setIsManualMode
  }
}