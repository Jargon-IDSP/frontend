import { SignInButton } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import JargonLogo from "../components/Wordmark";
import HappyRocky from "../components/avatar/rocky/HappyRocky";

// Use the GIF splash animation served from public/
const splashAnimation = "/splashAnimation.gif";

export default function SplashPage() {
  const [showAnimation, setShowAnimation] = useState(true);
  const [animateOut, setAnimateOut] = useState(false);

  // Play the splash GIF, then slide it away to reveal the splash screen
  useEffect(() => {
    const DURATION_MS = 3500; // length of GIF
    const SLIDE_DURATION_MS = 600;

    const startSlideTimer = setTimeout(() => {
      setAnimateOut(true);
    }, DURATION_MS);

    const hideTimer = setTimeout(() => {
      setShowAnimation(false);
    }, DURATION_MS + SLIDE_DURATION_MS);

    return () => {
      clearTimeout(startSlideTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <>
      {showAnimation && (
        <div
          className={
            "splash-animation-screen" +
            (animateOut ? " splash-animation-screen--exit" : "")
          }
        >
          <div className="splash-animation-screen__frame">
            <div className="splash-animation-screen__panel">
              <img
                src={splashAnimation}
                alt="Jargon splash animation"
                className="splash-animation-screen__panel__image"
              />
            </div>
          </div>
        </div>
      )}

      <div className="container">
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
      </div>
    </>
  );
}
