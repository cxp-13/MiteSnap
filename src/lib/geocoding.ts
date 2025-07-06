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
    
    // For Chinese addresses, map the administrative levels correctly
    let city: string | null = null
    let district: string | null = null
    
    if (components.country === 'China') {
      // In China: state = province, city = prefecture-level city, district = county/district
      // OpenCage might map these incorrectly, so we need to check multiple fields
      
      console.log('🌍 Geocoding China - Raw components:', {
        city: components.city,
        _normalized_city: components._normalized_city,
        county: components.county,
        district: components.district,
        suburb: components.suburb,
        borough: components.borough,
        state: components.state
      })
      
      city = (components.city as string) || (components._normalized_city as string) || (components.county as string) || null
      district = (components.district as string) || (components.county as string) || (components.suburb as string) || (components.borough as string) || null
      
      console.log('🌍 Geocoding China - Initial mapping:', { city, district })
      
      // Special handling: if city contains "District" it's likely the district level
      if (city && typeof city === 'string' && city.includes('District')) {
        district = city
        city = (components.state_district as string) || (components.city_district as string) || null
        console.log('🌍 Geocoding China - City contains District, remapped:', { city, district })
      }
      
      // For Shenzhen specifically: if we get "Bao'an District" as city, fix it
      if (city && typeof city === 'string' && city.toLowerCase().includes("bao'an")) {
        district = city
        city = "Shenzhen"
        console.log('🌍 Geocoding China - Detected Bao\'an, fixed to Shenzhen:', { city, district })
      }
      
      // For Shenzhen area: if district contains Bao'an but city is not Shenzhen, fix it
      if (district && typeof district === 'string' && district.toLowerCase().includes("bao'an") && (!city || city !== "Shenzhen")) {
        city = "Shenzhen"
        district = "Bao'an District"
        console.log('🌍 Geocoding China - District contains Bao\'an, fixed city to Shenzhen:', { city, district })
      }
      
      // Remove sub-district level information (街道, Sub-District, Subdistrict)
      if (district && typeof district === 'string') {
        const originalDistrict = district
        district = district.replace(/\s*(Sub-?District|Street|街道)$/i, '').trim()
        
        console.log('🌍 Geocoding China - Removed sub-district suffix:', { originalDistrict, cleanedDistrict: district })
        
        // If district becomes empty after removing sub-district info, use other components
        if (!district || district.length === 0) {
          district = (components.suburb as string) || (components.borough as string) || null
          console.log('🌍 Geocoding China - District empty after cleanup, using fallback:', district)
        }
      }
      
      console.log('🌍 Geocoding China - Final result:', { city, district })
    } else {
      // For non-Chinese addresses, use the original mapping
      city = (components.city as string) || (components._normalized_city as string) || null
      district = (components.borough as string) || (components.suburb as string) || null
    }

    return {
      country: components.country || null,
      state: components.state || null,
      city: city,
      district: district,
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
    
    // For Chinese addresses, map the administrative levels correctly
    let city: string | null = null
    let district: string | null = null
    
    if (components.country === 'China') {
      // In China: state = province, city = prefecture-level city, district = county/district
      
      console.log('🌍 Forward Geocoding China - Raw components:', {
        city: components.city,
        _normalized_city: components._normalized_city,
        county: components.county,
        district: components.district,
        suburb: components.suburb,
        borough: components.borough,
        state: components.state
      })
      
      city = (components.city as string) || (components._normalized_city as string) || (components.county as string) || null
      district = (components.district as string) || (components.county as string) || (components.suburb as string) || (components.borough as string) || null
      
      console.log('🌍 Forward Geocoding China - Initial mapping:', { city, district })
      
      // Special handling: if city contains "District" it's likely the district level
      if (city && typeof city === 'string' && city.includes('District')) {
        district = city
        city = (components.state_district as string) || (components.city_district as string) || null
        console.log('🌍 Forward Geocoding China - City contains District, remapped:', { city, district })
      }
      
      // For Shenzhen specifically: if we get "Bao'an District" as city, fix it
      if (city && typeof city === 'string' && city.toLowerCase().includes("bao'an")) {
        district = city
        city = "Shenzhen"
        console.log('🌍 Forward Geocoding China - Detected Bao\'an, fixed to Shenzhen:', { city, district })
      }
      
      // For Shenzhen area: if district contains Bao'an but city is not Shenzhen, fix it
      if (district && typeof district === 'string' && district.toLowerCase().includes("bao'an") && (!city || city !== "Shenzhen")) {
        city = "Shenzhen"
        district = "Bao'an District"
        console.log('🌍 Forward Geocoding China - District contains Bao\'an, fixed city to Shenzhen:', { city, district })
      }
      
      // Remove sub-district level information (街道, Sub-District, Subdistrict)
      if (district && typeof district === 'string') {
        const originalDistrict = district
        district = district.replace(/\s*(Sub-?District|Street|街道)$/i, '').trim()
        
        console.log('🌍 Forward Geocoding China - Removed sub-district suffix:', { originalDistrict, cleanedDistrict: district })
        
        // If district becomes empty after removing sub-district info, use other components
        if (!district || district.length === 0) {
          district = (components.suburb as string) || (components.borough as string) || null
          console.log('🌍 Forward Geocoding China - District empty after cleanup, using fallback:', district)
        }
      }
      
      console.log('🌍 Forward Geocoding China - Final result:', { city, district })
    } else {
      // For non-Chinese addresses, use the original mapping
      city = (components.city as string) || (components._normalized_city as string) || null
      district = (components.borough as string) || (components.suburb as string) || null
    }

    return {
      country: components.country || null,
      state: components.state || null,
      city: city,
      district: district,
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