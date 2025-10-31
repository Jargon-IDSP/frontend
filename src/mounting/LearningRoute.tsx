import type { RouteObject } from 'react-router-dom';

// Page imports
import LearningHub from '../pages/learning/LearnJargon';
import ExistingLevels from '../pages/learning/Levels';
import ExistingSelect from '../pages/learning/ExistingSelect';
import CustomSelect from '../pages/learning/CustomSelect';
import Terms from '../pages/learning/Terms';
import Questions from '../pages/learning/Questions';
import QuizSelection from '../pages/learning/QuizSelection';
import UnifiedQuizTaker from '../pages/learning/UnifiedQuizTaker';
import DocumentStudy from '../pages/learning/DocumentStudy';
import MyQuizzesPage from '../pages/learning/MyQuizzes';
import SharedQuizzesPage from '../pages/learning/SharedQuizzes';
import CategoryStudy from '../pages/learning/CategoryStudy';

export const learningRoutes: RouteObject = {
  path: '/learning',
  children: [
    // Main hub
    { index: true, element: <LearningHub /> },

    // Existing content (platform)
    {
      path: 'existing',
      children: [
        { path: 'levels', element: <ExistingLevels /> },
        { path: 'levels/:levelId', element: <ExistingSelect /> },
        { path: 'levels/:levelId/terms', element: <Terms /> },
        { path: 'levels/:levelId/questions', element: <Questions /> },
        { path: 'levels/:levelId/quizzes', element: <QuizSelection /> },
        { path: 'levels/:levelId/quiz', element: <QuizSelection /> },
        { path: 'levels/:levelId/quiz/take', element: <UnifiedQuizTaker /> },
      ],
    },

    // Custom content (user-generated)
    {
      path: 'custom',
      children: [
        { index: true, element: <CustomSelect /> },
        { path: 'terms', element: <Terms /> },
        { path: 'questions', element: <Questions /> },
        { path: 'quizzes', element: <QuizSelection /> },
        { path: 'quiz/take', element: <UnifiedQuizTaker /> },
        
        // Category routes
        { path: 'categories/:category', element: <CategoryStudy /> },
        { path: 'categories/:category/terms', element: <Terms /> },
        { path: 'categories/:category/questions', element: <Questions /> },
        { path: 'categories/:category/quizzes', element: <QuizSelection /> },
        { path: 'categories/:category/quiz/take', element: <UnifiedQuizTaker /> },
      ],
    },

    // Document-specific learning (updated routes)
    {
      path: 'documents/:documentId',
      children: [
        { index: true, element: <DocumentStudy /> }, // Overview
        { path: 'terms', element: <Terms /> },
        { path: 'questions', element: <Questions /> },
        { path: 'quizzes', element: <QuizSelection /> },
      ],
    },

    // My quizzes and sharing
    { path: 'my-quizzes', element: <MyQuizzesPage /> },
    { path: 'shared', element: <SharedQuizzesPage /> },
  ],
};

// Legacy route for /study/:documentId - redirects to new structure
export const studyRedirectRoute: RouteObject = {
  path: '/study/:documentId',
  element: <DocumentStudy />,
};