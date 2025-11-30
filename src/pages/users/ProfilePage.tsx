import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { useProfile } from "../../hooks/useProfile";
import { DocumentsList } from "../documents/DocumentList";
import { useUserBadges } from "../../hooks/useUserBadges";
import { useCustomFlashcardStats } from "../../hooks/useCustomFlashcardStats";
import PrivacyDrawer from "../drawers/PrivacyDrawer";
import NotificationBell from "../../components/NotificationBell";
import ChatModal from "../../components/learning/ChatModal";
import LoadingBar from "../../components/LoadingBar";
import rockyWhiteLogo from '../../../public/rockyWhite.svg';
import goBackIcon from '../../assets/icons/goBackIcon.svg';
import MonthlyActivity from "../../components/MonthlyActivity";
import SelfLeaderboard from "../../components/SelfLeaderboard";
import { AvatarDisplay } from "../../components/avatar";
import { BACKEND_URL } from "../../lib/api";
import type { ChatMessage } from "../../types/components/quiz";
import settingsIcon from '../../assets/icons/settingsIcon.svg';
import '../../styles/pages/_profile.scss';
import '../../styles/pages/_friendProfile.scss';

// Eagerly import all badge images using glob
const badgeModules = import.meta.glob<string>('../../assets/badges/**/*.svg', {
  eager: true,
  import: 'default'
});

const industryIdToName: { [key: number]: string } = {
  1: 'Electrician',
  2: 'Plumber',
  3: 'Carpenter',
  4: 'Mechanic',
  5: 'Welder',
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { data, error: queryError, isLoading } = useProfile();
  const [isPrivacyDrawerOpen, setIsPrivacyDrawerOpen] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatPrompt, setChatPrompt] = useState("");
  const { data: userBadges, isLoading: badgesLoading } = useUserBadges();
  const {
    data: customWordCount = 0,
    isLoading: customWordCountLoading,
    isError: customWordCountError,
  } = useCustomFlashcardStats();

  const isPageLoading = isLoading || badgesLoading || customWordCountLoading;
  const accountCreatedAt = data?.createdAt ? new Date(data.createdAt) : null;
  const accountAgeDays = accountCreatedAt
    ? Math.max(
        1,
        Math.floor(
          (Date.now() - accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
        )
      )
    : null;
  const customWordCountDisplay = customWordCountLoading
    ? "…"
    : customWordCountError
    ? "—"
    : customWordCount.toLocaleString();
  const [activeProfileTab, setActiveProfileTab] = useState<
    "archives" | "achievements"
  >("archives");

  const error = queryError ? (queryError as Error).message : null;

  // Get badge icon URLs from glob imports
  const badgeIcons = useMemo(() => {
    if (!userBadges) return [];

    return userBadges.map((userBadge) => {
      if (userBadge.badge?.iconUrl) {
        const iconPath = userBadge.badge.iconUrl;
        const fullPath = `../../assets/badges/${iconPath}`;
        const url = badgeModules[fullPath];
        return {
          id: userBadge.id,
          name: userBadge.badge.name,
          url: url || null
        };
      }
      return null;
    }).filter((icon): icon is { id: string; name: string; url: string } => icon !== null && icon.url !== null);
  }, [userBadges]);

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  // Chat handlers
  const handleOpenChat = () => {
    setShowChatModal(true);
  };

  const handleCloseChat = () => {
    setShowChatModal(false);
    setChatPrompt("");
    setChatHistory([]);
    chatMutation.reset();
  };

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const token = await getToken();
      const contextualPrompt = `You are a friendly, helpful tutor assisting immigrants learning skilled trades terminology in British Columbia, Canada. Your role is to explain concepts in simple, clear language. Give short, conversational answers (2-4 sentences) that are warm and encouraging. Use everyday examples when helpful.

Student's question: ${prompt}

Remember: Be supportive, keep it brief, and explain like you're talking to a friend who's learning English and trades at the same time.`;

      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: contextualPrompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from Rocky");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      let fullResponse = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullResponse += decoder.decode(value, { stream: true });
      }

      return fullResponse;
    },
    onSuccess: (response) => {
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response,
        id: Date.now().toString(),
      };
      setChatHistory((prev) => [...prev, assistantMessage]);
      // Input already cleared in handleSendChat
    },
  });

  const handleSendChat = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatPrompt.trim() || chatMutation.isPending) return;

    const promptToSend = chatPrompt.trim();
    setChatPrompt("");  // Clear immediately for better UX

    const userMessage: ChatMessage = {
      role: "user",
      content: promptToSend,
      id: Date.now().toString(),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    chatMutation.mutate(promptToSend);
  };

  return (
    <>
      {/* Privacy Settings Drawer */}
      <PrivacyDrawer
        open={isPrivacyDrawerOpen}
        onOpenChange={setIsPrivacyDrawerOpen}
      />

      <div className="container">
        <div className="profile-page">
          {/* Header with title and settings icon */}
          <div className="profile-header">
          <button
            className="profile-go-back-button"
            onClick={() => navigate(-1)}
            aria-label="Go Back"
          >
            <img src={goBackIcon} alt="Go Back" />
          </button>
          <h1 className="profile-header-title">Profile</h1>
          <div className="profile-header-actions">
            <NotificationBell />
            <button
              className="profile-settings-icon"
              onClick={handleSettingsClick}
              aria-label="Settings"
            >
              <img src={settingsIcon} alt="settings" className="settings-logo" />
            </button>
          </div>
        </div>

        {isPageLoading && (
          <LoadingBar isLoading={true} text="Loading profile" />
        )}

        {error && <div className="error-message">Error: {error}</div>}

        {!isPageLoading && data && (
          <div className="profile-content">
            {/* Profile Avatar Section */}
            <div className="profile-avatar-section">
              <div className="profile-avatar-large">
                {data.avatar ? (
                  <AvatarDisplay
                    config={data.avatar}
                    size={120}
                    className="profile-avatar-large-avatar"
                  />
                ) : (
                  <img src={rockyWhiteLogo} alt="User Avatar" className="profile-avatar-large-image" />
                )}
              </div>
              <h2 className="profile-avatar-name">
                {data.firstName
                  ? `${data.firstName}`
                  : data.username || data.email || 'User'}
              </h2>
              <p className="profile-avatar-industry">
                {data.industryId ? industryIdToName[data.industryId] || 'Not set' : 'Not set'}
              </p>
            </div>

            {/* Monthly Activity */}
            <MonthlyActivity />

            {/* Quick Stats */}
            <div className="profile-mini-cards">
              <div className="profile-mini-card">
                <p className="profile-mini-card-value">
                  {customWordCountDisplay}
                </p>
                <p className="profile-mini-card-label">Vocabulary</p>
              </div>
              <div className="profile-mini-card">
                <p className="profile-mini-card-value">
                  {accountAgeDays ? accountAgeDays.toLocaleString() : "—"}
                </p>
                <p className="profile-mini-card-label">Days</p>
              </div>
            </div>

            {/* Profile Card - Commented out for future use */}
            {/* <div className="profile-card">
              <div className="profile-card-avatar">
                <img src={rockyWhiteLogo} alt="User Avatar" className="profile-avatar-image" />
              </div>
              <div className="profile-card-info">
                <h2 className="profile-card-name">
                  {data.firstName
                    ? `${data.firstName}`
                    : data.username || data.email || 'User'}
                </h2>
                <p className="profile-card-industry">
                  {data.industryId ? industryIdToName[data.industryId] || 'Not set' : 'Not set'}
                </p>
              </div>
              <button
                className="profile-card-edit"
                onClick={() => navigate("/profile/manage")}
                aria-label="Edit profile"
              >
                <img src={editIcon} alt="Edit" />
              </button>
            </div> */}

            {/* Sections Tabs */}
            <div className="profile-sections">
              <div className="profile-tabs">
                <button
                  type="button"
                  className={`profile-tab-button ${
                    activeProfileTab === "archives" ? "profile-tab-button--active" : ""
                  }`}
                  onClick={() => setActiveProfileTab("archives")}
                >
                  Document Archives
                </button>
                <button
                  type="button"
                  className={`profile-tab-button ${
                    activeProfileTab === "achievements" ? "profile-tab-button--active" : ""
                  }`}
                  onClick={() => setActiveProfileTab("achievements")}
                >
                  Achievements
                </button>
              </div>

              <div className="profile-tab-panel">
                {activeProfileTab === "archives" ? (
                  <>
                    <div className="profile-documents">
                      <DocumentsList refresh={0} />
                    </div>
                    <div className="profile-help">
                      <button onClick={handleOpenChat}><span>Need Help? </span><span className="callR">Call Rocky!</span></button>
                    </div>
                  </>
                ) : (
                  <div className="profile-achievements">
                    
                    <div className="friend-profile-badges-section">
                      <h4 className="friend-profile-badges-subtitle">
                        Badge Collection
                      </h4>
                      <div className="friend-profile-badges-grid">
                        {badgeIcons.length > 0 ? (
                          badgeIcons.map((badge) => (
                            <div
                              key={badge.id}
                              className="friend-profile-badge-item"
                              title={badge.name}
                            >
                              <img
                                src={badge.url}
                                alt={badge.name}
                                className="friend-profile-badge-icon"
                              />
                            </div>
                          ))
                        ) : (
                          <p className="friend-profile-no-badges">
                            No badges earned yet.
                          </p>
                        )}
                      </div>
                    </div>
                    <div
                      className="friend-profile-badges-section"
                      onClick={() => navigate("/leaderboard/full?tab=self")}
                      style={{ cursor: "pointer" }}
                    >
                      <h4 className="friend-profile-badges-subtitle">Medals</h4>
                      <SelfLeaderboard showPlacements={false} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Chat Modal */}
      <ChatModal
        isOpen={showChatModal}
        onClose={handleCloseChat}
        chatHistory={chatHistory}
        chatPrompt={chatPrompt}
        onChatPromptChange={setChatPrompt}
        onSendChat={handleSendChat}
        isLoading={chatMutation.isPending}
      />
    </>
  );
}
