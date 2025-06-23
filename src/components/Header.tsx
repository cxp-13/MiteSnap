'use client'

import { SignInButton } from "@clerk/nextjs";
import Link from 'next/link';

export default function Header() {
  return (
    <header className="header-neon-bar">
      <div className="header-content">
        <Link href="/" className="header-brand">
          SunSpec
        </Link>
        <SignInButton mode="modal">
          <span className="header-signin">Sign In</span>
        </SignInButton>
      </div>
    </header>
  );
}