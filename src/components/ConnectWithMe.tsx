import { useState } from "react";
import linkedinIcon from "../assets/icons/linkedin.svg";
import facebookIcon from "../assets/icons/facebook.svg";
import instagramIcon from "../assets/icons/insta.svg";
import indeedIcon from "../assets/icons/indeed.svg";
import EditSocialMediaDrawer from "../pages/drawers/EditSocialMediaDrawer";
import type { ConnectWithMeProps } from "../types/profile";

interface ConnectWithMeComponentProps extends ConnectWithMeProps {
  isOwnProfile: boolean;
}

export default function ConnectWithMe({
  LinkedInUrl,
  FacebookUrl,
  InstagramUrl,
  IndeedUrl,
  isOwnProfile,
}: ConnectWithMeComponentProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<
    "linkedin" | "facebook" | "instagram" | "indeed"
  >("linkedin");

  const hasSocialMedia = LinkedInUrl || FacebookUrl || InstagramUrl || IndeedUrl;

  // Hide section if not own profile and no social media data
  if (!isOwnProfile && !hasSocialMedia) {
    return null;
  }

  const handleIconClick = (
    platform: "linkedin" | "facebook" | "instagram" | "indeed",
    url?: string
  ) => {
    if (isOwnProfile) {
      // Open edit drawer
      setSelectedPlatform(platform);
      setDrawerOpen(true);
    } else if (url) {
      // Open link in new tab
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const getCurrentUrl = () => {
    switch (selectedPlatform) {
      case "linkedin":
        return LinkedInUrl;
      case "facebook":
        return FacebookUrl;
      case "instagram":
        return InstagramUrl;
      case "indeed":
        return IndeedUrl;
      default:
        return "";
    }
  };

  return (
    <>
      <div className="friend-profile-section">
        <h3 className="friend-profile-section-title">Connect With Me</h3>
        <div className="connect-with-me-grid">
          {(isOwnProfile || LinkedInUrl) && (
            <button
              className="connect-with-me-icon"
              onClick={() => handleIconClick("linkedin", LinkedInUrl)}
              aria-label="LinkedIn"
            >
              <img src={linkedinIcon} alt="LinkedIn" />
            </button>
          )}
          {(isOwnProfile || FacebookUrl) && (
            <button
              className="connect-with-me-icon"
              onClick={() => handleIconClick("facebook", FacebookUrl)}
              aria-label="Facebook"
            >
              <img src={facebookIcon} alt="Facebook" />
            </button>
          )}
          {(isOwnProfile || InstagramUrl) && (
            <button
              className="connect-with-me-icon"
              onClick={() => handleIconClick("instagram", InstagramUrl)}
              aria-label="Instagram"
            >
              <img src={instagramIcon} alt="Instagram" />
            </button>
          )}
          {(isOwnProfile || IndeedUrl) && (
            <button
              className="connect-with-me-icon"
              onClick={() => handleIconClick("indeed", IndeedUrl)}
              aria-label="Indeed"
            >
              <img src={indeedIcon} alt="Indeed" />
            </button>
          )}
        </div>
      </div>

      {isOwnProfile && (
        <EditSocialMediaDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          platform={selectedPlatform}
          currentUrl={getCurrentUrl()}
        />
      )}
    </>
  );
}
