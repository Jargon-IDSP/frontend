// src/pages/HomePage.tsx
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import SplashPage from '../pages/Splash';
import LoggedInHome from '../pages/LoggedInHome';

export default function HomePage() {
  return (
    <>
      <SignedOut>
        <SplashPage />
      </SignedOut>
      <SignedIn>
        <LoggedInHome />
      </SignedIn>
    </>
  );
}