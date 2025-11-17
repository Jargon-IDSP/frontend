import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Camera } from "lucide-react";
import { BACKEND_URL } from "../../lib/api";
import type { SearchResult, SearchResponse } from "../../types/friend";
import { getUserDisplayName, getLanguageCode } from "../../utils/userHelpers";
import { getLanguageFlag } from "../../utils/languageFlagHelpers";
import { useProfile } from "../../hooks/useProfile";
import QRScannerModal from "../../components/QRScannerModal";
import QRProfileDrawer from "../drawers/QRProfileDrawer";
import goBackIcon from "../../assets/icons/goBackIcon.svg";
import searchIconBlue from "../../assets/icons/searchIconBlue.svg";
import rockyWhiteLogo from "/rockyWhite.svg";
import rockyLogo from "/rocky.svg";
import "../../styles/pages/_friends.scss";

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isQRDrawerOpen, setIsQRDrawerOpen] = useState(false);
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const { data: profile } = useProfile();

  // Fetch friend suggestions
  const { data: suggestions = [], isLoading: suggestionsLoading } = useQuery({
    queryKey: ["friendSuggestions"],
    queryFn: async (): Promise<SearchResult[]> => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/friendships/suggestions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data: SearchResponse = await res.json();
      return data.data || [];
    },
    staleTime: 60 * 1000, // 1 minute
    retry: 2,
  });

  // Search users mutation
  const searchUsersMutation = useMutation({
    mutationFn: async (query: string): Promise<SearchResult[]> => {
      if (query.length < 2) {
        throw new Error("Search query must be at least 2 characters");
      }

      const token = await getToken();
      const res = await fetch(
        `${BACKEND_URL}/friendships/search?q=${encodeURIComponent(query)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to search users");
      }

      const data: SearchResponse = await res.json();
      return data.data || [];
    },
    onSuccess: (data) => {
      setSearchResults(data);
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
      setSearchResults([]);
    },
  });

  // Real-time search with debouncing
  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length === 0) {
      setSearchResults([]);
      setError(null);
      return;
    }

    if (trimmedQuery.length < 2) {
      setSearchResults([]);
      setError(null);
      return;
    }

    // Debounce: wait 500ms after user stops typing
    const timeoutId = setTimeout(() => {
      setError(null);
      searchUsersMutation.mutate(trimmedQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setError(null);
  };

  const handleQRScanSuccess = (decodedText: string) => {
    // Extract user ID from QR code
    // QR code might be a URL like: https://app.jargon.com/user/123
    // or https://app.jargon.com/profile/friends/123 or just a user ID

    // If it's a URL, extract the user ID
    const profileUrlMatch = decodedText.match(/\/profile\/friends\/([^\/\?]+)/);
    const userUrlMatch = decodedText.match(/\/user\/([^\/\?]+)/);

    if (profileUrlMatch) {
      const userId = profileUrlMatch[1];
      // Navigate directly to the friend profile page
      navigate(`/profile/friends/${userId}`, {
        state: { from: "/profile/friends" },
      });
      setIsQRScannerOpen(false);
      return;
    } else if (userUrlMatch) {
      const userId = userUrlMatch[1];
      // Navigate directly to the friend profile page
      navigate(`/profile/friends/${userId}`, {
        state: { from: "/profile/friends" },
      });
      setIsQRScannerOpen(false);
      return;
    }

    // If it's not a profile URL, treat it as a search query
    // This could be a user ID (starts with "user_"), username, or email
    const trimmedText = decodedText.trim();

    if (trimmedText && trimmedText.length > 0) {
      // Close the scanner and search for the text
      setIsQRScannerOpen(false);
      setSearchQuery(trimmedText);

      // If it looks like a user ID (starts with "user_"), search for it
      // Otherwise search as normal (username, email, etc.)
      searchUsersMutation.mutate(trimmedText);
    } else {
      setError("Invalid QR code format");
    }
  };

  // Determine what to show in drawer
  const showSuggestions =
    searchQuery.trim().length === 0 && searchResults.length === 0;
  const showSearchResults =
    searchQuery.trim().length >= 2 && searchResults.length > 0;
  const showEmptySearch =
    searchQuery.trim().length >= 2 &&
    searchResults.length === 0 &&
    !searchUsersMutation.isPending;

  const renderUserItem = (user: SearchResult) => {
    const languageFlag = getLanguageFlag(user.language ?? null);
    const isCurrentUser = user.id === profile?.id;

    return (
      <div
        key={user.id}
        className={`leaderboard-item leaderboard-item--regular ${
          isCurrentUser ? "leaderboard-item--current-user" : ""
        } leaderboard-item--clickable`}
        onClick={() => {
          if (!isCurrentUser) {
            navigate(`/profile/friends/${user.id}`, {
              state: { from: "/profile/friends" },
            });
          }
        }}
      >
        <div className="leaderboard-item-content leaderboard-item-content--regular">
          <img
            src={rockyLogo}
            alt="Rocky"
            className="leaderboard-item-logo leaderboard-item-logo--regular"
          />
          <div className="leaderboard-item-text">
            <span className="leaderboard-item-name">
              {getUserDisplayName(user)}
              {isCurrentUser && (
                <span className="leaderboard-item-you">(You)</span>
              )}
            </span>
          </div>
        </div>
        <div className="leaderboard-item-details">
          {languageFlag && (
            <img
              src={languageFlag.src}
              alt={languageFlag.alt}
              className="leaderboard-item-flag"
            />
          )}
          <span className="leaderboard-item-language">
            {getLanguageCode(user.language ?? null)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="container container--leaderboard">
      <div className="leaderboard-page friends-page-new">
        <div className="leaderboard-hero">
          <div className="leaderboard-header">
            <button
              className="leaderboard-back-button"
              onClick={() => navigate(-1)}
            >
              <img src={goBackIcon} alt="Back" />
            </button>
            <div className="leaderboard-title-section">
              <h1 className="leaderboard-title">Friends</h1>
              <p className="view-friends-description">
                Add more friends to compete with and share your custom lessons
                with!
              </p>
            </div>
            <div className="leaderboard-header-actions">
              <button
                className="view-friends-avatar-button"
                onClick={() => navigate("/profile")}
                aria-label="Profile"
              >
                <img
                  src={rockyWhiteLogo}
                  alt="Rocky"
                  className="view-friends-avatar"
                />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="friends-search-container-new">
            <img
              src={searchIconBlue}
              alt="Search"
              className="friends-search-icon"
            />
            <input
              type="text"
              className="friends-search-input-new"
              placeholder="Search by username, email, or scan a QR code"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
            />
            <button
              className="friends-search-camera-button"
              onClick={() => setIsQRScannerOpen(true)}
              aria-label="Scan QR code"
              type="button"
            >
              <Camera size={18} />
            </button>
            {searchQuery.trim().length > 0 && (
              <button
                className="friends-search-clear-button"
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          {error && <div className="friends-error-message-new">{error}</div>}
        </div>

        <div className="leaderboard-drawer">
          {showSuggestions && (
            <>
              {suggestionsLoading ? (
                <div className="view-friends-loading">
                  Loading suggestions...
                </div>
              ) : (
                <>
                  <h2 className="friends-suggestions-title">
                    Friend Suggestions
                  </h2>
                  {suggestions.length === 0 ? (
                    <div className="view-friends-empty">
                      <p>No suggestions available</p>
                    </div>
                  ) : (
                    <div className="leaderboard-list">
                      {suggestions.map((user) => renderUserItem(user))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {showSearchResults && (
            <div className="leaderboard-list">
              {searchResults.map((user) => renderUserItem(user))}
            </div>
          )}

          {showEmptySearch && (
            <div className="view-friends-empty">
              <p>No users found matching "{searchQuery}"</p>
            </div>
          )}

          {searchUsersMutation.isPending && (
            <div className="view-friends-loading">Searching...</div>
          )}
        </div>
      </div>
      <div className="friends-share-qr-button-container">
        <button
          className="friends-share-qr-button"
          onClick={() => setIsQRDrawerOpen(true)}
        >
          Share my QR code
        </button>
      </div>
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanSuccess={handleQRScanSuccess}
      />
      <QRProfileDrawer
        open={isQRDrawerOpen}
        onOpenChange={setIsQRDrawerOpen}
        userId={profile?.id || ""}
        displayName={getUserDisplayName(profile)}
        username={profile?.username || profile?.email || ""}
      />
    </div>
  );
}
