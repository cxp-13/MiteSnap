interface LinearProgressProps {
  score: number
}

const getProgressColor = (score: number) => {
  if (score < 30) return 'bg-green-600'
  if (score < 60) return 'bg-yellow-500'
  return 'bg-red-600'
}

export default function LinearProgress({ score }: LinearProgressProps) {
  const percentage = Math.min(score, 100)
  const progressColor = getProgressColor(score)
  
  return (
    <div className="w-full">
      {/* Mite Index Label and Score */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900">Mite Index</span>
        <span className="text-lg font-bold text-gray-900">{score}</span>
      </div>
      
      {/* Progress Track */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`${progressColor} h-2 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
    </div>
  )
}