import { useState } from 'react'
import DuvetCard from './DuvetCard'
import DuvetHistoryModal from './DuvetHistoryModal'
import { Duvet, CleanHistoryRecord, Address } from './shared/types'

interface DuvetListProps {
  duvets: Duvet[]
  duvetSunDryingStatus: Record<string, CleanHistoryRecord | null>
  isLoading: boolean
  onSunDryingService: (duvet: Duvet) => void
  addresses?: Address[]
  helpDryingData?: Record<string, { order: { id: string; status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'; quilt_id: string }; cleanHistory: CleanHistoryRecord | null }>
  onCancelHelpDryingOrder?: (duvet: Duvet) => void
}

export default function DuvetList({
  duvets,
  duvetSunDryingStatus,
  isLoading,
  onSunDryingService,
  addresses,
  helpDryingData,
  onCancelHelpDryingOrder
}: DuvetListProps) {
  const [selectedDuvet, setSelectedDuvet] = useState<Duvet | null>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)

  const handleDuvetClick = (duvet: Duvet) => {
    setSelectedDuvet(duvet)
    setShowHistoryModal(true)
  }

  const handleCloseHistory = () => {
    setShowHistoryModal(false)
    setSelectedDuvet(null)
  }
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        <span className="ml-3 text-gray-600">Loading your duvets...</span>
      </div>
    )
  }

  return (
    <div>

      {duvets.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-12 text-center">
          <div className="space-y-4">
            <div className="text-6xl text-gray-400">🛏️</div>
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No duvets yet</h3>
              <p className="text-gray-500">Add your first duvet to start tracking mite levels</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {duvets.map((duvet) => (
            <DuvetCard
              key={duvet.id}
              duvet={duvet}
              onSunDryingService={onSunDryingService}
              onDuvetClick={handleDuvetClick}
              addresses={addresses}
              helpDryingData={helpDryingData?.[duvet.id]}
              onCancelHelpDryingOrder={onCancelHelpDryingOrder}
              duvetSunDryingStatus={duvetSunDryingStatus}
            />
          ))}
        </div>
      )}

      {/* History Modal */}
      {selectedDuvet && (
        <DuvetHistoryModal
          duvet={selectedDuvet}
          isOpen={showHistoryModal}
          onClose={handleCloseHistory}
        />
      )}
    </div>
  )
}