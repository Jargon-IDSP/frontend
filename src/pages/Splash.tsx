import { SignInButton } from '@clerk/clerk-react';
import HappyRocky from '../components/avatar/HappyRocky';
import JargonLogo from '../components/Wordmark';

export default function SplashPage() {
  return (
    <div className="splash-page">
        <JargonLogo />
        <HappyRocky />
        <SignInButton />
      </div>
  );
}