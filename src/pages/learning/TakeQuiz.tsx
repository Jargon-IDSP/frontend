// pages/TakeQuiz.tsx (Simplified)
import { useQuizParams } from "../../hooks/useQuizParams";
import { useQuizNavigation } from "../../hooks/useQuizNavigation";
import { ExistingQuizContainer } from "./quiz/ExistingQuizContainer";

export default function TakeQuiz() {
  const { levelId, quizNumber, queryLanguage, queryIndustryId } = useQuizParams();
  const { navigateToQuizList } = useQuizNavigation(levelId);

  return (
    <ExistingQuizContainer
      levelId={levelId}
      quizNumber={quizNumber}
      industryId={queryIndustryId}
      language={queryLanguage}
      onBack={navigateToQuizList}
    />
  );
}