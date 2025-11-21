import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../lib/api";
import type { Friend, FriendsResponse } from "../../types/friend";
import { getUserDisplayName, getLanguageCode } from "../../utils/userHelpers";
import { getLanguageFlag } from "../../utils/languageFlagHelpers";
import { useProfile } from "../../hooks/useProfile";
import goBackIcon from "../../assets/icons/goBackIcon.svg";
import rockyLogo from "/rocky.svg";
import rockyWhiteLogo from "/rockyWhite.svg";
import { AvatarDisplay } from "../../components/avatar";
// Styles will be added later

type TabType = "friends" | "followers" | "following";

const ViewFriendsPage: React.FC = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("friends");
  const { data: profile } = useProfile();

  // Fetch friends (mutual follows only)
  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ["viewFriends", "friends"],
    queryFn: async (): Promise<Friend[]> => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/friendships/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch friends");
      }

      const data: FriendsResponse = await res.json();
      return data.data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });

  // Fetch followers
  const { data: followers = [], isLoading: followersLoading } = useQuery({
    queryKey: ["viewFriends", "followers"],
    queryFn: async (): Promise<Friend[]> => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/friendships/followers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch followers");
      }

      const data: FriendsResponse = await res.json();
      return data.data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });

  // Fetch following
  const { data: following = [], isLoading: followingLoading } = useQuery({
    queryKey: ["viewFriends", "following"],
    queryFn: async (): Promise<Friend[]> => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/friendships/following`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch following");
      }

      const data: FriendsResponse = await res.json();
      return data.data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });

  const getCurrentData = () => {
    switch (activeTab) {
      case "friends":
        return { data: friends, loading: friendsLoading };
      case "followers":
        return { data: followers, loading: followersLoading };
      case "following":
        return { data: following, loading: followingLoading };
      default:
        return { data: [], loading: false };
    }
  };

  const { data: currentData, loading: currentLoading } = getCurrentData();

  const renderUserList = (users: Friend[]) => {
    if (users.length === 0) {
      return (
        <div className="view-friends-empty">
          <p>No {activeTab} found</p>
        </div>
      );
    }

    return (
      <div className="leaderboard-list">
        {users.map((user, index) => {
          const actualRank = index + 1;
          const isCurrentUser = user.id === profile?.id;
          const languageFlag = getLanguageFlag(user.language ?? null);
          return (
            <div
              key={user.id}
              className={`leaderboard-item leaderboard-item--regular ${
                isCurrentUser ? "leaderboard-item--current-user" : ""
              } leaderboard-item--clickable`}
              onClick={() => {
                if (!isCurrentUser) {
                  navigate(`/profile/friends/${user.id}`, { state: { from: "/community/friends" } });
                }
              }}
            >
              <div className="leaderboard-item-content leaderboard-item-content--regular">
                <span className="leaderboard-item-rank">{actualRank}</span>
                {user.avatar ? (
                  <AvatarDisplay
                    config={user.avatar}
                    size={48}
                    className="leaderboard-item-avatar"
                  />
                ) : (
                  <img
                    src={rockyLogo}
                    alt="Rocky"
                    className="leaderboard-item-logo leaderboard-item-logo--regular"
                  />
                )}
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
        })}
      </div>
    );
  };

  return (
    <div className="container container--leaderboard">
      <div className="leaderboard-page view-friends-page">
        <div className="leaderboard-hero">
          <div className="leaderboard-header">
            <button
              className="leaderboard-back-button"
              onClick={() => navigate("/community")}
            >
              <img src={goBackIcon} alt="Back" />
            </button>
            <div className="leaderboard-title-section">
              <h1 className="leaderboard-title">Friends</h1>
              <p className="view-friends-description">
                Browse your friends, followers, and following... Follow back followers to become friends and share customized lessons!
              </p>
            </div>
            <div className="leaderboard-header-actions">
              <button
                className="view-friends-avatar-button"
                onClick={() => navigate("/profile")}
                aria-label="Profile"
              >
                <img src={rockyWhiteLogo} alt="Rocky" className="view-friends-avatar" />
              </button>
            </div>
          </div>

          <div className="view-friends-tabs">
            <button
              type="button"
              className={`view-friends-tab ${
                activeTab === "friends" ? "view-friends-tab--active" : ""
              }`}
              onClick={() => setActiveTab("friends")}
            >
              Friends
            </button>
            <button
              type="button"
              className={`view-friends-tab ${
                activeTab === "followers" ? "view-friends-tab--active" : ""
              }`}
              onClick={() => setActiveTab("followers")}
            >
              Followers
            </button>
            <button
              type="button"
              className={`view-friends-tab ${
                activeTab === "following" ? "view-friends-tab--active" : ""
              }`}
              onClick={() => setActiveTab("following")}
            >
              Following
            </button>
          </div>
        </div>

        <div className="leaderboard-drawer">
          {currentLoading ? (
            <div className="view-friends-loading">Loading...</div>
          ) : (
            renderUserList(currentData)
          )}
        </div>
      </div>
      <div className="view-friends-add-button-container">
        <button
          className="view-friends-add-button"
          onClick={() => navigate("/profile/friends")}
        >
          Add Friends
        </button>
      </div>
    </div>
  );
};

export default ViewFriendsPage;

