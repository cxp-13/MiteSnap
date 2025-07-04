import Image from 'next/image'
import LinearProgress from './shared/LinearProgress'
import { Duvet, Address } from './shared/types'
import { isCurrentTimeWithinSunrise } from '@/lib/weather-analysis'

interface DuvetCardProps {
  duvet: Duvet
  onSunDryingService: (duvet: Duvet) => void
  onDuvetClick?: (duvet: Duvet) => void
  addresses?: Address[]
}

const getMiteRiskLevel = (score: number) => {
  if (score < 30) return 'Low Risk'
  if (score < 60) return 'Moderate'
  return 'High'
}

const getRiskColor = (score: number) => {
  if (score < 30) return { bg: 'from-gray-400 to-gray-600', text: 'text-gray-600', border: 'border-gray-200' }
  if (score < 60) return { bg: 'from-gray-600 to-gray-800', text: 'text-gray-800', border: 'border-gray-300' }
  return { bg: 'from-black to-gray-900', text: 'text-black', border: 'border-black' }
}

const getLocationText = (duvet: Duvet, addresses?: Address[]) => {
  if (!duvet.address_id || !addresses) return 'Location not set'
  
  const address = addresses.find(addr => addr.id === duvet.address_id)
  if (!address) return 'Location not found'
  
  // Format like international address: Street, District, City, State
  const parts = []
  // if (address.street) parts.push(address.street)
  if (address.neighbourhood) parts.push(address.neighbourhood)
  if (address.district) parts.push(address.district)
  if (address.city) parts.push(address.city)
  if (address.state) parts.push(address.state)
  
  return parts.length > 0 ? parts.join(', ') : 'Address available'
}



export default function DuvetCard({ 
  duvet, 
  onSunDryingService,
  onDuvetClick,
  addresses
}: DuvetCardProps) {
  const colors = getRiskColor(duvet.mite_score)
  const riskLevel = getMiteRiskLevel(duvet.mite_score)
  const isSunriseTime = isCurrentTimeWithinSunrise()

  return (
    <div 
      className="bg-white rounded-2xl overflow-hidden group shadow-md transition-all duration-200 ease-out hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Image Section - Top 60% */}
      <div className="relative h-64 bg-gray-100 overflow-hidden">
        <Image
          src={duvet.image_url || '/placeholder-duvet.png'}
          alt={duvet.name}
          fill
          className="object-cover"
        />
        {/* Risk Badge */}
        <div className="absolute top-4 left-4">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors.border} ${colors.text} bg-white/90 backdrop-blur-sm shadow-sm`}>
            {riskLevel}
          </div>
        </div>
      </div>

      {/* Content Section - Bottom 40% */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <h3 className="text-xl font-bold text-black">{duvet.name}</h3>
        {/* Location */}
        <p className="text-sm text-gray-600">{getLocationText(duvet, addresses)}</p>
        
        {/* Mite Score Row - Full Width like "by Author" */}
        <div className="py-2">
          <LinearProgress score={duvet.mite_score} />
        </div>

        {/* Bottom Row - Split like "Lessons/Level" */}
        <div className="flex items-center justify-between">
          {/* Left Side - Material and Last Clean */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <span className="text-gray-600">Material:</span>
              <span className="text-black font-medium">{duvet.material}</span>
            </div>
            {duvet.last_clean && (
              <div className="flex items-center space-x-1">
                <span className="text-gray-600">Last cleaned:</span>
                <span className="text-black font-medium">
                  {(() => {
                    const lastCleanDate = new Date(duvet.last_clean)
                    const today = new Date()
                    const diffTime = Math.abs(today.getTime() - lastCleanDate.getTime())
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    
                    if (diffDays === 1) return "1 day ago"
                    if (diffDays < 7) return `${diffDays} days ago`
                    if (diffDays < 14) return "1 week ago"
                    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
                    if (diffDays < 60) return "1 month ago"
                    return `${Math.floor(diffDays / 30)} months ago`
                  })()}
                </span>
              </div>
            )}
          </div>

          {/* Right Side - Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* History Button - Always shown */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDuvetClick?.(duvet)
              }}
              className="flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-gray-700 text-white rounded-xl hover:bg-gray-800 text-sm font-semibold shadow-md"
              title="View history"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>History</span>
            </button>
            
            {/* Status/Action Button */}
            {duvet.status === 'waiting_pickup' ? (
              <div className="flex items-center space-x-1 text-sm">
                <span>⏳</span>
                <span className="text-gray-600">Waiting</span>
              </div>
            ) : duvet.status === 'waiting_optimal_time' ? (
              <div className="flex items-center space-x-1 text-sm">
                <span>⏰</span>
                <span className="text-gray-600">Scheduled</span>
              </div>
            ) : duvet.status === 'self_drying' ? (
              <div className="flex items-center space-x-1 text-sm">
                <span>🌞</span>
                <span className="text-gray-600">Drying</span>
              </div>
            ) : duvet.status === 'help_drying' ? (
              <div className="flex items-center space-x-1 text-sm">
                <span>🤝</span>
                <span className="text-gray-600">Helping</span>
              </div>
            ) : duvet.status === 'normal' && isSunriseTime ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSunDryingService(duvet)
                }}
                className="flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 text-sm font-semibold shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Dry it</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}