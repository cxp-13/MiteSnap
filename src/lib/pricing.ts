// Pricing calculation utilities for help-drying service
// Based on duvet weight and customer floor/elevator information

export type WeightCategory = 'Lightweight' | 'Medium' | 'Heavy' | 'Extra Heavy'

export interface CostBreakdown {
  baseCost: number
  floorSurcharge: number
  totalCost: number
  weightCategory: WeightCategory
  floorNumber: number
  hasElevator: boolean
}

// Base pricing by weight category
const WEIGHT_PRICING: Record<WeightCategory, number> = {
  'Lightweight': 15, // < 3kg (Thin)
  'Medium': 20,      // 3-6kg (Medium)  
  'Heavy': 25,       // 6-9kg (Thick)
  'Extra Heavy': 30  // > 9kg (Extra Thick)
}

// Floor surcharge rates
const FLOOR_SURCHARGE = {
  // With elevator
  ELEVATOR_LOW: 0,    // 1-3 floors
  ELEVATOR_MID: 3,    // 4-7 floors  
  ELEVATOR_HIGH: 5,   // 8+ floors
  // Without elevator (per floor from 2nd floor)
  NO_ELEVATOR_PER_FLOOR: 5
}

/**
 * Map thickness to weight category for pricing
 */
export function mapThicknessToWeightCategory(thickness: string): WeightCategory {
  switch (thickness.toLowerCase()) {
    case 'thin':
    case 'light':
      return 'Lightweight'
    case 'medium':
    case 'normal':
      return 'Medium'
    case 'thick':
    case 'heavy':
      return 'Heavy'
    case 'extra thick':
    case 'extra heavy':
    case 'extrathick':
    case 'extraheavy':
      return 'Extra Heavy'
    default:
      return 'Medium' // Default fallback
  }
}

/**
 * Calculate base cost based on duvet weight category
 */
export function calculateBasePriceByWeight(weight: string): number {
  const weightCategory = weight as WeightCategory
  return WEIGHT_PRICING[weightCategory] || WEIGHT_PRICING['Medium']
}

/**
 * Calculate base cost based on duvet thickness
 */
export function calculateBasePriceByThickness(thickness: string): number {
  const weightCategory = mapThicknessToWeightCategory(thickness)
  return WEIGHT_PRICING[weightCategory]
}

/**
 * Calculate floor surcharge based on floor number and elevator availability
 */
export function calculateFloorSurcharge(floorNumber: number, hasElevator: boolean): number {
  if (floorNumber <= 1) {
    return 0 // Ground floor or basement, no surcharge
  }

  if (hasElevator) {
    if (floorNumber <= 3) {
      return FLOOR_SURCHARGE.ELEVATOR_LOW // 1-3 floors with elevator
    } else if (floorNumber <= 7) {
      return FLOOR_SURCHARGE.ELEVATOR_MID // 4-7 floors with elevator
    } else {
      return FLOOR_SURCHARGE.ELEVATOR_HIGH // 8+ floors with elevator
    }
  } else {
    // No elevator: charge per floor starting from 2nd floor
    return (floorNumber - 1) * FLOOR_SURCHARGE.NO_ELEVATOR_PER_FLOOR
  }
}

/**
 * Calculate total cost including base price and floor surcharge
 */
export function calculateTotalCost(
  weight: string, 
  floorNumber: number, 
  hasElevator: boolean
): number {
  const baseCost = calculateBasePriceByWeight(weight)
  const floorSurcharge = calculateFloorSurcharge(floorNumber, hasElevator)
  return baseCost + floorSurcharge
}

/**
 * Calculate total cost using thickness instead of weight
 */
export function calculateTotalCostByThickness(
  thickness: string, 
  floorNumber: number, 
  hasElevator: boolean
): number {
  const baseCost = calculateBasePriceByThickness(thickness)
  const floorSurcharge = calculateFloorSurcharge(floorNumber, hasElevator)
  return baseCost + floorSurcharge
}

/**
 * Get detailed cost breakdown for display
 */
export function getCostBreakdown(
  weight: string,
  floorNumber: number, 
  hasElevator: boolean
): CostBreakdown {
  const baseCost = calculateBasePriceByWeight(weight)
  const floorSurcharge = calculateFloorSurcharge(floorNumber, hasElevator)
  const totalCost = baseCost + floorSurcharge
  
  return {
    baseCost,
    floorSurcharge,
    totalCost,
    weightCategory: weight as WeightCategory,
    floorNumber,
    hasElevator
  }
}

/**
 * Get detailed cost breakdown using thickness
 */
export function getCostBreakdownByThickness(
  thickness: string,
  floorNumber: number, 
  hasElevator: boolean
): CostBreakdown {
  const weightCategory = mapThicknessToWeightCategory(thickness)
  const baseCost = calculateBasePriceByThickness(thickness)
  const floorSurcharge = calculateFloorSurcharge(floorNumber, hasElevator)
  const totalCost = baseCost + floorSurcharge
  
  return {
    baseCost,
    floorSurcharge,
    totalCost,
    weightCategory,
    floorNumber,
    hasElevator
  }
}

/**
 * Format cost for display (e.g., "$15.00")
 */
export function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`
}