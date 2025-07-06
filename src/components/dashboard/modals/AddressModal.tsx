import { useState, useEffect, useCallback, useRef } from 'react'
import { Address, AddressFormData, GeolocationPosition, GeolocationError, GeocodingResult } from '../shared/types'
import { getCurrentPosition, getLocationErrorMessage } from '@/lib/geolocation'
import { reverseGeocode } from '@/lib/geocoding'

interface AddressModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (addressData: AddressFormData) => Promise<void>
  editingAddress?: Address | null
  title?: string
}

export default function AddressModal({
  isOpen,
  onClose,
  onSave,
  editingAddress,
  title = 'Add New Address'
}: AddressModalProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    country: '',
    state: '',
    city: '',
    district: '',
    road: '',
    house_number: '',
    neighbourhood: '',
    longitude: undefined,
    latitude: undefined,
    is_default: false
  })

  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const userModifiedFieldsRef = useRef<Set<keyof AddressFormData>>(new Set())

  // Initialize form data when editing
  useEffect(() => {
    if (!isOpen) return

    // Reset user modified fields tracking
    userModifiedFieldsRef.current = new Set()

    if (editingAddress) {
      setFormData({
        country: editingAddress.country || '',
        state: editingAddress.state || '',
        city: editingAddress.city || '',
        district: editingAddress.district || '',
        road: editingAddress.road || '',
        house_number: editingAddress.house_number || '',
        neighbourhood: editingAddress.neighbourhood || '',
        longitude: editingAddress.longitude || undefined,
        latitude: editingAddress.latitude || undefined,
        is_default: editingAddress.is_default || false,
        floor_number: editingAddress.floor_number || undefined,
        has_elevator: editingAddress.has_elevator ?? undefined
      })
    } else {
      // Reset form for new address
      setFormData({
        country: '',
        state: '',
        city: '',
        district: '',
        road: '',
        house_number: '',
        neighbourhood: '',
        longitude: undefined,
        latitude: undefined,
        is_default: false,
        floor_number: undefined,
        has_elevator: undefined
      })
    }
    setLocationError(null)
  }, [editingAddress, isOpen])

  const handleGetCurrentLocation = useCallback(async () => {
    setIsGettingLocation(true)
    setLocationError(null)

    try {
      // Get current position
      const position: GeolocationPosition = await getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      })

      setIsGeocoding(true)

      // Reverse geocode to get address details
      const geocodingResult: GeocodingResult | null = await reverseGeocode(
        position.latitude,
        position.longitude
      )

      if (geocodingResult) {
        // Clean up state/province names to remove common suffixes
        let cleanState = geocodingResult.state || ''
        if (cleanState.toLowerCase().includes('province')) {
          cleanState = cleanState.replace(/\s*province$/i, '')
        }
        if (cleanState.toLowerCase().includes('autonomous region')) {
          cleanState = cleanState.replace(/\s*autonomous region$/i, '')
        }

        setFormData(prev => {
          // Only update fields that the user hasn't manually modified
          const newData = { ...prev }
          
          if (!userModifiedFieldsRef.current.has('country')) newData.country = geocodingResult.country || ''
          if (!userModifiedFieldsRef.current.has('state')) newData.state = cleanState
          if (!userModifiedFieldsRef.current.has('city')) newData.city = geocodingResult.city || ''
          if (!userModifiedFieldsRef.current.has('district')) newData.district = geocodingResult.district || ''
          if (!userModifiedFieldsRef.current.has('road')) newData.road = geocodingResult.road || ''
          if (!userModifiedFieldsRef.current.has('house_number')) newData.house_number = geocodingResult.house_number || ''
          if (!userModifiedFieldsRef.current.has('neighbourhood')) newData.neighbourhood = geocodingResult.neighbourhood || ''
          
          // Always update coordinates as they come from GPS
          newData.longitude = geocodingResult.longitude
          newData.latitude = geocodingResult.latitude
          
          return newData
        })
      } else {
        // If geocoding fails, just set coordinates
        setFormData(prev => ({
          ...prev,
          longitude: position.longitude,
          latitude: position.latitude
        }))
        setLocationError('Location found, but address details could not be retrieved')
      }
    } catch (error) {
      const geolocationError = error as GeolocationError
      setLocationError(getLocationErrorMessage(geolocationError))
    } finally {
      setIsGettingLocation(false)
      setIsGeocoding(false)
    }
  }, [])

  // Auto-fetch location for new addresses
  useEffect(() => {
    if (isOpen && !editingAddress) {
      handleGetCurrentLocation()
    }
  }, [isOpen, editingAddress, handleGetCurrentLocation])

  const handleInputChange = (field: keyof AddressFormData, value: string | boolean | number | undefined) => {
    console.log(`🔄 AddressModal handleInputChange: ${field} = ${value} (type: ${typeof value})`)
    
    // Track that this field was manually modified by user
    userModifiedFieldsRef.current.add(field)
    
    // Special logging for has_elevator field
    if (field === 'has_elevator') {
      console.log('🏗️ AddressModal ELEVATOR FIELD CHANGE:', {
        field,
        value,
        type: typeof value,
        isTrue: value === true,
        isFalse: value === false,
        isUndefined: value === undefined,
        isNull: value === null
      })
    }
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      }
      console.log('📝 AddressModal formData updated:', newData)
      
      // Special logging for has_elevator field
      if (field === 'has_elevator') {
        console.log('🏗️ AddressModal ELEVATOR IN NEW FORM DATA:', {
          has_elevator: newData.has_elevator,
          type: typeof newData.has_elevator
        })
      }
      
      return newData
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🚀 AddressModal handleSubmit called with formData:', formData)
    console.log('🏗️ AddressModal has_elevator value:', formData.has_elevator, 'type:', typeof formData.has_elevator)
    
    if (!formData.city) {
      setLocationError('Please provide at least a city')
      return
    }

    if (formData.has_elevator === undefined) {
      setLocationError('Please specify if the building has an elevator')
      return
    }

    console.log('✅ AddressModal validation passed, calling onSave with:', formData)
    setIsSaving(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving address:', error)
      setLocationError('Failed to save address. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }


  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-5xl shadow-2xl max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Loading State - Show when fetching location */}
          {(isGettingLocation || isGeocoding) && (
            <div className="text-center py-12">
              <div className="inline-flex items-center space-x-3 bg-blue-50 px-6 py-4 rounded-xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '150ms'}}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '300ms'}}></div>
                </div>
                <span className="text-blue-700 font-medium">
                  {isGettingLocation ? 'Getting your location...' : 'Processing address details...'}
                </span>
              </div>
            </div>
          )}

          {/* Error State */}
          {locationError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-red-700 text-sm font-medium">{locationError}</p>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Address Details Form - Only show when not loading */}
          {!(isGettingLocation || isGeocoding) && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Address Details</h4>
                <p className="text-sm text-gray-500">Edit the detected information as needed</p>
              </div>
              
              {/* Compact Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Row 1 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">House Number</label>
                  <input
                    type="text"
                    value={formData.house_number || ''}
                    onChange={(e) => handleInputChange('house_number', e.target.value)}
                    className="w-full bg-gray-100 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-gray-50 transition-all"
                    placeholder=""
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Road/Street</label>
                  <input
                    type="text"
                    value={formData.road || ''}
                    onChange={(e) => handleInputChange('road', e.target.value)}
                    className="w-full bg-gray-100 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-gray-50 transition-all"
                    placeholder=""
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Neighbourhood</label>
                  <input
                    type="text"
                    value={formData.neighbourhood || ''}
                    onChange={(e) => handleInputChange('neighbourhood', e.target.value)}
                    className="w-full bg-gray-100 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-gray-50 transition-all"
                    placeholder=""
                  />
                </div>

                {/* Row 2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <input
                    type="text"
                    value={formData.district || ''}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    className="w-full bg-gray-100 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-gray-50 transition-all"
                    placeholder=""
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full bg-gray-100 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-gray-50 transition-all"
                    placeholder=""
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                  <input
                    type="text"
                    value={formData.state || ''}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full bg-gray-100 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-gray-50 transition-all"
                    placeholder=""
                  />
                </div>
              </div>

              {/* Row 3 - Country */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.country || ''}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full bg-gray-100 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-gray-50 transition-all"
                    placeholder=""
                  />
                </div>
              </div>

              {/* Row 4 - Floor and Elevator Info for Help-Drying Service */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-3">Building Information (For Help-Drying Service)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Floor Number</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.floor_number || ''}
                      onChange={(e) => handleInputChange('floor_number', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full bg-gray-100 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-gray-50 transition-all"
                      placeholder=""
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Building Has Elevator <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-6 mt-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="has_elevator"
                          checked={formData.has_elevator === true}
                          onChange={() => handleInputChange('has_elevator', true)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="has_elevator"
                          checked={formData.has_elevator === false}
                          onChange={() => handleInputChange('has_elevator', false)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">No</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Default Address Option - Only show when not loading */}
          {!(isGettingLocation || isGeocoding) && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default || false}
                  onChange={(e) => handleInputChange('is_default', e.target.checked)}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-amber-300 rounded"
                />
                <label htmlFor="is_default" className="text-sm font-medium text-amber-900">
                  Set as default address
                </label>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !formData.city || formData.has_elevator === undefined || (isGettingLocation || isGeocoding)}
              className="flex-1 px-4 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 focus:outline-none disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
            >
              {isSaving ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Address'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}