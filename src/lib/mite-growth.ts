import { getWeatherForecast } from './weather-analysis'
import { getAllDuvetsWithLocation, batchUpdateMiteScores, updateDuvetLastCalculatedAt } from './database'

// Constants
const BASE_GROWTH_RATE_PER_HOUR = 0.5

// Material multipliers mapping
const MATERIAL_MULTIPLIERS: Record<string, number> = {
  'Cotton': 1.2,
  'Polyester': 0.8,
  'Down': 1.1,
  'Soybean Fiber': 0.9,
  'Bamboo Fiber': 0.7,
  'Silk': 0.6,
  'Unknown': 1.0
}

// Thickness multipliers mapping
const THICKNESS_MULTIPLIERS: Record<string, number> = {
  'Thin': 0.9,
  'Medium': 1.0,
  'Thick': 1.1,
  'Extra Thick': 1.2
}

/**
 * Calculate environment suitability based on temperature and humidity
 * @param temperature - Temperature in Celsius
 * @param humidity - Humidity percentage
 * @returns Suitability factor (0.0 to 1.0)
 */
export function calculateEnvironmentSuitability(temperature: number, humidity: number): number {
  let f_temp = 0.0
  if (temperature >= 20 && temperature <= 30) {
    f_temp = 1.0
  } else if ((temperature >= 15 && temperature < 20) || (temperature > 30 && temperature <= 35)) {
    f_temp = 0.5
  } else {
    f_temp = 0.1 // Very unsuitable temperature
  }

  let f_humidity = 0.0
  if (humidity >= 70 && humidity <= 80) {
    f_humidity = 1.0
  } else if ((humidity >= 60 && humidity < 70) || (humidity > 80 && humidity <= 90)) {
    f_humidity = 0.7
  } else if ((humidity >= 50 && humidity < 60) || (humidity > 90 && humidity <= 100)) {
    f_humidity = 0.3
  } else {
    f_humidity = 0.1 // Too low humidity, mites cannot survive
  }

  return f_temp * f_humidity
}

/**
 * Get material multiplier from material string
 * @param material - Material name
 * @returns Material multiplier factor
 */
function getMaterialMultiplier(material: string): number {
  return MATERIAL_MULTIPLIERS[material] || 1.0
}

/**
 * Get thickness multiplier from thickness string
 * @param thickness - Thickness name
 * @returns Thickness multiplier factor
 */
function getThicknessMultiplier(thickness: string): number {
  return THICKNESS_MULTIPLIERS[thickness] || 1.0
}

/**
 * Ensure value is rounded to 2 decimal places
 * @param value - Number to round
 * @returns Number rounded to 2 decimal places
 */
function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Clamp value between min and max
 * @param value - Value to clamp
 * @param min - Minimum value (default: 0)
 * @param max - Maximum value (default: 100)
 * @returns Clamped value
 */
function clamp(value: number, min: number = 0, max: number = 100): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Get weather data for a location
 * @param latitude - Latitude
 * @param longitude - Longitude
 * @returns Weather data or null if failed
 */
async function getLocationWeather(latitude: number, longitude: number): Promise<{ temperature: number; humidity: number } | null> {
  try {
    const weatherData = await getWeatherForecast(latitude, longitude)
    
    if (!weatherData?.data?.timelines?.[0]?.intervals?.length) {
      console.warn(`No weather data available for location ${latitude}, ${longitude}`)
      return null
    }

    // Get current weather (first interval)
    const currentInterval = weatherData.data.timelines[0].intervals[0]
    
    return {
      temperature: currentInterval.values.temperature,
      humidity: currentInterval.values.humidity
    }
  } catch (error) {
    console.error(`Error fetching weather for location ${latitude}, ${longitude}:`, error)
    return null
  }
}

/**
 * Calculate mite coefficient growth for all duvets
 * This function should be called by the cron job every hour
 */
export async function calculateMiteCoefficientGrowth(): Promise<{
  processedCount: number
  updatedCount: number
  errors: string[]
  skippedCount: number
}> {
  const result = {
    processedCount: 0,
    updatedCount: 0,
    errors: [] as string[],
    skippedCount: 0
  }

  try {
    console.log('🕐 Starting mite coefficient growth calculation...')
    
    // 1. Get all duvets with location data
    const duvets = await getAllDuvetsWithLocation()
    console.log(`📋 Found ${duvets.length} duvets to process`)

    if (duvets.length === 0) {
      console.log('⚠️ No duvets found, nothing to process')
      return result
    }

    const updates: Array<{ id: string; newMiteScore: number }> = []

    // 2. Process each duvet
    for (const duvet of duvets) {
      try {
        result.processedCount++
        
        console.log(`🔍 Processing duvet ${duvet.id} (${duvet.name})`)
        
        // Skip if no location data
        if (!duvet.latitude || !duvet.longitude) {
          console.warn(`⚠️ Duvet ${duvet.id} has no location data, skipping`)
          result.skippedCount++
          continue
        }

        // 3. Get weather data for this duvet's location
        const weather = await getLocationWeather(duvet.latitude, duvet.longitude)
        
        if (!weather) {
          console.warn(`⚠️ Could not get weather data for duvet ${duvet.id}, skipping`)
          result.skippedCount++
          continue
        }

        console.log(`🌤️ Weather for duvet ${duvet.id}: ${weather.temperature}°C, ${weather.humidity}% humidity`)

        // 4. Calculate environment suitability
        const envSuitability = calculateEnvironmentSuitability(weather.temperature, weather.humidity)
        console.log(`🌍 Environment suitability: ${envSuitability}`)

        // 5. Get material and thickness multipliers
        const materialMultiplier = getMaterialMultiplier(duvet.material)
        const thicknessMultiplier = getThicknessMultiplier(duvet.thickness || 'Medium')
        
        console.log(`🧵 Material (${duvet.material}): ${materialMultiplier}x, Thickness (${duvet.thickness}): ${thicknessMultiplier}x`)

        // 6. Calculate mite growth for this hour
        const miteGrowth = BASE_GROWTH_RATE_PER_HOUR * envSuitability * materialMultiplier * thicknessMultiplier
        console.log(`📈 Calculated growth: ${miteGrowth}`)

        // 7. Calculate new mite coefficient
        const currentMiteScore = duvet.mite_score || 0
        let newMiteScore = currentMiteScore + miteGrowth

        // 8. Clamp to range 0.00-100.00 and round to 2 decimal places
        newMiteScore = roundToTwoDecimals(clamp(newMiteScore, 0, 100))
        
        console.log(`🎯 Duvet ${duvet.id}: ${currentMiteScore} → ${newMiteScore} (growth: +${roundToTwoDecimals(miteGrowth)})`)

        // 9. Add to updates batch
        updates.push({
          id: duvet.id,
          newMiteScore: newMiteScore
        })

      } catch (error) {
        const errorMessage = `Error processing duvet ${duvet.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error(`❌ ${errorMessage}`)
        result.errors.push(errorMessage)
      }
    }

    // 10. Batch update all mite scores
    if (updates.length > 0) {
      console.log(`💾 Updating ${updates.length} duvet mite scores...`)
      
      const updateSuccess = await batchUpdateMiteScores(updates)
      
      if (updateSuccess) {
        result.updatedCount = updates.length
        console.log(`✅ Successfully updated ${updates.length} duvet mite scores`)
        
        // Update last calculated timestamp
        await updateDuvetLastCalculatedAt(updates.map(u => u.id))
      } else {
        const errorMessage = 'Failed to batch update mite scores'
        console.error(`❌ ${errorMessage}`)
        result.errors.push(errorMessage)
      }
    }

    console.log(`🏁 Mite growth calculation completed. Processed: ${result.processedCount}, Updated: ${result.updatedCount}, Skipped: ${result.skippedCount}, Errors: ${result.errors.length}`)
    
    return result

  } catch (error) {
    const errorMessage = `Fatal error in mite coefficient growth calculation: ${error instanceof Error ? error.message : 'Unknown error'}`
    console.error(`💥 ${errorMessage}`)
    result.errors.push(errorMessage)
    return result
  }
}