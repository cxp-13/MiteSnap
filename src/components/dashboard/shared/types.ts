// Re-export types from database module
export type { Duvet, Address, Order } from '@/lib/database'
export type { WeatherAnalysisResult } from '@/lib/weather-analysis'
export type { SunDryingAnalysisResult } from '@/lib/sun-drying-ai'
export type { CleanHistoryRecord } from '@/lib/clean-history'

// Re-export geolocation and geocoding types
export type { GeolocationPosition, GeolocationError, GeolocationOptions } from '@/lib/geolocation'
export type { GeocodingResult } from '@/lib/geocoding'

// Additional dashboard-specific types
export interface User {
  id: string
  name?: string
}

export type TabType = 'duvets' | 'orders' | 'addresses'

export interface DuvetFormData {
  name: string
  material: string
  cleaningHistory: 'new' | 'long_time' | 'recent'
  thickness: string
  address_id: string | null
}

export interface AddressFormData {
  country?: string
  state?: string
  city?: string
  district?: string
  road?: string
  house_number?: string
  neighbourhood?: string
  longitude?: number
  latitude?: number
  is_default?: boolean
  floor_number?: number
  has_elevator?: boolean
  // Legacy fields for backward compatibility
  apartment?: string
  unit?: string
  fullAddress?: string
  isDefault?: boolean
}

// Weather and location types
export interface Location {
  latitude: number
  longitude: number
  address?: string
}

export interface Weather {
  temperature: number
  humidity: number
}

// Analysis result types
export interface AnalysisResult {
  material: string
  miteScore: number
  reasons: string[]
  imageUrl: string
}

// Modal step types
export type ModalStep = 1 | 2 | 3 | 4
export type SunDryStep = 1 | 2 | 3