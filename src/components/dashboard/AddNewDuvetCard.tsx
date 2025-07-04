interface AddNewDuvetCardProps {
  onClick: () => void
}

export default function AddNewDuvetCard({ onClick }: AddNewDuvetCardProps) {
  return (
    <div 
      className="bg-white rounded-2xl cursor-pointer group h-full flex flex-col items-center justify-center p-8 transition-all duration-700 ease-out hover:-translate-y-2 shadow-md hover:shadow-lg"
      onClick={onClick}
    >
      {/* Plus Icon */}
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      
      {/* Text */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Add New Duvet</h3>
        <p className="text-gray-600 text-sm">Click to add a new duvet</p>
      </div>
    </div>
  )
}