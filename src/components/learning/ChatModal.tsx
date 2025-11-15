import { useRef, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "../ui/drawer";
import { Button } from "../ui/button";
import HappyRocky from "../avatar/HappyRocky";
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

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent className="chat-drawer-content w-full sm:w-[500px]">
        <DrawerHeader className="chat-drawer__header">
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
