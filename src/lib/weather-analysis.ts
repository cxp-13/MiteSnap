// Sun hours constants (general daylight hours for sun-drying)
const SUNRISE_HOUR = 7 // 7:00 AM
const SUNSET_HOUR = 19 // 7:00 PM

interface WeatherInterval {
  startTime: string
  values: {
    temperature: number
    humidity: number
    precipitationProbability: number
  }
}

interface WeatherResponse {
  data: {
    timelines: [{
      timestep: string
      endTime: string
      startTime: string
      intervals: WeatherInterval[]
    }]
  }
}

export interface OptimalTimeWindow {
  startTime: string
  endTime: string
  temperature: number
  humidity: number
  precipitationProbability: number
  suitabilityScore: number
}

export interface WeatherAnalysisResult {
  isOptimalForSunDrying: boolean
  optimalWindows: OptimalTimeWindow[]
  reason: string
  overallConditions: {
    averageTemperature: number
    averageHumidity: number
    rainHours: number
    totalHours: number
  }
}

export async function getWeatherForecast(latitude: number, longitude: number): Promise<WeatherResponse | null> {
  try {
    const response = await fetch(`https://api.tomorrow.io/v4/timelines?apikey=IaB1VpvDKlhxYKOkOJYgmV7pugCblbNr`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Encoding': 'deflate, gzip, br'
      },
      body: JSON.stringify({
        location: `${latitude}, ${longitude}`,
        fields: [
          "temperature",
          "humidity", 
          "precipitationProbability"
        ],
        units: "metric",
        timesteps: ["30m"],
        startTime: "now",
        endTime: "nowPlus12h"
      })
    })



    if (!response.ok) {
      console.error('Weather API request failed:', response.status, response.statusText)
      return null
    }

    const data = await response.json()

    console.log(data)
    return data
  } catch (error) {
    console.error('Error fetching weather forecast:', error)
    return null
  }
}

// Helper function to check if a time is within daylight hours
function isWithinDaylightHours(timeString: string): boolean {
  const date = new Date(timeString)
  const hour = date.getHours()
  return hour >= SUNRISE_HOUR && hour < SUNSET_HOUR
}

// Function to check if current time is within sunrise hours (for AI drying button visibility)
export function isCurrentTimeWithinSunrise(): boolean {
  const now = new Date()
  const currentHour = now.getHours()
  return currentHour >= SUNRISE_HOUR && currentHour < SUNSET_HOUR
}

export function analyzeWeatherForSunDrying(weatherData: WeatherResponse): WeatherAnalysisResult {
  const intervals = weatherData.data.timelines[0].intervals
  
  // Calculate overall conditions
  const totalHours = intervals.length
  const averageTemperature = intervals.reduce((sum, interval) => sum + interval.values.temperature, 0) / totalHours
  const averageHumidity = intervals.reduce((sum, interval) => sum + interval.values.humidity, 0) / totalHours
  const rainHours = intervals.filter(interval => interval.values.precipitationProbability > 20).length

  // Find optimal windows (consecutive 30-minute intervals with good conditions)
  const optimalWindows: OptimalTimeWindow[] = []
  let currentWindow: WeatherInterval[] = []

  for (let i = 0; i < intervals.length; i++) {
    const interval = intervals[i]
    const isGoodCondition = (
      interval.values.temperature >= 8 &&
      interval.values.humidity <= 90 &&
      interval.values.precipitationProbability <= 50 &&
      isWithinDaylightHours(interval.startTime)
    )

    if (isGoodCondition) {
      currentWindow.push(interval)
    } else {
      // End of good conditions - save window if it's at least 1 interval (30 minutes)
      if (currentWindow.length >= 1) {
        const windowStart = currentWindow[0]
        const windowEnd = currentWindow[currentWindow.length - 1]
        const avgTemp = currentWindow.reduce((sum, w) => sum + w.values.temperature, 0) / currentWindow.length
        const avgHumidity = currentWindow.reduce((sum, w) => sum + w.values.humidity, 0) / currentWindow.length
        const avgPrecip = currentWindow.reduce((sum, w) => sum + w.values.precipitationProbability, 0) / currentWindow.length
        
        // Calculate end time by adding 30 minutes to the last interval
        const endTime = new Date(new Date(windowEnd.startTime).getTime() + 30 * 60 * 1000).toISOString()
        
        // Calculate suitability score (0-100) - updated for lower standards
        let score = 0
        score += Math.min(avgTemp - 8, 22) * 1.5 // Temperature bonus (max 33 points)
        score += Math.max(90 - avgHumidity, 0) * 0.6 // Humidity bonus (max 54 points)
        score += Math.max(50 - avgPrecip, 0) * 0.4 // No rain bonus (max 20 points)
        
        optimalWindows.push({
          startTime: windowStart.startTime,
          endTime: endTime,
          temperature: avgTemp,
          humidity: avgHumidity,
          precipitationProbability: avgPrecip,
          suitabilityScore: Math.round(score)
        })
      }
      currentWindow = []
    }
  }

  // Check final window
  if (currentWindow.length >= 1) {
    const windowStart = currentWindow[0]
    const windowEnd = currentWindow[currentWindow.length - 1]
    const avgTemp = currentWindow.reduce((sum, w) => sum + w.values.temperature, 0) / currentWindow.length
    const avgHumidity = currentWindow.reduce((sum, w) => sum + w.values.humidity, 0) / currentWindow.length
    const avgPrecip = currentWindow.reduce((sum, w) => sum + w.values.precipitationProbability, 0) / currentWindow.length
    
    // Calculate end time by adding 30 minutes to the last interval
    const endTime = new Date(new Date(windowEnd.startTime).getTime() + 30 * 60 * 1000).toISOString()
    
    let score = 0
    score += Math.min(avgTemp - 12, 18) * 1.5
    score += Math.max(85 - avgHumidity, 0) * 0.6
    score += Math.max(30 - avgPrecip, 0) * 0.7
    
    optimalWindows.push({
      startTime: windowStart.startTime,
      endTime: endTime,
      temperature: avgTemp,
      humidity: avgHumidity,
      precipitationProbability: avgPrecip,
      suitabilityScore: Math.round(score)
    })
  }

  // Sort by suitability score (best first)
  optimalWindows.sort((a, b) => b.suitabilityScore - a.suitabilityScore)

  // Determine if conditions are suitable overall - lowered threshold for testing
  const isOptimalForSunDrying = optimalWindows.length > 0 && optimalWindows[0].suitabilityScore >= 15

  // Generate reason message
  let reason = ''
  if (rainHours > totalHours * 0.6) {
    reason = 'High precipitation probability in the next 12 hours, not suitable for drying'
  } else if (averageTemperature < 8) {
    reason = 'Temperature too low for effective drying'
  } else if (averageHumidity > 90) {
    reason = 'Humidity too high for optimal drying conditions'
  } else if (optimalWindows.length === 0) {
    reason = 'No suitable continuous 30-minute periods found'
  } else {
    const bestWindow = optimalWindows[0]
    const startTime = new Date(bestWindow.startTime)
    const endTime = new Date(bestWindow.endTime)
    const startHour = startTime.getHours().toString().padStart(2, '0')
    const startMin = startTime.getMinutes().toString().padStart(2, '0')
    const endHour = endTime.getHours().toString().padStart(2, '0')
    const endMin = endTime.getMinutes().toString().padStart(2, '0')
    reason = `Best drying time: ${startHour}:${startMin}-${endHour}:${endMin}`
  }

  return {
    isOptimalForSunDrying,
    optimalWindows,
    reason,
    overallConditions: {
      averageTemperature: Math.round(averageTemperature * 10) / 10,
      averageHumidity: Math.round(averageHumidity),
      rainHours,
      totalHours
    }
  }
}