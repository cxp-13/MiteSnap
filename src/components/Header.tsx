'use client'

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push('/');
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
      <div className="max-w-full mx-auto px-16 py-8 flex justify-between items-center">
        <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
          <Image 
            src="/logo.png" 
            alt="Acarid Bloom Logo" 
            width={40} 
            height={40}
            className="mr-3"
          />
          <span className="text-xl font-bold text-black">Acarid Bloom xxxx</span>
        </div>
        <div className="flex items-center">
          <SignedOut>
            <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
              <button className="prominent-signin-button">
                <span className="signin-button-text">Sign In</span>
                <div className="signin-button-highlight"></div>
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}