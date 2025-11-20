import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSharedQuizzes } from "../../hooks/useSharedQuizzes";
import { CategoryFolder } from "@/components/learning/CategoryFolder";
import { CategoriesCard } from "@/components/learning/CategoriesCard";
import type { SharedQuiz } from "../../types/learning";
import type { QuizCategory } from "../../types/document";
import dictionaryBottom from "../../assets/dictionaryBottom.svg";

// Base categories that everyone should see (in display format)
const CATEGORY_DISPLAY: Record<QuizCategory, string> = {
  'SAFETY': 'Safety',
  'TECHNICAL': 'Technical',
  'TRAINING': 'Training',
  'WORKPLACE': 'Workplace',
  'PROFESSIONAL': 'Professional',
  'GENERAL': 'General'
};

// Ordered list of categories to display
const ORDERED_CATEGORIES: QuizCategory[] = [
  'SAFETY',
  'TECHNICAL',
  'TRAINING',
  'WORKPLACE',
  'PROFESSIONAL',
  'GENERAL'
];

// Map any category to one of the base 6, defaulting to GENERAL
const mapToBaseCategory = (category: string | null | undefined): QuizCategory => {
  if (!category) return 'GENERAL';

  const upperCategory = category.toUpperCase();

  // Check if it's already a base category
  if (upperCategory in CATEGORY_DISPLAY) {
    return upperCategory as QuizCategory;
  }

  // Default to GENERAL for custom categories
  return 'GENERAL';
};

export default function SharedQuizzesPage() {
  const navigate = useNavigate();
  const { data: sharedQuizzes = [], isLoading, error } = useSharedQuizzes();

  const handleQuizClick = (quiz: SharedQuiz["customQuiz"]) => {
    // Check if quiz has a documentId to determine the correct route
    if ("documentId" in quiz && quiz.documentId) {
      navigate(`/learning/documents/${quiz.documentId}/study`);
    } else {
      // For general custom quizzes, go to the custom quiz page
      navigate(`/learning/custom/quiz/take?quizId=${quiz.id}&skipHistory=true`);
    }
  };

  // Group quizzes by mapped base category
  const groupedQuizzes = useMemo(() => {
    const groups: Record<QuizCategory, SharedQuiz[]> = {
      SAFETY: [],
      TECHNICAL: [],
      TRAINING: [],
      WORKPLACE: [],
      PROFESSIONAL: [],
      GENERAL: []
    };

    sharedQuizzes.forEach((quiz) => {
      // Safety check: ensure quiz and customQuiz exist
      if (!quiz || !quiz.customQuiz) {
        console.warn("Invalid quiz data:", quiz);
        return;
      }
      const mappedCategory = mapToBaseCategory(quiz.customQuiz.category);
      groups[mappedCategory].push(quiz);
    });

    // Return all categories (even empty ones)
    return groups;
  }, [sharedQuizzes]);

  return (
    <div className="categoriesPage">
      <CategoriesCard
        title="Friend's Lessons"
        onBack={() => navigate(-1)}
        bottomImages={[dictionaryBottom]}
      >
        {isLoading ? (
          <div className="categoriesLoading">
            Loading shared quizzes...
          </div>
        ) : error ? (
          <div className="categoriesError">
            Failed to load shared quizzes. Please try again.
          </div>
        ) : (
          <div className="categoriesList">
            {sharedQuizzes.length === 0 ? (
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
