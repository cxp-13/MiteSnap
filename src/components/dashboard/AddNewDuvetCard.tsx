interface AddNewDuvetCardProps {
  onClick: () => void
}

export default function AddNewDuvetCard({ onClick }: AddNewDuvetCardProps) {
  return (
    <div 
      className="border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer group transition-all duration-200 ease-out hover:border-gray-400 flex items-center justify-center h-full"
      onClick={onClick}
    >
      <div className="w-12 h-12 text-gray-400 group-hover:text-gray-500 transition-colors">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
    </div>
  )
}