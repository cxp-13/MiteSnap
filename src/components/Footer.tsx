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
          
          {/* Right side - Contacts */}
          <div className="flex flex-col items-center md:items-end space-y-3">
            <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Contacts</h3>
            <div className="flex items-center space-x-4">
              <a
                href="https://x.com/lantianlaoli"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-10 h-10 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110"
                aria-label="Follow us on X (Twitter)"
              >
                <svg
                  className="w-5 h-5 text-white group-hover:text-white transition-colors duration-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
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