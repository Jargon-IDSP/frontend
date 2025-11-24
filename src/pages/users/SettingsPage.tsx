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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
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
