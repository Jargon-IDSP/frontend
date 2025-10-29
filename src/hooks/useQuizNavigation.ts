import { useNavigate } from "react-router-dom";

export function useQuizNavigation(levelId?: string) {
  const navigate = useNavigate();

  const navigateToQuizList = () => {
    if (levelId) {
      navigate(`/learning/existing/levels/${levelId}/quizzes`);
    }
  };

  const navigateToLevel = (newLevelId: string) => {
    navigate(`/learning/existing/levels/${newLevelId}`);
  };

  return {
    navigateToQuizList,
    navigateToLevel,
  };
}