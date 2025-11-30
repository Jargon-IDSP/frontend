import { useState, useEffect } from "react";
import "../styles/components/_loadingBar.scss";
import loadingAnimation from "../assets/loadingAnimation.svg";

interface LoadingBarProps {
  isLoading: boolean;
  hasData?: boolean;
  hasError?: boolean;
  text?: string;
}

export default function LoadingBar({
  isLoading,
  hasData = false,
  hasError = false,
  text = "Loading",
}: LoadingBarProps) {
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setLoadingProgress(0);
      const interval = setInterval(() => {
         setLoadingProgress((prev) => (prev >= 90 ? prev : prev + 15));
     }, 150);
      return () => clearInterval(interval);
    } else if (hasData || hasError) {
      setLoadingProgress(100);
      const timeout = setTimeout(() => setLoadingProgress(0), 500);
      return () => clearTimeout(timeout);
    }
  }, [isLoading, hasData, hasError]);

  if (!isLoading) return null;

  return (
    <div className="loading-bar">
      <div className="loading-bar__animation">
        <img 
          src={loadingAnimation} 
          alt="Loading animation" 
          className="loading-bar__svg"
        />
      </div>
      <div className="loading-bar__track">
        <div
          className="loading-bar__fill"
          style={{ width: `${loadingProgress}%` }}
        />
      </div>
      <div className="loading-bar__text">
        {text}... {loadingProgress}%
      </div>
    </div>
  );
}
