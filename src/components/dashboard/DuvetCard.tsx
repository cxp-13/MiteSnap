import Image from 'next/image'
import CircularProgress from './shared/CircularProgress'
import { Duvet } from './shared/types'
import { isCurrentTimeWithinSunrise } from '@/lib/weather-analysis'

interface DuvetCardProps {
  duvet: Duvet
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



export default function DuvetCard({ 
  duvet, 
  onSunDryingService,
  onDuvetClick
}: DuvetCardProps) {
  const colors = getRiskColor(duvet.mite_score)
  const riskLevel = getMiteRiskLevel(duvet.mite_score)
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


        {/* Action Buttons */}
        {duvet.status === 'waiting_pickup' ? (
          <div className="rounded-lg p-4 bg-amber-50 border border-amber-200">
            <div className="flex items-center justify-center space-x-2">
              <span>⏳</span>
              <span className="font-medium text-amber-800">Waiting for pickup</span>
            </div>
            <p className="text-sm text-amber-600 text-center mt-1">
              Someone will help dry your duvet
            </p>
          </div>
        ) : duvet.status === 'waiting_optimal_time' ? (
          <div className="rounded-lg p-4 bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-center space-x-2">
              <span>⏰</span>
              <span className="font-medium text-blue-800">Waiting for optimal time</span>
            </div>
            <p className="text-sm text-blue-600 text-center mt-1">
              Self-drying scheduled
            </p>
          </div>
        ) : duvet.status === 'self_drying' ? (
          <div className="rounded-lg p-4 bg-green-50 border border-green-200">
            <div className="flex items-center justify-center space-x-2">
              <span>🌞</span>
              <span className="font-medium text-green-800">Currently drying</span>
            </div>
            <p className="text-sm text-green-600 text-center mt-1">
              Drying in progress
            </p>
          </div>
        ) : duvet.status === 'help_drying' ? (
          <div className="rounded-lg p-4 bg-purple-50 border border-purple-200">
            <div className="flex items-center justify-center space-x-2">
              <span>🤝</span>
              <span className="font-medium text-purple-800">Being helped</span>
            </div>
            <p className="text-sm text-purple-600 text-center mt-1">
              Someone is helping dry your duvet
            </p>
          </div>
        ) : !duvet.status && isSunriseTime && (
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