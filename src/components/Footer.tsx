import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Left: Brand Information */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-3">
              <Image src="/logo.png" alt="MiteSnap" width={32} height={32} />
              <span className="text-xl font-bold">MiteSnap</span>
            </div>
            <p className="text-gray-400 text-sm max-w-xs mx-auto md:mx-0">
              AI-powered dust mite detection for healthier bedding. Track, analyze, and connect with your community.
            </p>
          </div>

          {/* Center: Social Media Links */}
          <div className="text-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Connect With Us</h3>
            <div className="flex items-center justify-center space-x-6">
              {/* Twitter */}
              <a
                href="https://x.com/lantianlaoli"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                title="Follow us on Twitter"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              
              {/* GitHub */}
              <a
                href="https://github.com/cxp-13/MiteSnap"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                title="View source code on GitHub"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              
              {/* 小红书 */}
              <a
                href="https://www.xiaohongshu.com/user/profile/646ced020000000011001e47"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                title="Contact us on 小红书"
              >
                <Image 
                  src="/Xiaohongshu_logo.png" 
                  alt="小红书" 
                  width={24}
                  height={24}
                  className="opacity-70 hover:opacity-100 transition-opacity duration-200"
                />
              </a>
            </div>
          </div>

          {/* Right: Badges */}
          <div className="text-center md:text-right">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Featured On</h3>
            <div className="flex flex-col items-center md:items-end space-y-3">
              {/* Launch Badge */}
              <Image 
                src="/Launch_SVG_Dark.svg" 
                alt="Live on Launch" 
                width={160} 
                height={43}
                className="opacity-90 hover:opacity-100 transition-opacity duration-200"
              />
              
              {/* Product Hunt Badge */}
              <a 
                href="https://www.producthunt.com/products/mitesnap?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-mitesnap" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Image 
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=990814&theme=dark&t=1752123295100" 
                  alt="MiteSnap - Track the mites on your bedding, sheets, and other items. | Product Hunt" 
                  width={180} 
                  height={39}
                  unoptimized
                />
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom: Copyright and Legal */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="text-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} MiteSnap. All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
              <span>·</span>
              <a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a>
              <span>·</span>
              <a href="mailto:support@mitesnap.com" className="hover:text-white transition-colors duration-200">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}