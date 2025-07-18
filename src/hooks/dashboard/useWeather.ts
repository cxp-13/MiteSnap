import { useState, useCallback } from 'react'
import { getWeatherForecast, analyzeWeatherForSunDrying, type WeatherAnalysisResult, type OptimalTimeWindow } from '@/lib/weather-analysis'
import { calculateBasicSunDryingReduction, type SunDryingAnalysisResult } from '@/lib/sun-drying-ai'

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
  const [isEditingTime, setIsEditingTime] = useState(false)
  
  // Weather recommendation time editing state
  const [isEditingWeatherTime, setIsEditingWeatherTime] = useState(false)
  const [customTimeWindow, setCustomTimeWindow] = useState<OptimalTimeWindow | null>(null)
  const [editingTimeWindow, setEditingTimeWindow] = useState<OptimalTimeWindow | null>(null)

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

  // Handle weather recommendation time editing (temporary state)
  const handleWeatherTimeSelection = useCallback((startTime: string, endTime: string) => {
    // Validate input format
    if (!startTime || !endTime) {
      return
    }
    
    // TimeRangePicker already sends ISO strings, so parse them directly
    const startDateTime = new Date(startTime)
    const endDateTime = new Date(endTime)
    const now = new Date()
    
    // Check if dates are valid
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return // Silently fail for invalid dates
    }
    
    // Check if start time is not in the past
    if (startDateTime <= now) {
      return // Silently fail for past times
    }
    
    const diffInMinutes = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60)
    
    // Check time range (7AM-7PM)
    const startHour = startDateTime.getHours()
    const endHour = endDateTime.getHours()
    
    if (startHour < 7 || endHour > 19) {
      return // Silently fail for out-of-range times
    }
    
    // Check duration limits
    if (diffInMinutes < 30) {
      return // Silently fail for too short duration
    }
    
    if (diffInMinutes > 480) { // 8 hours
      return // Silently fail for too long duration
    }
    
    // Only update editing state, not the confirmed custom time
    const editingWindow: OptimalTimeWindow = {
      startTime: startTime, // Already an ISO string
      endTime: endTime,     // Already an ISO string
      temperature: 15,
      humidity: 70,
      precipitationProbability: 20,
      suitabilityScore: 50
    }
    
    setEditingTimeWindow(editingWindow)
  }, [])

  // Start editing weather recommended time
  const startEditingWeatherTime = useCallback(() => {
    setIsEditingWeatherTime(true)
    // Initialize with current weather recommendation
    if (weatherAnalysis?.optimalWindows?.[0]) {
      setCustomTimeWindow(weatherAnalysis.optimalWindows[0])
    }
  }, [weatherAnalysis])

  // Cancel editing weather time
  const cancelEditingWeatherTime = useCallback(() => {
    setIsEditingWeatherTime(false)
    setEditingTimeWindow(null)
  }, [])

  // Confirm editing weather time
  const confirmEditingWeatherTime = useCallback(() => {
    if (editingTimeWindow) {
      setCustomTimeWindow(editingTimeWindow)
      setSunDryingAnalysis(null) // Clear previous AI analysis
    }
    setIsEditingWeatherTime(false)
    setEditingTimeWindow(null)
  }, [editingTimeWindow])



  // Close sun dry modal and clear all data
  const closeSunDryModal = useCallback(() => {
    setShowSunDryModal(false)
    setSunDryStep(1)
    setWeatherAnalysis(null)
    setSunDryingAnalysis(null)
    setIsManualMode(false)
    setManualTimeWindow(null)
    setIsEditingTime(false)
    setIsEditingWeatherTime(false)
    setCustomTimeWindow(null)
    setEditingTimeWindow(null)
  }, [])

  // Close sun dry modal UI only (preserve weather data for order creation)
  const closeSunDryModalUIOnly = useCallback(() => {
    setShowSunDryModal(false)
    setSunDryStep(1)
    // Keep weatherAnalysis and sunDryingAnalysis for order creation
  }, [])

  // Start AI analysis (don't create record yet)
  const handleStartAIAnalysis = useCallback(async (currentMiteScore: number) => {
    // Determine effective time window priority: 
    // 1. Editing time window (if currently editing)
    // 2. Custom time window (if previously confirmed)
    // 3. Manual time window (if in manual mode)
    // 4. Weather analysis optimal window (default)
    const effectiveWindow = editingTimeWindow
      ? editingTimeWindow
      : (customTimeWindow
          ? customTimeWindow
          : (isManualMode && manualTimeWindow 
              ? manualTimeWindow 
              : weatherAnalysis?.optimalWindows?.[0]))
    
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
  }, [weatherAnalysis, isManualMode, manualTimeWindow, customTimeWindow, editingTimeWindow])

  // Confirm and start sun drying (after showing results)
  const handleConfirmSunDrying = useCallback(async (duvetId: string, userId: string, currentMiteScore: number) => {
    // Determine effective time window priority: 
    // 1. Editing time window (if currently editing)
    // 2. Custom time window (if previously confirmed)
    // 3. Manual time window (if in manual mode)
    // 4. Weather analysis optimal window (default)
    const effectiveWindow = editingTimeWindow
      ? editingTimeWindow
      : (customTimeWindow
          ? customTimeWindow
          : (isManualMode && manualTimeWindow 
              ? manualTimeWindow 
              : weatherAnalysis?.optimalWindows?.[0]))
    
    if (!effectiveWindow || !sunDryingAnalysis) {
      alert('Time window or prediction not available')
      return false
    }

    try {
      // Call API to handle sun drying start
      const response = await fetch('/api/sun-drying/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          duvetId,
          currentMiteScore,
          startTime: effectiveWindow.startTime,
          endTime: effectiveWindow.endTime,
          predictedMiteScore: sunDryingAnalysis.finalMiteScore
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('API error:', error)
        throw new Error(error.error || 'Failed to start sun drying')
      }

      const result = await response.json()
      console.log('Sun drying started successfully:', result)
      
      // Close modal and indicate success
      closeSunDryModal()
      return true
    } catch (error) {
      console.error('Error confirming sun drying:', error)
      alert('Failed to start sun drying. Please try again.')
      return false
    }
  }, [weatherAnalysis, sunDryingAnalysis, closeSunDryModal, isManualMode, manualTimeWindow, customTimeWindow, editingTimeWindow])

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
    isEditingTime,
    
    // Weather Time Editing State
    isEditingWeatherTime,
    customTimeWindow,
    editingTimeWindow,
    
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
    setIsManualMode,
    setIsEditingTime,
    handleWeatherTimeSelection,
    startEditingWeatherTime,
    cancelEditingWeatherTime,
    confirmEditingWeatherTime,
    setIsEditingWeatherTime,
    setCustomTimeWindow,
    setSunDryingAnalysis
  }
}