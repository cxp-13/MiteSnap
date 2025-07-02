// Geolocation service for getting user's GPS position

export interface GeolocationPosition {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

export interface GeolocationError {
  code: number
  message: string
  type: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED'
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

const DEFAULT_OPTIONS: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000, // 10 seconds
  maximumAge: 60000 // 1 minute
}

export async function getCurrentPosition(
  options: GeolocationOptions = DEFAULT_OPTIONS
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser',
        type: 'NOT_SUPPORTED'
      } as GeolocationError)
      return
    }

    const success = (position: globalThis.GeolocationPosition) => {
      resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      })
    }

    const error = (err: GeolocationPositionError) => {
      let errorType: GeolocationError['type']
      let message: string

      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorType = 'PERMISSION_DENIED'
          message = 'Location access was denied by user'
          break
        case err.POSITION_UNAVAILABLE:
          errorType = 'POSITION_UNAVAILABLE'
          message = 'Location information is unavailable'
          break
        case err.TIMEOUT:
          errorType = 'TIMEOUT'
          message = 'Location request timed out'
          break
        default:
          errorType = 'POSITION_UNAVAILABLE'
          message = 'An unknown error occurred'
          break
      }

      reject({
        code: err.code,
        message,
        type: errorType
      } as GeolocationError)
    }

    navigator.geolocation.getCurrentPosition(success, error, options)
  })
}

export async function watchPosition(
  callback: (position: GeolocationPosition) => void,
  errorCallback?: (error: GeolocationError) => void,
  options: GeolocationOptions = DEFAULT_OPTIONS
): Promise<number> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser',
        type: 'NOT_SUPPORTED'
      } as GeolocationError)
      return
    }

    const success = (position: globalThis.GeolocationPosition) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      })
    }

    const error = (err: GeolocationPositionError) => {
      let errorType: GeolocationError['type']
      let message: string

      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorType = 'PERMISSION_DENIED'
          message = 'Location access was denied by user'
          break
        case err.POSITION_UNAVAILABLE:
          errorType = 'POSITION_UNAVAILABLE'
          message = 'Location information is unavailable'
          break
        case err.TIMEOUT:
          errorType = 'TIMEOUT'
          message = 'Location request timed out'
          break
        default:
          errorType = 'POSITION_UNAVAILABLE'
          message = 'An unknown error occurred'
          break
      }

      if (errorCallback) {
        errorCallback({
          code: err.code,
          message,
          type: errorType
        } as GeolocationError)
      }
    }

    const watchId = navigator.geolocation.watchPosition(success, error, options)
    resolve(watchId)
  })
}

export function clearWatch(watchId: number): void {
  if (navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId)
  }
}

export function checkGeolocationSupport(): boolean {
  return 'geolocation' in navigator
}

export async function requestLocationPermission(): Promise<boolean> {
  if (!navigator.permissions) {
    // Fallback: try to get location directly
    try {
      await getCurrentPosition({ timeout: 5000 })
      return true
    } catch {
      return false
    }
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
    return permission.state === 'granted'
  } catch {
    // Fallback: try to get location directly
    try {
      await getCurrentPosition({ timeout: 5000 })
      return true
    } catch {
      return false
    }
  }
}

export function getLocationErrorMessage(error: GeolocationError): string {
  switch (error.type) {
    case 'PERMISSION_DENIED':
      return 'Please allow location access to automatically fill your address'
    case 'POSITION_UNAVAILABLE':
      return 'Unable to determine your location. Please try again or enter your address manually'
    case 'TIMEOUT':
      return 'Location request timed out. Please try again or enter your address manually'
    case 'NOT_SUPPORTED':
      return 'Location services are not supported by your browser'
    default:
      return 'An error occurred while getting your location'
  }
}