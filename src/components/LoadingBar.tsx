import { useState, useEffect, useRef } from "react";
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
  const [isVisible, setIsVisible] = useState(false);

  const animationStartedRef = useRef(false);
  const animationLockedRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading && !animationStartedRef.current) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      animationStartedRef.current = true;
      animationLockedRef.current = true;
      setIsVisible(true);
      setLoadingProgress(0);

      intervalRef.current = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 15;
        });
      }, 150);
    } else if (!isLoading && animationStartedRef.current) {
      debounceTimerRef.current = setTimeout(() => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsVisible(false);
        setLoadingProgress(0);
        animationStartedRef.current = false;
        animationLockedRef.current = false;
      }, 300);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (intervalRef.current && !isLoading) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isLoading]);

  useEffect(() => {
    if (animationLockedRef.current && (hasData || hasError)) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      setLoadingProgress(100);

      const timeout = setTimeout(() => {
        setLoadingProgress(0);
        setIsVisible(false);
        animationStartedRef.current = false;
        animationLockedRef.current = false;
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [hasData, hasError]);

  if (!isVisible) return null;

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
