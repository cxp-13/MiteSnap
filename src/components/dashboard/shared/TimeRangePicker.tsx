'use client'

import { useState, useEffect } from 'react'

interface TimeRangePickerProps {
  onTimeRangeChange: (startTime: string, endTime: string) => void
  initialStartTime?: string
  initialEndTime?: string
  isEditMode?: boolean
  onEditModeChange?: (isEditing: boolean) => void
}

export default function TimeRangePicker({ 
  onTimeRangeChange, 
  initialStartTime, 
  initialEndTime,
  isEditMode = false,
  onEditModeChange
}: TimeRangePickerProps) {
  const [startTime, setStartTime] = useState(initialStartTime || '')
  const [endTime, setEndTime] = useState(initialEndTime || '')
  const [error, setError] = useState('')
  const [showTimePickers, setShowTimePickers] = useState(!isEditMode)

  // Generate start time options from current time to 6:30 PM
  const generateStartTimeOptions = () => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    // If current time is past 6:30 PM, no options available
    if (currentHour > 18 || (currentHour === 18 && currentMinute > 30)) {
      return []
    }
    
    const options = []
    
    // Start from the later of: current time or 7:00 AM
    let startHour = Math.max(currentHour, 7)
    let startMinute = 0
    
    // If we're starting from current time, round up to next 30-minute interval
    if (startHour === currentHour) {
      if (currentMinute <= 30) {
        startMinute = 30
      } else {
        startHour += 1
        startMinute = 0
      }
    }
    
    // Generate options until 6:30 PM (last start time that allows 30min drying)
    for (let hour = startHour; hour <= 18; hour++) {
      const maxMinute = hour === 18 ? 30 : 30 // Only go to 6:30 PM for hour 18
      
      for (let minute = (hour === startHour ? startMinute : 0); minute <= maxMinute; minute += 30) {
        if (hour === 18 && minute > 30) break // Stop at 6:30 PM
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
        options.push({ value: timeString, display: displayTime })
      }
    }
    
    return options
  }
  
  // Generate all possible time options (for end time selection)
  const generateAllTimeOptions = () => {
    const options = []
    for (let hour = 7; hour <= 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Stop at 7:00 PM (19:00)
        if (hour === 19 && minute > 0) break
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
        options.push({ value: timeString, display: displayTime })
      }
    }
    return options
  }

  const startTimeOptions = generateStartTimeOptions()
  const allTimeOptions = generateAllTimeOptions()

  // Get valid end time options based on selected start time
  const getValidEndTimeOptions = (selectedStartTime: string) => {
    if (!selectedStartTime) return []
    
    const startHour = parseInt(selectedStartTime.split(':')[0])
    const startMinute = parseInt(selectedStartTime.split(':')[1])
    const startTotalMinutes = startHour * 60 + startMinute
    
    return allTimeOptions.filter(option => {
      const endHour = parseInt(option.value.split(':')[0])
      const endMinute = parseInt(option.value.split(':')[1])
      const endTotalMinutes = endHour * 60 + endMinute
      
      // End time must be after start time and not exceed 7 PM (19:00)
      return endTotalMinutes > startTotalMinutes && endTotalMinutes <= 19 * 60
    })
  }

  const validateTimeRange = (start: string, end: string) => {
    if (!start || !end) {
      setError('')
      return false
    }

    const startDate = new Date(`2000-01-01T${start}`)
    const endDate = new Date(`2000-01-01T${end}`)
    const diffInMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60)

    if (diffInMinutes <= 0) {
      setError('')
      return false
    }

    if (diffInMinutes < 30) {
      setError('')
      return false
    }

    if (diffInMinutes > 480) { // 8 hours
      setError('')
      return false
    }

    setError('')
    return true
  }

  useEffect(() => {
    if (startTime && endTime && validateTimeRange(startTime, endTime)) {
      const today = new Date()
      const todayDateStr = today.toISOString().split('T')[0]
      
      const startDateTime = new Date(`${todayDateStr}T${startTime}:00.000Z`)
      const endDateTime = new Date(`${todayDateStr}T${endTime}:00.000Z`)
      
      onTimeRangeChange(startDateTime.toISOString(), endDateTime.toISOString())
    }
  }, [startTime, endTime, onTimeRangeChange])

  const handleStartTimeChange = (value: string) => {
    setStartTime(value)
    if (endTime) {
      validateTimeRange(value, endTime)
    }
  }

  const handleEndTimeChange = (value: string) => {
    setEndTime(value)
    if (startTime) {
      validateTimeRange(startTime, value)
    }
  }

  const handleStartEditing = () => {
    setShowTimePickers(true)
    onEditModeChange?.(true)
  }

  const handleCancelEditing = () => {
    setStartTime(initialStartTime || '')
    setEndTime(initialEndTime || '')
    setError('')
    setShowTimePickers(false)
    onEditModeChange?.(false)
  }

  // If no start time options available, don't render anything (parent will handle)
  if (startTimeOptions.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">

      {/* Show current selection if in edit mode and not editing */}
      {isEditMode && !showTimePickers && startTime && endTime && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">Current Selection</p>
              <p className="text-sm text-blue-800">
                {allTimeOptions.find(opt => opt.value === startTime)?.display} - {allTimeOptions.find(opt => opt.value === endTime)?.display} today
              </p>
            </div>
            <button
              onClick={handleStartEditing}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Change Time
            </button>
          </div>
        </div>
      )}

      {/* Time pickers - shown by default or when editing, and if start time options are available */}
      {showTimePickers && startTimeOptions.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <select
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
              >
                <option value="" className="text-gray-500">Select start time</option>
                {startTimeOptions.map((option) => (
                  <option key={`start-${option.value}`} value={option.value} className="text-gray-900 font-medium">
                    {option.display}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <select
                value={endTime}
                onChange={(e) => handleEndTimeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
              >
                <option value="" className="text-gray-500">Select end time</option>
                {getValidEndTimeOptions(startTime).map((option) => (
                  <option key={`end-${option.value}`} value={option.value} className="text-gray-900 font-medium">
                    {option.display}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isEditMode && (
            <div className="flex space-x-3">
              <button
                onClick={handleCancelEditing}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </>
      )}

      {/* Error display */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

    </div>
  )
}