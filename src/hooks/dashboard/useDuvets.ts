import { useState, useEffect, useCallback } from 'react'
import { createDuvet, getUserDuvets, type Duvet } from '@/lib/database'
import { uploadDuvetImage } from '@/lib/storage'
import { analyzeDuvet } from '@/lib/ai-analysis'
import { getCurrentSunDryingStatus, type CleanHistoryRecord } from '@/lib/clean-history'

export interface DuvetFormData {
  name: string
  material: string
  cleaningHistory: 'new' | 'long_time' | 'recent'
  thickness: string
  address_id: string | null
}

export interface AnalysisResult {
  material: string
  miteScore: number
  reasons: string[]
  imageUrl: string
}

export function useDuvets(userId: string | undefined) {
  // Duvets state
  const [duvets, setDuvets] = useState<Duvet[]>([])
  const [isLoadingDuvets, setIsLoadingDuvets] = useState(false)
  const [duvetSunDryingStatus, setDuvetSunDryingStatus] = useState<Record<string, CleanHistoryRecord | null>>({})

  // New duvet modal state
  const [showNewDuvetModal, setShowNewDuvetModal] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [duvetName, setDuvetName] = useState('')
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState(0)
  const [stepCompleted, setStepCompleted] = useState<boolean[]>([false, false, false])
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<string>('')
  const [cleaningHistory, setCleaningHistory] = useState<'new' | 'long_time' | 'recent'>('new')
  const [duvetThickness, setDuvetThickness] = useState('Medium')
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)

  // Load duvets
  const loadDuvets = useCallback(async () => {
    if (!userId) return
    
    setIsLoadingDuvets(true)
    try {
      const userDuvets = await getUserDuvets(userId)
      setDuvets(userDuvets)
      
      // Load sun-drying status for each duvet
      const statusPromises = userDuvets.map(async (duvet) => {
        const status = await getCurrentSunDryingStatus(duvet.id)
        return { duvetId: duvet.id, status }
      })
      
      const statusResults = await Promise.all(statusPromises)
      const statusMap: Record<string, CleanHistoryRecord | null> = {}
      statusResults.forEach(({ duvetId, status }) => {
        statusMap[duvetId] = status
      })
      setDuvetSunDryingStatus(statusMap)
    } catch (error) {
      console.error('Error loading duvets:', error)
    } finally {
      setIsLoadingDuvets(false)
    }
  }, [userId])

  // Load duvets on mount and when userId changes
  useEffect(() => {
    loadDuvets()
  }, [loadDuvets])

  // Photo upload handler
  const handlePhotoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedPhoto(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  // Start analysis
  const handleStartAnalysis = useCallback(async () => {
    if (!selectedPhoto || !userId) return

    try {
      setCurrentStep(2)
      setCurrentAnalysisStep(0)
      
      // Step 1: Upload image
      setStepCompleted([false, false, false])
      const uploadResult = await uploadDuvetImage(selectedPhoto, userId)
      if (!uploadResult) {
        throw new Error('Failed to upload image')
      }
      const imageUrl = uploadResult.url
      setCurrentAnalysisStep(1)
      setStepCompleted([true, false, false])
      
      // Step 2: AI Analysis
      const analysis = await analyzeDuvet(imageUrl)
      setCurrentAnalysisStep(2)
      setStepCompleted([true, true, false])
      
      // Step 3: Complete
      if (analysis) {
        setAnalysisResult({
          material: analysis.material,
          miteScore: analysis.miteScore,
          reasons: analysis.reasons,
          imageUrl
        })
        setSelectedMaterial(analysis.material)
        setCurrentAnalysisStep(3)
        setStepCompleted([true, true, true])
        setCurrentStep(3)
      } else {
        // Analysis failed - provide fallback
        setAnalysisResult({
          material: 'Cotton',
          miteScore: 50,
          reasons: ['AI analysis unavailable, using default values'],
          imageUrl
        })
        setSelectedMaterial('Cotton')
        setCurrentAnalysisStep(3)
        setStepCompleted([true, true, true])
        setCurrentStep(3)
      }
    } catch (error) {
      console.error('Error during analysis:', error)
      alert('Analysis failed. Please try again.')
    }
  }, [selectedPhoto, userId])

  // Create duvet
  const handleCreateDuvet = useCallback(async (duvetData: DuvetFormData) => {
    if (!userId || !analysisResult) return

    try {
      await createDuvet(
        userId,
        duvetData.name,
        duvetData.material,
        analysisResult.miteScore,
        duvetData.cleaningHistory,
        duvetData.thickness,
        analysisResult.imageUrl,
        duvetData.address_id
      )
      
      setCurrentStep(4)
      await loadDuvets()
    } catch (error) {
      console.error('Error creating duvet:', error)
      throw error
    }
  }, [userId, analysisResult, loadDuvets])

  // Close modal and reset state
  const handleCloseModal = useCallback(() => {
    setShowNewDuvetModal(false)
    setSelectedPhoto(null)
    setPhotoPreview(null)
    setDuvetName('')
    setCurrentAnalysisStep(0)
    setStepCompleted([false, false, false])
    setAnalysisResult(null)
    setSelectedMaterial('')
    setCleaningHistory('new')
    setDuvetThickness('Medium')
    setSelectedAddressId(null)
    setCurrentStep(1)
  }, [])

  return {
    // State
    duvets,
    isLoadingDuvets,
    duvetSunDryingStatus,
    showNewDuvetModal,
    selectedPhoto,
    photoPreview,
    duvetName,
    currentAnalysisStep,
    stepCompleted,
    analysisResult,
    selectedMaterial,
    cleaningHistory,
    duvetThickness,
    selectedAddressId,
    currentStep,
    
    // Actions
    loadDuvets,
    handlePhotoUpload,
    handleStartAnalysis,
    handleCreateDuvet,
    handleCloseModal,
    setShowNewDuvetModal,
    setDuvetName,
    setSelectedMaterial,
    setCleaningHistory,
    setDuvetThickness,
    setSelectedAddressId,
    setCurrentStep
  }
}