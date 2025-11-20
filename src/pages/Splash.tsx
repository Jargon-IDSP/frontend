import { SignInButton } from "@clerk/clerk-react";
import HappyRocky from "../components/avatar/rocky/HappyRocky";
import JargonLogo from "../components/Wordmark";

export default function SplashPage() {
  return (
    <div className="container">
      <div className="splash-page">
        <JargonLogo />
        <HappyRocky />
        <div style={{ textAlign: "center" }}>
          <SignInButton />
        </div>
      </div>
    </div>
  );
}
