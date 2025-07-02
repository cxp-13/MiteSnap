// OpenCage Geocoding API integration

export interface GeocodingResult {
  country: string | null
  state: string | null
  city: string | null
  district: string | null
  road: string | null
  house_number: string | null
  neighbourhood: string | null
  address_line: string | null
  latitude: number
  longitude: number
}

export interface OpenCageResponse {
  documentation: string
  licenses: Array<{
    name: string
    url: string
  }>
  rate: {
    limit: number
    remaining: number
    reset: number
  }
  results: Array<{
    annotations: Record<string, unknown>
    bounds: {
      northeast: { lat: number; lng: number }
      southwest: { lat: number; lng: number }
    }
    components: {
      ISO_3166_1_alpha_2: string
      ISO_3166_1_alpha_3: string
      ISO_3166_2: string[]
      _category: string
      _normalized_city: string
      _type: string
      borough?: string
      city?: string
      continent: string
      country: string
      country_code: string
      house_number?: string
      neighbourhood?: string
      political_union?: string
      postcode?: string
      road?: string
      state?: string
      state_code?: string
      suburb?: string
      [key: string]: unknown
    }
    confidence: number
    distance_from_q: {
      meters: number
    }
    formatted: string
    geometry: {
      lat: number
      lng: number
    }
  }>
  status: {
    code: number
    message: string
  }
  stay_informed: {
    blog: string
    mastodon: string
  }
  thanks: string
  timestamp: {
    created_http: string
    created_unix: number
  }
  total_results: number
}

const OPENCAGE_API_KEY = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY || process.env.OPENCAGE_API_KEY
const OPENCAGE_BASE_URL = 'https://api.opencagedata.com/geocode/v1/json'

export async function reverseGeocode(
  latitude: number, 
  longitude: number
): Promise<GeocodingResult | null> {
  try {
    if (!OPENCAGE_API_KEY) {
      console.error('OpenCage API key is not configured')
      return null
    }

    const url = `${OPENCAGE_BASE_URL}?q=${latitude},${longitude}&key=${OPENCAGE_API_KEY}&language=en&pretty=1`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data: OpenCageResponse = await response.json()
    
    if (data.status.code !== 200) {
      throw new Error(`API error: ${data.status.message}`)
    }
    
    if (data.results.length === 0) {
      throw new Error('No results found for the given coordinates')
    }
    
    const result = data.results[0]
    const components = result.components
    
    return {
      country: components.country || null,
      state: components.state || null,
      city: components.city || components._normalized_city || null,
      district: components.borough || components.suburb || null,
      road: components.road || null,
      house_number: components.house_number || null,
      neighbourhood: components.neighbourhood || null,
      address_line: result.formatted || null,
      latitude: result.geometry.lat,
      longitude: result.geometry.lng
    }
  } catch (error) {
    console.error('Error in reverse geocoding:', error)
    return null
  }
}

export async function forwardGeocode(address: string): Promise<GeocodingResult | null> {
  try {
    if (!OPENCAGE_API_KEY) {
      console.error('OpenCage API key is not configured')
      return null
    }

    const encodedAddress = encodeURIComponent(address)
    const url = `${OPENCAGE_BASE_URL}?q=${encodedAddress}&key=${OPENCAGE_API_KEY}&language=en&pretty=1&limit=1`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data: OpenCageResponse = await response.json()
    
    if (data.status.code !== 200) {
      throw new Error(`API error: ${data.status.message}`)
    }
    
    if (data.results.length === 0) {
      throw new Error('No results found for the given address')
    }
    
    const result = data.results[0]
    const components = result.components
    
    return {
      country: components.country || null,
      state: components.state || null,
      city: components.city || components._normalized_city || null,
      district: components.borough || components.suburb || null,
      road: components.road || null,
      house_number: components.house_number || null,
      neighbourhood: components.neighbourhood || null,
      address_line: result.formatted || null,
      latitude: result.geometry.lat,
      longitude: result.geometry.lng
    }
  } catch (error) {
    console.error('Error in forward geocoding:', error)
    return null
  }
}

export function formatAddress(geocodingResult: GeocodingResult): string {
  if (geocodingResult.address_line) {
    return geocodingResult.address_line
  }
  
  const parts: string[] = []
  
  if (geocodingResult.house_number) {
    parts.push(geocodingResult.house_number)
  }
  
  if (geocodingResult.road) {
    parts.push(geocodingResult.road)
  }
  
  if (geocodingResult.neighbourhood) {
    parts.push(geocodingResult.neighbourhood)
  }
  
  if (geocodingResult.district) {
    parts.push(geocodingResult.district)
  }
  
  if (geocodingResult.city) {
    parts.push(geocodingResult.city)
  }
  
  if (geocodingResult.state) {
    parts.push(geocodingResult.state)
  }
  
  if (geocodingResult.country) {
    parts.push(geocodingResult.country)
  }
  
  return parts.join(', ')
}