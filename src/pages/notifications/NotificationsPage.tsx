import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { NotificationsList } from "../../components/NotificationsList";
import ChatModal from "../../components/learning/ChatModal";
import type { ChatMessage } from "../../types/components/quiz";
import { BACKEND_URL } from "../../lib/api";
import "../../styles/pages/_notifications.scss";

export default function NotificationsPage() {
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const [showChatModal, setShowChatModal] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [chatPrompt, setChatPrompt] = useState("");

    const handleOpenChat = () => {
        setShowChatModal(true);
    };

    const handleCloseChat = () => {
        setShowChatModal(false);
    };

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
        <div className='container'>
        <div className='notifications-page'>
            <div className='notifications-page__shell'>
                <div className='notifications-page__card'>
                    <div className='notifications-page__header'>
                        <button
                            className='notifications-page__back'
                            onClick={() => navigate(-1)}
                            aria-label='Go back'
                            type='button'>
                            <svg
                                viewBox='0 0 24 24'
                                fill='currentColor'
                                aria-hidden='true'>
                                <path d='M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z' />
                            </svg>
                        </button>
                        <h1 className='notifications-page__title'>
                            Notifications
                        </h1>
                    </div>

                    <div className='notifications-page__content'>
                        <NotificationsList />
                    </div>

                    <p className='notifications-page__support'>
                        Need help?{" "}
                        <button
                            onClick={handleOpenChat}
                            className="notifications-page__support-btn"
                            type="button"
                        >
                            Call Rocky!
                        </button>
                    </p>
                </div>
            </div>
        </div>

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
