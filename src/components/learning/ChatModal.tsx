import { useRef, useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "../ui/drawer";
import { Button } from "../ui/button";
import HappyRocky from "../avatar/rocky/HappyRocky";
import type { ChatModalProps } from "../../types/components/quiz";
import "../../styles/components/_chatbox.scss";

export default function ChatModal({
  isOpen,
  onClose,
  currentQuestion,
  chatHistory,
  chatPrompt,
  onChatPromptChange,
  onSendChat,
  isLoading,
}: ChatModalProps) {
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Cleanup blur timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  // Handle window resize to detect keyboard close on mobile
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      // On mobile, if the viewport height increases significantly,
      // it likely means the keyboard was closed
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const screenHeight = window.screen.height;

      // If viewport is close to screen height, keyboard is likely closed
      if (currentHeight > screenHeight * 0.8 && isInputFocused) {
        setIsInputFocused(false);
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, isInputFocused]);

  const handleInputFocus = () => {
    // Clear any pending blur timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsInputFocused(true);
  };

  const handleInputBlur = () => {
    // Use a timeout to ensure the blur state is set after keyboard closes
    // This helps with mobile keyboard behavior
    blurTimeoutRef.current = setTimeout(() => {
      setIsInputFocused(false);
    }, 100);
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent className={`chat-drawer-content w-full sm:w-[500px] ${isInputFocused ? 'chat-drawer-content--input-focused' : ''}`}>
        <DrawerHeader className={`chat-drawer__header ${isInputFocused ? 'chat-drawer__header--hidden' : ''}`}>
          <div className="chat-drawer__title">
            <HappyRocky />
            <DrawerTitle>Need Help? Ask Rocky!</DrawerTitle>
          </div>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="chat-drawer__close"
              aria-label="Close chat"
            >
              ×
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="chat-drawer__body">
          <div className="chat-drawer__question">
            <strong>Current Question:</strong> {currentQuestion}
          </div>

          {chatHistory.length > 0 && (
            <div className="chat-drawer__messages" ref={chatMessagesRef}>
              {chatHistory.map((message) => (
                <div
                  key={message.id}
                  className={`chat-drawer__message chat-drawer__message--${message.role}`}
                >
                  <div className="chat-drawer__message-content">
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          )}

          {chatHistory.length === 0 && (
            <div className="chat-drawer__empty">
              <p>
                Start a conversation with Rocky! Ask any question about the
                current quiz question.
              </p>
            </div>
          )}

          <form className="chat-drawer__form" onSubmit={onSendChat}>
            <input
              type="text"
              value={chatPrompt}
              onChange={(e) => onChatPromptChange(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Ask your question..."
              disabled={isLoading}
              className="chat-drawer__input"
            />
            <button
              type="submit"
              disabled={isLoading || !chatPrompt.trim()}
              className="chat-drawer__submit"
            >
              {isLoading ? "..." : "Send"}
            </button>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
