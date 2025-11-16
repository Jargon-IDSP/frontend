import { useRef, useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
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
  const drawerBodyRef = useRef<HTMLDivElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Force layout recalculation when keyboard state changes
  useEffect(() => {
    if (drawerBodyRef.current) {
      // Trigger reflow to ensure proper layout
      void drawerBodyRef.current.offsetHeight;
    }
  }, [isInputFocused]);

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
        // Force layout recalculation
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: 'auto' });
        });
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
      // Force a layout recalculation after state update
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
      });
    }, 100);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndTime = Date.now();

    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;
    const deltaTime = touchEndTime - touchStartTime.current;

    // Check if it's a left-to-right swipe (positive deltaX)
    // Swipe should be at least 100px horizontally
    // Swipe should be more horizontal than vertical
    // Swipe should be completed within 500ms
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    const isLeftToRight = deltaX > 0;
    const isLongEnough = Math.abs(deltaX) > 100;
    const isFastEnough = deltaTime < 500;

    if (isHorizontalSwipe && isLeftToRight && isLongEnough && isFastEnough) {
      onClose();
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent
        className={`chat-drawer-content ${isInputFocused ? 'chat-drawer-content--input-focused' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <DrawerHeader className={`chat-drawer__header ${isInputFocused ? 'chat-drawer__header--hidden' : ''}`}>
          <div className="chat-drawer__title">
            <HappyRocky />
            <DrawerTitle>Need Help? Ask Rocky!</DrawerTitle>
          </div>
        </DrawerHeader>

        <div className="chat-drawer__body" ref={drawerBodyRef}>
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
