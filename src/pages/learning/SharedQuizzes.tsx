import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSharedQuizzes } from "../../hooks/useSharedQuizzes";
import { SharedQuizFolder } from "@/components/learning/SharedQuizFolder";
import type { SharedQuiz } from "../../types/learning";
import type { QuizCategory } from "../../types/document";
import goBackIcon from "../../assets/icons/goBackIcon.svg";

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
      const mappedCategory = mapToBaseCategory(quiz.customQuiz.category);
      groups[mappedCategory].push(quiz);
    });

    // Return all categories (even empty ones)
    return groups;
  }, [sharedQuizzes]);

  return (
    <div className="categoriesPage">
      <div className="categoriesHeader">
        <img
          src={goBackIcon}
          alt="Go back"
          className="categoriesBackButton"
          onClick={() => navigate(-1)}
        />
        <h1>Quizzes Shared With Me</h1>
      </div>

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
            ORDERED_CATEGORIES.map((category) => (
              <SharedQuizFolder
                key={category}
                categoryName={CATEGORY_DISPLAY[category]}
                sharedQuizzes={groupedQuizzes[category]}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
