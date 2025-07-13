'use client'

import { useState, useEffect } from 'react'

interface CountdownTimerProps {
  startTime: string | null
  onExpired?: () => void
}

interface TimeRemaining {
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
}

export default function CountdownTimer({ startTime, onExpired }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  })

  useEffect(() => {
    if (!startTime) return

    const calculateTimeRemaining = () => {
      const now = new Date().getTime()
      const start = new Date(startTime).getTime()
      const diff = start - now

      if (diff <= 0) {
        setTimeRemaining({
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true
        })
        if (onExpired) {
          onExpired()
        }
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeRemaining({
        hours,
        minutes,
        seconds,
        isExpired: false
      })
    }

    // Calculate immediately
    calculateTimeRemaining()

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [startTime, onExpired])

  if (!startTime) {
    return <span className="text-xs text-gray-600 font-medium">No schedule</span>
  }

  if (timeRemaining.isExpired) {
    return <span className="text-xs text-red-600 font-medium">Time expired</span>
  }

  const formatTime = () => {
    const { hours, minutes } = timeRemaining
    
    if (hours > 0) {
      return `${hours}h ${minutes}m to start`
    } else if (minutes > 0) {
      return `${minutes}m to start`
    } else {
      return 'Starting soon'
    }
  }

  return (
    <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
      {formatTime()}
    </span>
  )
}