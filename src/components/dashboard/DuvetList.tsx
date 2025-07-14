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
  onDeleteDuvet?: (duvet: Duvet) => void
}

export default function DuvetList({
  duvets,
  duvetSunDryingStatus,
  isLoading,
  onSunDryingService,
  addresses,
  helpDryingData,
  onCancelHelpDryingOrder,
  onDeleteDuvet
}: DuvetListProps) {
  const [selectedDuvet, setSelectedDuvet] = useState<Duvet | null>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingDuvet, setDeletingDuvet] = useState<Duvet | null>(null)

  const handleDuvetClick = (duvet: Duvet) => {
    setSelectedDuvet(duvet)
    setShowHistoryModal(true)
  }

  const handleCloseHistory = () => {
    setShowHistoryModal(false)
    setSelectedDuvet(null)
  }

  const handleDeleteDuvet = (duvet: Duvet) => {
    setDeletingDuvet(duvet)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteDuvet = async () => {
    if (deletingDuvet && onDeleteDuvet) {
      await onDeleteDuvet(deletingDuvet)
      setShowDeleteConfirm(false)
      setDeletingDuvet(null)
    }
  }

  const cancelDeleteDuvet = () => {
    setShowDeleteConfirm(false)
    setDeletingDuvet(null)
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
              onDeleteDuvet={onDeleteDuvet ? handleDeleteDuvet : undefined}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingDuvet && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Duvet</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete &quot;{deletingDuvet.name}&quot;? This action cannot be undone and will remove all associated history.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={cancelDeleteDuvet}
                className="flex-1 px-4 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteDuvet}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/30 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}