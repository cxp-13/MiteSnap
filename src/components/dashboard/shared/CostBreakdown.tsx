import React from 'react'
import { CostBreakdown as CostBreakdownType, formatCost } from '@/lib/pricing'

interface CostBreakdownProps {
  costBreakdown: CostBreakdownType
  className?: string
}

export default function CostBreakdown({ costBreakdown, className = '' }: CostBreakdownProps) {
  console.log('CostBreakdown component rendered with:', costBreakdown)
  
  const { 
    baseCost, 
    floorSurcharge, 
    totalCost, 
    weightCategory, 
    floorNumber, 
    hasElevator 
  } = costBreakdown

  return (
    <div className={`bg-gray-50 rounded-xl p-6 space-y-4 ${className}`}>
      <h5 className="font-medium text-gray-900">Service Cost Breakdown</h5>
      
      <div className="space-y-3 text-sm">
        {/* Base Cost */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Base Service</span>
            <span className="text-xs text-gray-500">({weightCategory} duvet)</span>
          </div>
          <span className="font-medium text-gray-900">{formatCost(baseCost)}</span>
        </div>

        {/* Floor Surcharge */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Floor Surcharge</span>
            <span className="text-xs text-gray-500">
              ({floorNumber > 1 ? `${floorNumber}F` : 'Ground'}, {hasElevator ? 'with elevator' : 'no elevator'})
            </span>
          </div>
          <span className="font-medium text-gray-900">
            {floorSurcharge > 0 ? `+${formatCost(floorSurcharge)}` : formatCost(0)}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">Total</span>
            <span className="font-bold text-lg text-gray-900">{formatCost(totalCost)}</span>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="text-xs text-gray-500 bg-white rounded-lg p-3">
        <p className="font-medium mb-1">Pricing Details:</p>
        <ul className="space-y-1">
          <li>• Base cost varies by duvet weight (Lightweight: $15, Medium: $20, Heavy: $25, Extra Heavy: $30)</li>
          <li>• Floor surcharge: 1-3F with elevator ($0), 4-7F with elevator ($3), 8+F with elevator ($5)</li>
          <li>• No elevator: $5 per floor above ground level</li>
        </ul>
      </div>
    </div>
  )
}