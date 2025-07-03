'use client'

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMockUser } from '@/context/MockUserContext';
import { useUnifiedUser } from '@/hooks/useUnifiedUser';
import dynamic from 'next/dynamic';

// Dynamically import Clerk components with SSR disabled
const SignInButton = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.SignInButton),
  { ssr: false }
);

const SignedIn = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.SignedIn),
  { ssr: false }
);

const SignedOut = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.SignedOut),
  { ssr: false }
);

const UserButton = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.UserButton),
  { ssr: false }
);

export default function Header() {
  const router = useRouter();
  const { isMockMode, toggleMockMode, signIn, signOut } = useMockUser();
  const { user, isSignedIn } = useUnifiedUser();

  const handleLogoClick = () => {
    router.push('/');
  };

  const handleSignIn = () => {
    if (isMockMode) {
      signIn();
    }
  };

  const handleSignOut = () => {
    if (isMockMode) {
      signOut();
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
      <div className="max-w-full mx-auto px-8 py-6 flex justify-between items-center">
        <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
          <Image 
            src="/logo.png" 
            alt="MiteSnap Logo" 
            width={32} 
            height={32}
            className="mr-3"
          />
          <span className="text-xl font-light text-black tracking-wide">MiteSnap</span>
        </div>
        <div className="flex items-center space-x-6">
          {/* Mock Mode Toggle */}
          <button
            onClick={toggleMockMode}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              isMockMode 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}
          >
            {isMockMode ? '🔧 Mock Mode' : '🔧 Demo Mode'}
          </button>

          {/* Authentication UI */}
          {isMockMode ? (
            // Mock mode UI
            <>
              {!isSignedIn ? (
                <button
                  onClick={handleSignIn}
                  className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-black bg-transparent border border-black rounded-none transition-all duration-300 ease-out hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                >
                  <span className="relative z-10">Sign In</span>
                  <div className="absolute inset-0 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></div>
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="px-4 py-2 text-sm font-medium text-black hover:text-gray-600 transition-colors"
                  >
                    Dashboard
                  </button>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-black font-medium text-sm">
                      {user?.name?.[0] || 'D'}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="text-sm text-gray-600 hover:text-black transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            // Clerk UI
            <>
              <SignedOut>
                <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                  <button className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-black bg-transparent border border-black rounded-none transition-all duration-300 ease-out hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50">
                    <span className="relative z-10">Sign In</span>
                    <div className="absolute inset-0 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></div>
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 text-sm font-medium text-black hover:text-gray-600 transition-colors"
                >
                  Dashboard
                </button>
                <UserButton />
              </SignedIn>
            </>
          )}
        </div>
      </div>
    </header>
  );
}