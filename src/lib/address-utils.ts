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
  
  // Skip address_line fallback as field was removed
  
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

export interface NavigationInfo {
  distance: number // in kilometers
  walkingTime: number // in minutes
  drivingTime: number // in minutes
  formattedDistance: string
  formattedWalkingTime: string
  formattedDrivingTime: string
}

export function calculateNavigationInfo(
  from: Location,
  to: Location
): NavigationInfo {
  const distance = calculateDistance(from, to)
  
  // Average speeds: walking 5km/h, city driving 30km/h
  const walkingTime = Math.round((distance / 5) * 60) // minutes
  const drivingTime = Math.round((distance / 30) * 60) // minutes
  
  const formattedDistance = distance < 1 
    ? `${Math.round(distance * 1000)}m`
    : `${distance.toFixed(1)}km`
  
  const formattedWalkingTime = walkingTime < 60
    ? `${walkingTime}min`
    : `${Math.floor(walkingTime / 60)}h ${walkingTime % 60}min`
  
  const formattedDrivingTime = drivingTime < 60
    ? `${drivingTime}min`
    : `${Math.floor(drivingTime / 60)}h ${drivingTime % 60}min`
  
  return {
    distance,
    walkingTime,
    drivingTime,
    formattedDistance,
    formattedWalkingTime,
    formattedDrivingTime
  }
}

export function formatTimeWindow(startTime: string | null, endTime: string | null): string {
  if (!startTime) return 'Time window not available'
  
  const start = new Date(startTime)
  const end = endTime ? new Date(endTime) : null
  
  const startTimeStr = start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  
  if (!end) {
    return `From ${startTimeStr}`
  }
  
  const endTimeStr = end.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  
  return `${startTimeStr} - ${endTimeStr}`
}