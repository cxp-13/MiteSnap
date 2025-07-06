import React from 'react'
import { CostBreakdown as CostBreakdownType, formatCost } from '@/lib/pricing'

interface SimplePriceDisplayProps {
  costBreakdown: CostBreakdownType
  className?: string
}

export default function SimplePriceDisplay({ costBreakdown, className = '' }: SimplePriceDisplayProps) {
  const { 
    baseCost, 
    floorSurcharge, 
    totalCost, 
    weightCategory, 
    floorNumber, 
    hasElevator 
  } = costBreakdown

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 space-y-4 ${className}`}>
      <div className="text-center mb-4">
        <h5 className="text-lg font-semibold text-gray-900">Service Cost</h5>
        <p className="text-sm text-gray-600">Professional drying assistance</p>
      </div>
      
      <div className="space-y-3">
        {/* Base Cost */}
        <div className="flex justify-between items-center bg-white/60 rounded-lg p-3">
          <div>
            <span className="text-gray-700 font-medium">Base Service</span>
            <div className="text-xs text-gray-500">{weightCategory} duvet</div>
          </div>
          <span className="text-lg font-bold text-gray-900">{formatCost(baseCost)}</span>
        </div>

        {/* Floor Surcharge */}
        {floorSurcharge > 0 && (
          <div className="flex justify-between items-center bg-white/60 rounded-lg p-3">
            <div>
              <span className="text-gray-700 font-medium">Floor Access</span>
              <div className="text-xs text-gray-500">
                {floorNumber}F, {hasElevator ? 'with elevator' : 'no elevator'}
              </div>
            </div>
            <span className="text-lg font-bold text-gray-900">+{formatCost(floorSurcharge)}</span>
          </div>
        )}

        {/* Total */}
        <div className="border-t border-white/40 pt-3">
          <div className="flex justify-between items-center bg-white/80 rounded-lg p-4">
            <span className="text-xl font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-blue-600">{formatCost(totalCost)}</span>
          </div>
        </div>
      </div>

      {/* Simple note */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          💳 Payment upon completion
        </p>
      </div>
    </div>
  )
}