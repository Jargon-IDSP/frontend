import { useRef, useEffect } from "react";
import HappyRocky from "../avatar/HappyRocky";
import "../../styles/components/_chatbox.scss";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuestion: string;
  chatReply: string;
  chatPrompt: string;
  onChatPromptChange: (value: string) => void;
  onSendChat: (e?: React.FormEvent) => void;
  isLoading: boolean;
}

export default function ChatModal({
  isOpen,
  onClose,
  currentQuestion,
  chatReply,
  chatPrompt,
  onChatPromptChange,
  onSendChat,
  isLoading,
}: ChatModalProps) {
  const chatReplyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatReplyRef.current) {
      chatReplyRef.current.scrollTop = chatReplyRef.current.scrollHeight;
    }
  }, [chatReply]);

  if (!isOpen) return null;

  return (
    <div className="container">
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chat-modal__header">
          <div className="chat-modal__title">
            <HappyRocky />
            <h2>Need Help? Ask Rocky!</h2>
          </div>
          <button
            className="chat-modal__close"
            onClick={onClose}
            aria-label="Close chat"
          >
            ×
          </button>
        </div>

        <div className="chat-modal__question">
          <strong>Current Question:</strong> {currentQuestion}
        </div>

        {chatReply && (
          <div className="chat-modal__reply" ref={chatReplyRef}>
            {chatReply}
          </div>
        )}

        <form className="chat-modal__form" onSubmit={onSendChat}>
          <input
            type="text"
            value={chatPrompt}
            onChange={(e) => onChatPromptChange(e.target.value)}
            placeholder="Ask your question..."
            disabled={isLoading}
            className="chat-modal__input"
          />
          <button
            type="submit"
            disabled={isLoading || !chatPrompt.trim()}
            className="chat-modal__submit"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
    </div>
  );
}