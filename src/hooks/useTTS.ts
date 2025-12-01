import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";

interface TTSResponse {
  success: boolean;
  audio: string;
  format: string;
  language: string;
}

export function useTTS() {
  const { getToken } = useAuth();
  const [loadingTerm, setLoadingTerm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const speak = async (text: string, language: string = "english") => {
    if (!text || text.trim().length === 0) {
      setError("Text is required");
      return;
    }

    setLoadingTerm(text);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      // Call the TTS API
      const response = await fetch(`${BACKEND_URL}/tts/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, language }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to generate speech" }));
        throw new Error(errorData.error || "Failed to generate speech");
      }

      const data: TTSResponse = await response.json();

      if (!data.success || !data.audio) {
        throw new Error("Invalid response from TTS service");
      }

      // Convert base64 audio to blob and play
      const audioBlob = base64ToBlob(data.audio, `audio/${data.format}`);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      // Play the audio
      await new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve(undefined);
        };
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          reject(new Error("Failed to play audio"));
        };
        audio.play().catch(reject);
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate speech";
      setError(errorMessage);
      console.error("TTS error:", err);
    } finally {
      setLoadingTerm(null);
    }
  };

  const isLoading = (text: string) => loadingTerm === text;

  return { speak, isLoading, error };
}

/**
 * Convert base64 string to Blob
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

