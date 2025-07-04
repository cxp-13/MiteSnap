import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-2 md:px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Left side - Brand */}
          <div className="flex items-center space-x-2 mb-6 md:mb-0">
            <Image src="/logo.png" alt="MiteSnap Logo" width={28} height={28} />
            <span className="text-xl font-bold tracking-wide">MiteSnap</span>
          </div>
          
        </div>
        
        {/* Bottom border with copyright */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="text-center text-sm text-gray-400">
            © 2024 MiteSnap. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}