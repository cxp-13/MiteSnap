interface CircularProgressProps {
  score: number
}

const getRiskColor = (score: number) => {
  if (score < 30) return { bg: 'from-emerald-400 to-emerald-600', text: 'text-emerald-600', border: 'border-emerald-200' }
  if (score < 60) return { bg: 'from-amber-400 to-amber-600', text: 'text-amber-600', border: 'border-amber-200' }
  return { bg: 'from-red-400 to-red-600', text: 'text-red-600', border: 'border-red-200' }
}

export default function CircularProgress({ score }: CircularProgressProps) {
  const colors = getRiskColor(score)
  const circumference = 2 * Math.PI * 45
  const strokeDasharray = `${(score / 100) * circumference} ${circumference}`
  
  const getStrokeColor = (score: number) => {
    if (score < 30) return 'rgb(52, 211, 153)' // emerald-400
    if (score < 60) return 'rgb(251, 191, 36)' // amber-400
    return 'rgb(248, 113, 113)' // red-400
  }
  
  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="rgb(229, 231, 235)"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke={getStrokeColor(score)}
          strokeWidth="8"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className={`text-4xl font-bold ${colors.text}`}>{score}</div>
          <div className="text-sm text-gray-600 font-medium">Risk Score</div>
        </div>
      </div>
    </div>
  )
}