import { Address } from './database'

export interface Location {
  latitude: number
  longitude: number
}

// Calculate distance between two GPS coordinates using Haversine formula
export function calculateDistance(
  location1: Location,
  location2: Location
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(location2.latitude - location1.latitude)
  const dLon = toRadians(location2.longitude - location1.longitude)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(location1.latitude)) * Math.cos(toRadians(location2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in kilometers
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

export function formatLocalAddress(address: Address): string {
  const parts: string[] = []
  
  // Add district if available
  if (address.district) {
    parts.push(address.district)
  }
  
  // Add road and house number if available
  if (address.road) {
    if (address.house_number) {
      parts.push(`${address.road} ${address.house_number}`)
    } else {
      parts.push(address.road)
    }
  } else if (address.house_number) {
    parts.push(address.house_number)
  }
  
  // Add neighbourhood if available and no district
  if (!address.district && address.neighbourhood) {
    parts.push(address.neighbourhood)
  }
  
  // Add city as fallback if no specific area info
  if (parts.length === 0 && address.city) {
    parts.push(address.city)
  }
  
  // Use address_line as fallback if no structured parts
  if (parts.length === 0 && address.address_line) {
    return address.address_line
  }
  
  // Use legacy full_address as last resort
  if (parts.length === 0 && address.full_address) {
    return address.full_address
  }
  
  return parts.join(', ') || 'Address not available'
}

export function formatRelativeTime(dateString: string): string {
  const now = new Date()
  const targetDate = new Date(dateString)
  const diffMs = targetDate.getTime() - now.getTime()
  
  if (diffMs <= 0) {
    return 'Expired'
  }
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffHours > 24) {
    const diffDays = Math.floor(diffHours / 24)
    return `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`
  } else if (diffHours > 0) {
    if (diffMinutes > 0) {
      return `Due in ${diffHours}h ${diffMinutes}m`
    } else {
      return `Due in ${diffHours} hour${diffHours > 1 ? 's' : ''}`
    }
  } else {
    return `Due in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`
  }
}