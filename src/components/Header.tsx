'use client'

import { SignInButton } from "@clerk/nextjs";

export default function Header() {
  return (
    <header className="transparent-header">
      <div className="header-content">
        <SignInButton mode="modal">
          <span className="signin-link">Sign In</span>
        </SignInButton>
      </div>
    </header>
  );
}