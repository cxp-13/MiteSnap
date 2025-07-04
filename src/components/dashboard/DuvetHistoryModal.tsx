import { useEffect, useState, useCallback } from 'react'
import { getDuvetSunDryHistory, type CleanHistoryRecord } from '@/lib/clean-history'
import { Duvet } from './shared/types'

interface DuvetHistoryModalProps {
  duvet: Duvet
  isOpen: boolean
  onClose: () => void
}

export default function DuvetHistoryModal({ duvet, isOpen, onClose }: DuvetHistoryModalProps) {
  const [historyRecords, setHistoryRecords] = useState<CleanHistoryRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      const records = await getDuvetSunDryHistory(duvet.id)
      setHistoryRecords(records)
    } catch (error) {
      console.error('Error loading duvet history:', error)
    } finally {
      setIsLoading(false)
    }
  }, [duvet])

  useEffect(() => {
    if (isOpen && duvet.id) {
      loadHistory()
    }
  }, [duvet, loadHistory, isOpen])

  const formatDuration = (startTime: string, endTime: string | null) => {
    if (!endTime) return 'In progress'
    
    const start = new Date(startTime)
    const end = new Date(endTime)
    const duration = end.getTime() - start.getTime()
    const hours = Math.floor(duration / (1000 * 60 * 60))
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{duvet.name}</h2>
              <p className="text-gray-600">Sun Drying History</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : historyRecords.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">☀️</div>
              <p className="text-gray-500 text-lg">No sun drying history yet</p>
              <p className="text-gray-400 text-sm mt-2">Start sun drying to see records here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historyRecords.map((record, index) => (
                <div
                  key={record.id}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">☀️</span>
                        <span className="font-medium text-gray-900">
                          Sun Drying Session #{historyRecords.length - index}
                        </span>
                        {!record.end_time && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                            In Progress
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">
                            <span className="font-medium">Started:</span> {record.start_time ? formatDate(record.start_time) : 'Unknown'}
                          </p>
                          {record.end_time && (
                            <p className="text-gray-600">
                              <span className="font-medium">Ended:</span> {formatDate(record.end_time)}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <p className="text-gray-600">
                            <span className="font-medium">Duration:</span> {record.start_time ? formatDuration(record.start_time, record.end_time) : 'N/A'}
                          </p>
                          {record.before_mite_score && record.after_mite_score && (
                            <p className="text-gray-600">
                              <span className="font-medium">Mite Score:</span> {record.before_mite_score} → {record.after_mite_score}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}