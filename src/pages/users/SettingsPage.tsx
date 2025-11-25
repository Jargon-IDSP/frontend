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

  const themeLabel = isDarkTheme ? "Dark" : "Light";

  return (
    <div className="container">
      <div className="settings-page">
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
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M9.86932 20C15.3201 20 19.7386 15.523 19.7386 10C19.7386 4.477 15.3201 0 9.86932 0C4.4185 0 0 4.477 0 10C0 15.523 4.4185 20 9.86932 20ZM9.86932 18.5V1.5C12.0942 1.5 14.228 2.39553 15.8012 3.98959C17.3744 5.58365 18.2582 7.74566 18.2582 10C18.2582 12.2543 17.3744 14.4163 15.8012 16.0104C14.228 17.6045 12.0942 18.5 9.86932 18.5Z" fill="black" />
              </svg>
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
          onClick={handleLogout}
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
    </div>
  );
}
