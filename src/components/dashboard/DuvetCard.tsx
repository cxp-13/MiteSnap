import Image from 'next/image'
import CircularProgress from './shared/CircularProgress'
import { Duvet, CleanHistoryRecord } from './shared/types'
import { isCurrentTimeWithinSunrise } from '@/lib/weather-analysis'

interface DuvetCardProps {
  duvet: Duvet
  sunDryingStatus: CleanHistoryRecord | null
  onSunDryingService: (duvet: Duvet) => void
  onDuvetClick?: (duvet: Duvet) => void
}

const getMiteRiskLevel = (score: number) => {
  if (score < 30) return 'Low Risk'
  if (score < 60) return 'Moderate'
  return 'High'
}

const getRiskColor = (score: number) => {
  if (score < 30) return { bg: 'from-emerald-400 to-emerald-600', text: 'text-emerald-600', border: 'border-emerald-200' }
  if (score < 60) return { bg: 'from-amber-400 to-amber-600', text: 'text-amber-600', border: 'border-amber-200' }
  return { bg: 'from-red-400 to-red-600', text: 'text-red-600', border: 'border-red-200' }
}


const getSunDryingStatus = (sunDryingStatus: CleanHistoryRecord | null): {
  status: 'scheduled' | 'in_progress' | null
  timeText: string
  isOptimal: boolean
} => {
  if (!sunDryingStatus || !sunDryingStatus.start_time || !sunDryingStatus.end_time) {
    console.log('sunDryingStatus', sunDryingStatus)
    return { status: null, timeText: '', isOptimal: false }
  }

  const now = new Date()
  const startTime = new Date(sunDryingStatus.start_time)
  const endTime = new Date(sunDryingStatus.end_time)

  // If current time is before start time, it's scheduled
  if (now < startTime) {
    return {
      status: 'scheduled',
      timeText: `Scheduled for ${startTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })}`,
      isOptimal: true
    }
  }

  // If current time is between start and end time, it's in progress
  if (now >= startTime && now < endTime) {
    const remaining = endTime.getTime() - now.getTime()
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    
    const timeRemaining = hours > 0 ? `${hours}h ${minutes}m remaining` : `${minutes}m remaining`
    
    return {
      status: 'in_progress',
      timeText: timeRemaining,
      isOptimal: false
    }
  }

  // If current time is past end time, this record is completed - don't show any status
  return { status: null, timeText: '', isOptimal: false }
}

export default function DuvetCard({ 
  duvet, 
  sunDryingStatus, 
  onSunDryingService,
  onDuvetClick
}: DuvetCardProps) {
  const colors = getRiskColor(duvet.mite_score)
  const riskLevel = getMiteRiskLevel(duvet.mite_score)
  const dryingStatus = getSunDryingStatus(sunDryingStatus)
  const isSunriseTime = isCurrentTimeWithinSunrise()

  return (
    <div 
      className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onDuvetClick?.(duvet)}
    >
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden">
            <Image
              src={duvet.image_url || '/placeholder-duvet.png'}
              alt={duvet.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">{duvet.name}</h3>
            <p className="text-gray-600">{duvet.material}</p>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors.border} ${colors.text} bg-opacity-10`}>
              {riskLevel}
            </div>
          </div>
        </div>

        <CircularProgress score={duvet.mite_score} />

        {/* Sun Drying Status */}
        {dryingStatus.status && (
          <div className={`rounded-lg p-4 ${
            dryingStatus.status === 'scheduled' && dryingStatus.isOptimal 
              ? 'bg-green-50 border border-green-200' 
              : dryingStatus.status === 'in_progress'
              ? 'bg-blue-50 border border-blue-200'
              : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className="space-y-2">
              <p className={`font-medium ${
                dryingStatus.status === 'scheduled' && dryingStatus.isOptimal
                  ? 'text-green-800'
                  : dryingStatus.status === 'in_progress' 
                  ? 'text-blue-800'
                  : 'text-gray-800'
              }`}>
                {dryingStatus.status === 'scheduled' && dryingStatus.isOptimal && '☀️ Optimal drying scheduled!'}
                {dryingStatus.status === 'scheduled' && !dryingStatus.isOptimal && '📅 Sun drying scheduled'}
                {dryingStatus.status === 'in_progress' && '🌤️ Sun drying in progress'}
              </p>
              
              <div className="space-y-1 text-sm">
                <p className={`font-medium ${
                  dryingStatus.status === 'scheduled' && dryingStatus.isOptimal
                    ? 'text-green-600'
                    : dryingStatus.status === 'in_progress'
                    ? 'text-blue-600' 
                    : 'text-gray-600'
                }`}>
                  {dryingStatus.timeText}
                </p>
                
                {sunDryingStatus && sunDryingStatus.start_time && dryingStatus.status !== 'scheduled' && (
                  <p className="text-gray-600">
                    <span className="font-medium">Started:</span> {new Date(sunDryingStatus.start_time).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isSunriseTime && !dryingStatus.status && (
          <div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSunDryingService(duvet)
              }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              <span>🤖</span>
              <span>Dry it</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}