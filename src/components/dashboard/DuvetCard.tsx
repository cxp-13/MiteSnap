import Image from 'next/image'
import LinearProgress from './shared/LinearProgress'
import DryingCircularProgress from './shared/DryingCircularProgress'
import CountdownTimer from './shared/CountdownTimer'
import { Duvet, Address, CleanHistoryRecord } from './shared/types'
import { isCurrentTimeWithinSunrise } from '@/lib/weather-analysis'

interface DuvetCardProps {
  duvet: Duvet
  onSunDryingService: (duvet: Duvet) => void
  onDuvetClick?: (duvet: Duvet) => void
  addresses?: Address[]
  helpDryingData?: { order: { id: string; status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'; quilt_id: string }; cleanHistory: CleanHistoryRecord | null }
  onCancelHelpDryingOrder?: (duvet: Duvet) => void
  duvetSunDryingStatus?: Record<string, CleanHistoryRecord | null>
  lastCleanDate?: string | null
  onDeleteDuvet?: (duvet: Duvet) => void
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
  addresses,
  helpDryingData,
  onCancelHelpDryingOrder,
  duvetSunDryingStatus,
  lastCleanDate,
  onDeleteDuvet
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
        
        {/* Delete Button */}
        {onDeleteDuvet && (
          <div className="absolute top-4 right-4">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeleteDuvet(duvet)
              }}
              className="flex items-center justify-center w-8 h-8 bg-red-600/90 text-white rounded-full hover:bg-red-700 transition-colors shadow-sm backdrop-blur-sm"
              title="Delete duvet"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Status Cards - For all non-normal states */}
        {duvet.status !== 'normal' && (
          <div className="absolute top-16 left-4">
            <div className="bg-white/90 backdrop-blur-sm shadow-sm rounded-lg px-3 py-2 flex items-center space-x-2">
              {duvet.status === 'help_drying' && helpDryingData ? (
                <>
                  <DryingCircularProgress
                    startTime={helpDryingData.cleanHistory?.start_time || null}
                    endTime={helpDryingData.cleanHistory?.end_time || null}
                    status={helpDryingData.order?.status || 'pending'}
                  />
                  <span className="text-xs text-gray-600 font-medium whitespace-nowrap">Help Drying</span>
                </>
              ) : duvet.status === 'self_drying' ? (
                <>
                  <DryingCircularProgress
                    startTime={duvetSunDryingStatus?.[duvet.id]?.start_time || null}
                    endTime={duvetSunDryingStatus?.[duvet.id]?.end_time || null}
                    status="in_progress"
                  />
                  <span className="text-xs text-gray-600 font-medium whitespace-nowrap">Self Drying</span>
                </>
              ) : duvet.status === 'waiting_pickup' ? (
                <>
                  <span className="text-sm">⏳</span>
                  <span className="text-xs text-gray-600 font-medium whitespace-nowrap">Waiting</span>
                </>
              ) : duvet.status === 'waiting_optimal_time' ? (
                <>
                  <span className="text-sm">⏰</span>
                  <CountdownTimer 
                    startTime={duvetSunDryingStatus?.[duvet.id]?.start_time || null}
                  />
                </>
              ) : null}
            </div>
          </div>
        )}
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
            {lastCleanDate && (
              <div className="flex items-center space-x-1">
                <span className="text-gray-600">Last cleaned:</span>
                <span className="text-black font-medium">
                  {(() => {
                    const cleanDate = new Date(lastCleanDate)
                    const today = new Date()
                    const diffTime = Math.abs(today.getTime() - cleanDate.getTime())
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
              className="flex items-center justify-center sm:space-x-1.5 px-3 py-2.5 sm:px-4 bg-gray-700 text-white rounded-xl hover:bg-gray-800 text-sm font-semibold shadow-md"
              title="View history"
            >
              <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">History</span>
            </button>
            
            {/* Action Button */}
            {(() => {
              // Show cancel button for pending help drying orders
              if (duvet.status === 'help_drying' && helpDryingData && helpDryingData.order?.status === 'pending' && onCancelHelpDryingOrder) {
                return (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onCancelHelpDryingOrder(duvet)
                    }}
                    className="px-3 py-1.5 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                )
              }
              
              // Show dry it button for normal status during sunrise time
              if (duvet.status === 'normal' && isSunriseTime) {
                return (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSunDryingService(duvet)
                    }}
                    className="flex items-center justify-center sm:space-x-1.5 px-3 py-2.5 sm:px-4 bg-black text-white rounded-xl hover:bg-gray-800 text-sm font-semibold shadow-md"
                  >
                    <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="hidden sm:inline">Dry it</span>
                  </button>
                )
              }
              
              // Show night time indicator for normal status during night
              if (duvet.status === 'normal' && !isSunriseTime) {
                return (
                  <div className="flex items-center space-x-1 text-sm">
                    <span>🌙</span>
                    <span className="text-gray-500">Night Time</span>
                  </div>
                )
              }
              
              // No action button for other states (status shown in image area)
              return null
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}