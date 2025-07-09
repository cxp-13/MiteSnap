export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <span className="text-lg font-semibold">MiteSnap</span>
        </div>
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} MiteSnap. All rights reserved.
        </p>
      </div>
    </footer>
  )
}