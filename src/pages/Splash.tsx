import { SignInButton } from "@clerk/clerk-react";
import JargonLogo from "../components/Wordmark";
import HappyRocky from "../components/avatar/rocky/HappyRocky";

export default function SplashPage() {
  return (
    <div className="splash-page">
      <header className="splash-page__header">
        <JargonLogo size="24rem" rounded={false} className="splash-logo" />
        <p className="splash-page__tagline">Speak your trade fluently.</p>
      </header>

      <main className="splash-page__content">
        <div className="splash-page__illustration">
          <HappyRocky />
        </div>
        <p className="splash-page__body">
          Master the trade-specific English you need to work smarter, faster,
          and with confidence.
        </p>
        <SignInButton mode="modal">
          <button className="splash-page__button">Sign In</button>
        </SignInButton>
      </main>
    </div>
  );
}
