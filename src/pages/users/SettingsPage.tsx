import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useMutation } from "@tanstack/react-query";
import { useProfile } from "../../hooks/useProfile";
import PrivacyDrawer from "../drawers/PrivacyDrawer";
import ChatModal from "../../components/learning/ChatModal";
import type { ChatMessage } from "../../types/components/quiz";
import { BACKEND_URL } from "../../lib/api";
import goBackIcon from '../../assets/icons/goBackIcon.svg';
import reportIssueIcon from '../../assets/icons/reportIssue.svg';
import faqIcon from '../../assets/icons/faq.svg';
import needHelpIcon from '../../assets/icons/needHelp.svg';
import themeIcon from '../../assets/icons/theme-icon.svg';
import '../../styles/pages/_settings.scss';

// Language mapping for display
const languageDisplayNames: { [key: string]: string } = {
  english: 'English',
  chinese: 'Chinese (simplified)',
  french: 'French',
  korean: 'Korean',
  punjabi: 'Punjabi',
  spanish: 'Spanish',
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const { signOut, getToken } = useAuth();
  const { data: profile } = useProfile();
  const [isPrivacyDrawerOpen, setIsPrivacyDrawerOpen] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatPrompt, setChatPrompt] = useState("");
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [showLogoutDrawer, setShowLogoutDrawer] = useState(false);

  // Get display name for the current language
  const currentLanguage = profile?.language || 'english';
  const languageDisplayName = languageDisplayNames[currentLanguage] || 'English';

  const handleLogout = async () => {
    try {
      await signOut({ redirectUrl: "/" });
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/";
    }
  };

  // Chat handlers
  const handleOpenChat = () => {
    setShowChatModal(true);
  };

  const handleCloseChat = () => {
    setShowChatModal(false);
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
      setChatPrompt("");
    },
  });

  const handleSendChat = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatPrompt.trim() || chatMutation.isPending) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: chatPrompt,
      id: Date.now().toString(),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    chatMutation.mutate(chatPrompt);
  };
  const handleToggleTheme = () => {
    setIsDarkTheme((prev) => !prev);
  };

  const handleThemeInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    handleToggleTheme();
  };

  const handleOpenLogoutDrawer = () => setShowLogoutDrawer(true);
  const handleCloseLogoutDrawer = () => setShowLogoutDrawer(false);

  const handleConfirmLogout = async () => {
    await handleLogout();
    setShowLogoutDrawer(false);
  };

  const themeLabel = isDarkTheme ? "Dark" : "Light";

  return (
    <div className="container">
      <div className={`settings-page${isDarkTheme ? " settings-page--dark" : ""}`}>
        {/* Header */}
        <div className="settings-header">
          <button
            className="settings-back-button"
            onClick={() => navigate(-1)}
            aria-label="Go Back"
          >
            <img src={goBackIcon} alt="Go Back" />
          </button>
          <h1 className="settings-title">Settings</h1>
          <div className="settings-header-spacer" />
        </div>

        {/* General Section */}
        <div className="settings-section">
          <h2 className="settings-section-title">General</h2>

          <button
            className="settings-item"
            onClick={() => navigate("/account")}
          >
            <div className="settings-item-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span className="settings-item-label">Account</span>
            <svg className="settings-item-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <button
            className="settings-item"
            onClick={() => navigate("/onboarding/language")}
          >
            <div className="settings-item-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 8l6 6" />
                <path d="M4 14l6-6 2-3" />
                <path d="M2 5h12" />
                <path d="M7 2h1" />
                <path d="M22 22l-5-10-5 10" />
                <path d="M14 18h6" />
              </svg>
            </div>
            <span className="settings-item-label">Language</span>
            <span className="settings-item-value">{languageDisplayName}</span>
            <svg className="settings-item-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <button
            className="settings-item"
            onClick={() => navigate("/notifications")}
          >
            <div className="settings-item-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <span className="settings-item-label">Notification</span>
            <svg className="settings-item-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <button
            type="button"
            className="settings-item"
            onClick={handleToggleTheme}
          >
            <div className="settings-item-icon">
              <img src={themeIcon} alt="Theme" />
            </div>
            <span className="settings-item-label">Theme</span>
            <span className="settings-item-value">{themeLabel}</span>
            <label
              className="settings-toggle"
              aria-label="Toggle theme"
              onClick={(event) => event.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={isDarkTheme}
                onChange={handleThemeInputChange}
                aria-checked={isDarkTheme}
              />
              <span className="settings-toggle-slider" aria-hidden="true" />
            </label>
          </button>

          <button
            className="settings-item"
            onClick={() => setIsPrivacyDrawerOpen(true)}
          >
            <div className="settings-item-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <span className="settings-item-label">Privacy</span>
            <svg className="settings-item-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Support Section */}
        <div className="settings-section">
          <h2 className="settings-section-title">Support</h2>

          <button
            className="settings-item"
            onClick={() => {
              // TODO: Navigate to report issue page or open contact form
              console.log("Report an issue clicked");
            }}
          >
            <div className="settings-item-icon">
              <img src={reportIssueIcon} alt="Report Issue" />
            </div>
            <span className="settings-item-label">Report an issue</span>
            <svg className="settings-item-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <button
            className="settings-item"
            onClick={() => {
              // TODO: Navigate to FAQ page
              console.log("FAQ clicked");
            }}
          >
            <div className="settings-item-icon">
              <img src={faqIcon} alt="FAQ" />
            </div>
            <span className="settings-item-label">FAQ</span>
            <svg className="settings-item-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <button
            className="settings-item"
            onClick={handleOpenChat}
          >
            <div className="settings-item-icon">
              <img src={needHelpIcon} alt="Need Help" />
            </div>
            <span className="settings-item-label">Need Help</span>
            <svg className="settings-item-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Logout Button */}
        <button
          className="settings-logout-button"
          onClick={handleOpenLogoutDrawer}
        >
          Log out
        </button>
      </div>

      {/* Privacy Drawer */}
      <PrivacyDrawer
        open={isPrivacyDrawerOpen}
        onOpenChange={setIsPrivacyDrawerOpen}
      />

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

      {showLogoutDrawer && (
        <div
          className="logout-drawer-overlay"
          role="dialog"
          aria-modal="true"
          onClick={handleCloseLogoutDrawer}
        >
          <div className="logout-drawer" onClick={(event) => event.stopPropagation()}>
            <span className="logout-drawer-handle" aria-hidden="true" />
            <p className="logout-drawer-title">Do you want to log out your account?</p>
            <button className="logout-drawer-confirm" onClick={handleConfirmLogout}>
              Yes
            </button>
            <button className="logout-drawer-cancel" onClick={handleCloseLogoutDrawer}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
