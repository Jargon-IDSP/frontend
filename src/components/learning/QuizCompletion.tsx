import Star from "../../assets/icons/star.svg";
import type { QuizCompletionProps } from "../../types/components/quiz";
import { useUserBadges } from "../../hooks/useUserBadges";
import { useMemo, useEffect, useRef } from "react";
import goBackIcon from "../../assets/icons/goBackIcon.svg";
import confetti from "canvas-confetti";
import confettiSound from "../../assets/sounds/confetti.mp3";

const badgeModules = import.meta.glob<string>("../../assets/badges/**/*.svg", {
  eager: true,
  import: "default",
});

export default function QuizCompletion({
  score,
  totalQuestions: _totalQuestions,
  onBack,
  isBossQuiz = false,
  passed = true,
}: QuizCompletionProps) {
  const { data: userBadges } = useUserBadges();

  const failedBossQuiz = isBossQuiz && !passed;

  const headingMessage = failedBossQuiz
    ? "So Close!"
    : isBossQuiz
    ? "Congrats!"
    : "Awesome!";

  const completionMessage = failedBossQuiz
    ? "Try again to earn your badge"
    : isBossQuiz
    ? "You completed your course"
    : "You've finished this lesson";
  const pointsPerQuestion = isBossQuiz ? 20 : 10;

  const latestBadge =
    userBadges && userBadges.length > 0 ? userBadges[0] : null;

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const playSound = (soundUrl: string) => {
    try {
      const audio = new Audio(soundUrl);
      audio.volume = 0.5; // Set volume to 50% to avoid being too loud
      audio.play().catch((error) => {
        // Silently handle errors (e.g., user hasn't interacted with page yet)
        console.log("Could not play sound:", error);
      });
    } catch (error) {
      console.log("Error playing sound:", error);
    }
  };

  useEffect(() => {
    playSound(confettiSound);

    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "1000";
    canvas.style.top = "0";
    canvas.style.left = "0";
    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    const myConfetti = confetti.create(canvas, {
      resize: true,
    });

    const duration = 3000;
    const animationEnd = Date.now() + duration;

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    function updateCanvasBounds() {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      canvas.style.top = `${rect.top}px`;
      canvas.style.left = `${rect.left}px`;
    }

    updateCanvasBounds();

    const handleResize = () => updateCanvasBounds();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    const defaults = {
      startVelocity: 15,
      spread: 360,
      ticks: 100,
      gravity: 0.6,
      zIndex: 0,
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      updateCanvasBounds();
      const particleCount = 50 * (timeLeft / duration);


      myConfetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      myConfetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
      myConfetti.reset();
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, []);

  const badgeIconUrl = useMemo(() => {
    if (latestBadge?.badge?.iconUrl) {
      const iconPath = latestBadge.badge.iconUrl;
      const fullPath = `../../assets/badges/${iconPath}`;
      const url = badgeModules[fullPath];
      if (url) {
        return url;
      } else {
        console.error(
          "❌ Badge not in glob. Tried:",
          fullPath,
          "Available:",
          Object.keys(badgeModules)
        );
        return null;
      }
    }
    console.log("⚠️ No badge iconUrl found:", { latestBadge, userBadges });
    return null;
  }, [latestBadge, userBadges]);

  return (
    <div className="container" ref={containerRef}>
      <div className="quiz-page-wrapper">
        <div className="quiz-header">
          <button
            className="back-to-quiz-button"
            onClick={onBack}
            aria-label="Back to Quizzes"
          >
            <img src={goBackIcon} alt="Back" />
          </button>
        </div>
        <div className="quizCompletion">
          <div className="points">
            <h1>{score * pointsPerQuestion}</h1>
            <img src={Star} alt="Star" />
          </div>
          <h2>{headingMessage}!</h2>
          <h2> {completionMessage}</h2>

          {isBossQuiz && !failedBossQuiz && badgeIconUrl ? (
            <>
              <img className="badgeIcon" src={badgeIconUrl} alt="Badge" />
              <p>You got a new badge to your collection!</p>
              <p className="smallNote">
                You can view all your achievements on your profile page.
              </p>
            </>
          ) : (
            <img className="rockyIcon" src="/rockyYellow.svg" alt="Rocky" />
          )}
        </div>

        <div>
          <button className="returnToLesson" onClick={onBack}>
            Back to Lessons
          </button>
        </div>
      </div>
    </div>
  );
}
