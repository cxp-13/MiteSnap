interface SunDryingProgressProps {
  startTime: string | null
  endTime: string | null
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
}

const getProgressColor = (progress: number) => {
  if (progress === 0) return 'bg-gray-400'
  if (progress === 100) return 'bg-green-600'
  return 'bg-orange-500'
}

const formatTimeRemaining = (minutes: number) => {
  if (minutes <= 0) return 'Completed'
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) {
    return `${mins}m remaining`
  } else if (mins === 0) {
    return `${hours}h remaining`
  } else {
    return `${hours}h ${mins}m remaining`
  }
}

export default function SunDryingProgress({ startTime, endTime, status }: SunDryingProgressProps) {
  // Calculate progress based on time
  const calculateProgress = () => {
    if (!startTime || !endTime) {
      return { progress: 0, text: 'Drying schedule not available' }
    }

    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(endTime)

    // Order cancelled
    if (status === 'cancelled') {
      return { progress: 0, text: 'Service cancelled' }
    }

    // Order completed
    if (status === 'completed') {
      return { progress: 100, text: 'Drying completed' }
    }

    // Not started yet
    if (now < start) {
      const hoursUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60))
      return { 
        progress: 0, 
        text: `Starts in ${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}` 
      }
    }

    // Past end time
    if (now > end) {
      return { progress: 100, text: 'Drying completed' }
    }

    // Currently drying
    const totalDuration = end.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    const progress = Math.round((elapsed / totalDuration) * 100)
    const remaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60))
    
    return { 
      progress: Math.min(progress, 100), 
      text: formatTimeRemaining(remaining) 
    }
  }

  const { progress, text } = calculateProgress()
  const progressColor = getProgressColor(progress)
  
  return (
    <div className="w-full">
      {/* Drying Progress Label and Percentage */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900">Drying Progress</span>
        <span className="text-sm font-semibold text-gray-900">{progress}%</span>
      </div>
      
      {/* Progress Track */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`${progressColor} h-2 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Status Text */}
      <div className="text-xs text-gray-600">
        {text}
      </div>
    </div>
  )
}