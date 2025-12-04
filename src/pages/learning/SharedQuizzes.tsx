import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSharedQuizzes } from "../../hooks/useSharedQuizzes";
import { CategoryFolder } from "@/components/learning/CategoryFolder";
import { CategoriesCard } from "@/components/learning/CategoriesCard";
import LoadingBar from "@/components/LoadingBar";
import type { SharedQuiz } from "../../types/learning";
import type { QuizCategory } from "../../types/document";
import dictionaryBottom from "../../assets/dictionaryBottom.svg";

const CATEGORY_DISPLAY: Record<QuizCategory, string> = {
  'SAFETY': 'Safety',
  'TECHNICAL': 'Technical',
  'TRAINING': 'Training',
  'WORKPLACE': 'Workplace',
  'PROFESSIONAL': 'Professional',
  'GENERAL': 'General'
};

const ORDERED_CATEGORIES: QuizCategory[] = [
  'SAFETY',
  'TECHNICAL',
  'TRAINING',
  'WORKPLACE',
  'PROFESSIONAL',
  'GENERAL'
];

const mapToBaseCategory = (category: string | null | undefined): QuizCategory => {
  if (!category) return 'GENERAL';

  const upperCategory = category.toUpperCase();

  if (upperCategory in CATEGORY_DISPLAY) {
    return upperCategory as QuizCategory;
  }

  return 'GENERAL';
};

export default function SharedQuizzesPage() {
  const navigate = useNavigate();
  const { data: sharedQuizzes = [], isLoading, error } = useSharedQuizzes();

  const showLoading = isLoading;

  const quizzes = sharedQuizzes || [];

  const handleQuizClick = (quiz: SharedQuiz["customQuiz"]) => {
    if ("documentId" in quiz && quiz.documentId) {
      navigate(`/learning/documents/${quiz.documentId}/study`);
    } else {
      navigate(`/learning/custom/quiz/take?quizId=${quiz.id}&skipHistory=true`);
    }
  };

  const groupedQuizzes = useMemo(() => {
    const groups: Record<QuizCategory, SharedQuiz[]> = {
      SAFETY: [],
      TECHNICAL: [],
      TRAINING: [],
      WORKPLACE: [],
      PROFESSIONAL: [],
      GENERAL: []
    };

    quizzes.forEach((quiz) => {
      if (!quiz || !quiz.customQuiz) {
        console.warn("Invalid quiz data:", quiz);
        return;
      }
      const mappedCategory = mapToBaseCategory(quiz.customQuiz.category);
      groups[mappedCategory].push(quiz);
    });

    return groups;
  }, [quizzes]);

  return (
    <div className="categoriesPage">
      <LoadingBar
        isLoading={showLoading}
        hasData={!isLoading}
        text="Loading shared quizzes"
      />
      <CategoriesCard
        title="Friend's Lessons"
        onBack={() => navigate(-1)}
        bottomImages={[dictionaryBottom]}
      >
        { error ? (
          <div className="categoriesError">
            Failed to load shared quizzes. Please try again.
          </div>
        ) : (
          <div className="categoriesList">
            {quizzes.length === 0 ? (
              <div className="categoriesEmpty">
                No quizzes have been shared with you yet. Ask your friends to share their custom quizzes!
              </div>
            ) : (
              ORDERED_CATEGORIES.map((category) => {
                const quizzes = groupedQuizzes[category];

                return (
                  <CategoryFolder
                    key={category}
                    title={CATEGORY_DISPLAY[category]}
                  >
                    {quizzes.length > 0 ? (
                      <div className="document-list">
                        {quizzes.map((share) => (
                          <div
                            key={share.id}
                            className="document-item"
                            onClick={() => handleQuizClick(share.customQuiz)}
                          >
                            <div className="document-info">
                              <span className="document-name">{share.customQuiz.name}</span>
                            </div>
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="folder-empty">
                        No quizzes in this category yet.
                      </div>
                    )}
                  </CategoryFolder>
                );
              })
            )}
          </div>
        )}
      </CategoriesCard>
    </div>
  );
}
