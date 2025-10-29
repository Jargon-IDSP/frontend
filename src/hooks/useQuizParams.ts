// hooks/useQuizParams.ts
import { useParams, useSearchParams } from "react-router-dom";
import { useUserPreferences } from "./useUserPreferences";

export function useQuizParams() {
  const { levelId } = useParams<{ levelId: string }>();
  const [searchParams] = useSearchParams();
  const { language, industryId } = useUserPreferences();

  const quizNumber = parseInt(searchParams.get("quiz") || "1");
  const queryLanguage = searchParams.get("language") || language;
  const queryIndustryId =
    searchParams.get("industry_id") || industryId?.toString();

  return {
    levelId,
    quizNumber,
    queryLanguage,
    queryIndustryId,
  };
}