import { useState, useEffect, useCallback } from 'react'
import { getUserDuvets, deleteDuvet, type Duvet } from '@/lib/database'
import { uploadDuvetImage } from '@/lib/storage'
import { analyzeDuvet } from '@/lib/ai-analysis'
import { getCurrentSunDryingStatus, type CleanHistoryRecord } from '@/lib/clean-history'
import { checkDuvetLimit, type SubscriptionTier } from '@/lib/subscription'

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

  // Subscription state
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('basic')
  const [canCreateDuvet, setCanCreateDuvet] = useState(true)
  const [maxDuvets, setMaxDuvets] = useState(1)

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

  // Check subscription limits
  const checkSubscriptionLimits = useCallback(async (currentDuvetCount: number) => {
    try {
      const limitCheck = await checkDuvetLimit(currentDuvetCount)
      setSubscriptionTier(limitCheck.tier)
      setCanCreateDuvet(limitCheck.canCreate)
      setMaxDuvets(limitCheck.maxAllowed)
      return limitCheck
    } catch (error) {
      console.error('Error checking subscription limits:', error)
      // Fallback: if no duvets exist, user should be able to create at least one
      const canCreate = currentDuvetCount === 0 ? true : false
      setSubscriptionTier('basic')
      setCanCreateDuvet(canCreate)
      setMaxDuvets(1)
      return { canCreate, tier: 'basic' as SubscriptionTier, maxAllowed: 1 }
    }
  }, [])

  // Load duvets only
  const loadDuvets = useCallback(async () => {
    if (!userId) return
    
    setIsLoadingDuvets(true)
    try {
      const userDuvets = await getUserDuvets(userId)
      setDuvets(userDuvets)
      
      // Check subscription limits
      await checkSubscriptionLimits(userDuvets.length)
      
      // Also refresh sun drying status for all duvets and check for expired sessions
      if (userDuvets.length > 0) {
        const statusPromises = userDuvets.map(async (duvet) => {

          
          // Then get the current status
          const status = await getCurrentSunDryingStatus(duvet.id)
          return { duvetId: duvet.id, status }
        })
        
        const statusResults = await Promise.all(statusPromises)
        const statusMap: Record<string, CleanHistoryRecord | null> = {}
        statusResults.forEach(({ duvetId, status }) => {
          statusMap[duvetId] = status
        })
        setDuvetSunDryingStatus(statusMap)
        
        // Reload duvets to get updated mite scores if any were changed
        const updatedDuvets = await getUserDuvets(userId)
        setDuvets(updatedDuvets)
      }
    } catch (error) {
      console.error('Error loading duvets:', error)
    } finally {
      setIsLoadingDuvets(false)
    }
  }, [userId, checkSubscriptionLimits])

  // Load sun-drying status for specific duvet or all duvets
  const refreshSunDryingStatus = useCallback(async (duvetIds?: string[]) => {
    if (!userId) return
    
    const targetDuvets = duvetIds || duvets.map(d => d.id)
    
    if (targetDuvets.length === 0) return
    
    try {
      const statusPromises = targetDuvets.map(async (duvetId) => {

        
        // Then get the current status
        const status = await getCurrentSunDryingStatus(duvetId)
        return { duvetId, status }
      })
      
      const statusResults = await Promise.all(statusPromises)
      const statusMap: Record<string, CleanHistoryRecord | null> = { ...duvetSunDryingStatus }
      statusResults.forEach(({ duvetId, status }) => {
        statusMap[duvetId] = status
      })
      setDuvetSunDryingStatus(statusMap)
      
      // If any duvet ids were specified, reload those duvets to get updated mite scores
      if (duvetIds && duvetIds.length > 0) {
        await loadDuvets()
      }
    } catch (error) {
      console.error('Error refreshing sun drying status:', error)
    }
  }, [userId, duvets, duvetSunDryingStatus, loadDuvets])

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

   
  const handleStartAnalysis = useCallback(async () => {
    if (!selectedPhoto || !userId) return

    try {
      setCurrentStep(2)
      setCurrentAnalysisStep(0)
      
      // Step 1: Upload image
      setStepCompleted([false, false, false])
      const uploadResult = await uploadDuvetImage(selectedPhoto, userId, 'duvets')
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
      const response = await fetch('/api/create-duvet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: duvetData.name,
          material: duvetData.material,
          miteScore: analysisResult.miteScore,
          cleaningHistory: duvetData.cleaningHistory,
          thickness: duvetData.thickness,
          imageUrl: analysisResult.imageUrl,
          addressId: duvetData.address_id
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create duvet')
      }
      
      setCurrentStep(4)
      await loadDuvets()
    } catch (error) {
      console.error('Error creating duvet:', error)
      throw error
    }
  }, [userId, analysisResult, loadDuvets])

  // Delete duvet
  const handleDeleteDuvet = useCallback(async (duvet: Duvet) => {
    if (!duvet.id) return false

    try {
      const success = await deleteDuvet(duvet.id)
      if (success) {
        await loadDuvets()
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting duvet:', error)
      return false
    }
  }, [loadDuvets])

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
    
    // Subscription state
    subscriptionTier,
    canCreateDuvet,
    maxDuvets,
    
    // Actions
    loadDuvets,
    refreshSunDryingStatus,
    handlePhotoUpload,
    handleStartAnalysis,
    handleCreateDuvet,
    handleDeleteDuvet,
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