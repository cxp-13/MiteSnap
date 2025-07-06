interface DryingCircularProgressProps {
  startTime: string | null
  endTime: string | null
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
}

const getProgressColor = (progress: number, status: string) => {
  if (status === 'cancelled') return 'stroke-red-500'
  if (progress === 0) return 'stroke-gray-400'
  if (progress === 100) return 'stroke-green-600'
  return 'stroke-orange-500'
}

const getBackgroundColor = (progress: number, status: string) => {
  if (status === 'cancelled') return 'stroke-red-100'
  if (progress === 0) return 'stroke-gray-200'
  if (progress === 100) return 'stroke-green-100'
  return 'stroke-orange-100'
}

const formatDetailedTime = (minutes: number) => {
  if (minutes <= 0) return 'Completed'
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) {
    return `${mins} minutes remaining`
  } else if (mins === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} remaining`
  } else {
    return `${hours}h ${mins}m remaining`
  }
}

export default function DryingCircularProgress({ startTime, endTime, status }: DryingCircularProgressProps) {
  // Calculate progress based on time
  const calculateProgress = () => {
    if (!startTime || !endTime) {
      return { progress: 0, detailText: 'Drying schedule not available' }
    }

    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(endTime)

    // Order cancelled
    if (status === 'cancelled') {
      return { progress: 0, detailText: 'Service cancelled' }
    }

    // Order completed
    if (status === 'completed') {
      return { progress: 100, detailText: 'Drying completed' }
    }

    // Not started yet
    if (now < start) {
      const hoursUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60))
      return { 
        progress: 0, 
        detailText: `Starts in ${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}` 
      }
    }

    // Past end time
    if (now > end) {
      return { progress: 100, detailText: 'Drying completed' }
    }

    // Currently drying
    const totalDuration = end.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    const progress = Math.round((elapsed / totalDuration) * 100)
    const remaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60))
    
    return { 
      progress: Math.min(progress, 100), 
      detailText: formatDetailedTime(remaining)
    }
  }

  const { progress, detailText } = calculateProgress()
  const strokeColor = getProgressColor(progress, status)
  const bgStrokeColor = getBackgroundColor(progress, status)
  
  // Circle parameters
  const size = 32
  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative group">
      {/* Circular Progress SVG */}
      <div className="w-8 h-8">
        <svg 
          width={size} 
          height={size} 
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className={bgStrokeColor}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={`${strokeColor} transition-all duration-500 ease-out`}
          />
        </svg>
        
        {/* Center indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-2 h-2 rounded-full ${strokeColor.replace('stroke-', 'bg-')}`}></div>
        </div>
      </div>

      {/* Tooltip on hover */}
      <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
        <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {detailText}
          <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
        </div>
      </div>
    </div>
  )
}