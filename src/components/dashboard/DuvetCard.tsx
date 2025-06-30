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

const isCurrentTimeOptimal = (sunDryingStatus: CleanHistoryRecord | null): boolean => {
  // Simplified check - just return false for now since weatherAnalysis is not available
  return false
}

const getRemainingTime = (startTime: string): string => {
  const start = new Date(startTime)
  const now = new Date()
  const estimatedDuration = 4 * 60 * 60 * 1000 // 4 hours in milliseconds
  const endTime = new Date(start.getTime() + estimatedDuration)
  
  if (now >= endTime) {
    return "Completed"
  }
  
  const remaining = endTime.getTime() - now.getTime()
  const hours = Math.floor(remaining / (1000 * 60 * 60))
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`
  } else {
    return `${minutes}m remaining`
  }
}

export default function DuvetCard({ 
  duvet, 
  sunDryingStatus, 
  onSunDryingService,
  onDuvetClick
}: DuvetCardProps) {
  const colors = getRiskColor(duvet.mite_score)
  const riskLevel = getMiteRiskLevel(duvet.mite_score)
  const isOptimalTime = isCurrentTimeOptimal(sunDryingStatus)
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
        {sunDryingStatus && (
          <div className={`rounded-lg p-4 ${isOptimalTime ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="space-y-2">
              <p className={`font-medium ${isOptimalTime ? 'text-green-800' : 'text-blue-800'}`}>
                {isOptimalTime ? '☀️ Optimal drying time!' : '🌤️ Sun drying in progress'}
              </p>
              
              <div className="space-y-1 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">Started:</span> {sunDryingStatus.start_time ? new Date(sunDryingStatus.start_time).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  }) : 'Unknown'}
                </p>
                
                {sunDryingStatus.end_time ? (
                  <p className="text-gray-600">
                    <span className="font-medium">Ended:</span> {new Date(sunDryingStatus.end_time).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                ) : sunDryingStatus.start_time ? (
                  <p className="text-blue-600 font-medium">
                    {getRemainingTime(sunDryingStatus.start_time)}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isSunriseTime && !sunDryingStatus && (
          <div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSunDryingService(duvet)
              }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              <span>🤖</span>
              <span>One-click AI Blanket Drying</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}