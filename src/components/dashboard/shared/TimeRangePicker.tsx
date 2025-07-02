'use client'

import { useState, useEffect } from 'react'

interface TimeRangePickerProps {
  onTimeRangeChange: (startTime: string, endTime: string) => void
  initialStartTime?: string
  initialEndTime?: string
}

export default function TimeRangePicker({ 
  onTimeRangeChange, 
  initialStartTime, 
  initialEndTime 
}: TimeRangePickerProps) {
  const [startTime, setStartTime] = useState(initialStartTime || '')
  const [endTime, setEndTime] = useState(initialEndTime || '')
  const [error, setError] = useState('')

  // Generate time options from 7 AM to 7 PM in 30-minute intervals
  const generateTimeOptions = () => {
    const options = []
    for (let hour = 7; hour < 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
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

  const timeOptions = generateTimeOptions()

  const validateTimeRange = (start: string, end: string) => {
    if (!start || !end) {
      setError('Please select both start and end times')
      return false
    }

    const startDate = new Date(`2000-01-01T${start}`)
    const endDate = new Date(`2000-01-01T${end}`)
    const diffInMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60)

    if (diffInMinutes <= 0) {
      setError('End time must be after start time')
      return false
    }

    if (diffInMinutes < 30) {
      setError('Minimum drying time is 30 minutes')
      return false
    }

    if (diffInMinutes > 480) { // 8 hours
      setError('Maximum drying time is 8 hours')
      return false
    }

    setError('')
    return true
  }

  useEffect(() => {
    if (startTime && endTime && validateTimeRange(startTime, endTime)) {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      
      const startDateTime = new Date(`${tomorrow.toISOString().split('T')[0]}T${startTime}:00.000Z`)
      const endDateTime = new Date(`${tomorrow.toISOString().split('T')[0]}T${endTime}:00.000Z`)
      
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

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h5 className="font-medium text-gray-900">Select Drying Time Window</h5>
        <p className="text-sm text-gray-600">
          Choose when you want to start and end the drying process (tomorrow)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Start Time</label>
          <select
            value={startTime}
            onChange={(e) => handleStartTimeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select start time</option>
            {timeOptions.map((option) => (
              <option key={`start-${option.value}`} value={option.value}>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select end time</option>
            {timeOptions.map((option) => (
              <option key={`end-${option.value}`} value={option.value}>
                {option.display}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      {startTime && endTime && !error && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Selected time:</span> {
              timeOptions.find(opt => opt.value === startTime)?.display
            } - {
              timeOptions.find(opt => opt.value === endTime)?.display
            } tomorrow
          </p>
        </div>
      )}
    </div>
  )
}