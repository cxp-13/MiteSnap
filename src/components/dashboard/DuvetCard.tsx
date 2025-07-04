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
  
  // Format similar to AddressManager's getLocationLabel
  if (address.city) {
    return `Located in ${address.city}`
  }
  if (address.district) {
    return `Located in ${address.district}`
  }
  if (address.neighbourhood) {
    return `Located in ${address.neighbourhood}`
  }
  return 'Located at address'
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
      className="bg-white rounded-2xl overflow-hidden cursor-pointer group transition-all duration-700 ease-out hover:-translate-y-2 shadow-md hover:shadow-lg"
      onClick={() => onDuvetClick?.(duvet)}
    >
      {/* Image Section - Top 60% */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <Image
          src={duvet.image_url || '/placeholder-duvet.png'}
          alt={duvet.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
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

          {/* Right Side - Action Button */}
          <div className="flex items-center">
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
                className="flex items-center justify-center px-4 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 hover:scale-105 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
              >
                <span>Dry it</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}