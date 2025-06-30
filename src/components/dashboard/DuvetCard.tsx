import Image from 'next/image'
import CircularProgress from './shared/CircularProgress'
import { Duvet, CleanHistoryRecord } from './shared/types'
import { isCurrentTimeWithinSunrise } from '@/lib/weather-analysis'

interface DuvetCardProps {
  duvet: Duvet
  sunDryingStatus: CleanHistoryRecord | null
  onSunDryingService: (duvet: Duvet) => void
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
  if (!sunDryingStatus?.weatherAnalysis?.isOptimalForSunDrying || 
      !sunDryingStatus.weatherAnalysis.optimalWindows.length) {
    return false
  }

  const now = new Date()
  const currentHour = now.getHours()
  
  return sunDryingStatus.weatherAnalysis.optimalWindows.some(window => {
    const startHour = parseInt(window.start.split(':')[0])
    const endHour = parseInt(window.end.split(':')[0])
    return currentHour >= startHour && currentHour < endHour
  })
}

const getNextOptimalTime = (sunDryingStatus: CleanHistoryRecord | null): string | null => {
  if (!sunDryingStatus?.weatherAnalysis?.isOptimalForSunDrying || 
      !sunDryingStatus.weatherAnalysis.optimalWindows.length) {
    return null
  }

  const now = new Date()
  const currentTime = now.getTime()
  
  const futureWindow = sunDryingStatus.weatherAnalysis.optimalWindows.find(window => {
    const windowStartTime = new Date(window.startTime).getTime()
    return windowStartTime > currentTime
  })
  
  const optimalWindow = futureWindow || sunDryingStatus.weatherAnalysis.optimalWindows[0]
  
  return new Date(optimalWindow.startTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export default function DuvetCard({ 
  duvet, 
  sunDryingStatus, 
  onSunDryingService
}: DuvetCardProps) {
  const colors = getRiskColor(duvet.mite_score)
  const riskLevel = getMiteRiskLevel(duvet.mite_score)
  const isOptimalTime = isCurrentTimeOptimal(sunDryingStatus)
  const isSunriseTime = isCurrentTimeWithinSunrise()
  const nextOptimalTime = getNextOptimalTime(sunDryingStatus)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
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
          <div className={`rounded-lg p-4 ${isOptimalTime ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isOptimalTime ? 'text-green-800' : 'text-gray-700'}`}>
                  {isOptimalTime ? '☀️ Optimal drying time!' : '🌤️ Sun drying in progress'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Started: {new Date(sunDryingStatus.start_time).toLocaleDateString()}
                </p>
                {nextOptimalTime && (
                  <p className="text-sm text-blue-600 mt-1 font-medium">
                    Next optimal: {nextOptimalTime}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isSunriseTime && (
          <div>
            <button
              onClick={() => onSunDryingService(duvet)}
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