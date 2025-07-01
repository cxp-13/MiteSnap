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
      <div className="max-w-full mx-auto px-16 py-8 flex justify-between items-center">
        <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
          <Image 
            src="/logo.png" 
            alt="MiteSnap Logo" 
            width={40} 
            height={40}
            className="mr-3"
          />
          <span className="text-xl font-bold text-black">MiteSnap</span>
        </div>
        <div className="flex items-center space-x-4">
          {/* Mock Mode Toggle */}
          <button
            onClick={toggleMockMode}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
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
                  className="prominent-signin-button"
                >
                  <span className="signin-button-text">Sign In (Demo)</span>
                  <div className="signin-button-highlight"></div>
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="px-4 py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Dashboard
                  </button>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user?.name?.[0] || 'D'}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="text-sm text-gray-600 hover:text-gray-800"
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
                  <button className="prominent-signin-button">
                    <span className="signin-button-text">Sign In</span>
                    <div className="signin-button-highlight"></div>
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
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