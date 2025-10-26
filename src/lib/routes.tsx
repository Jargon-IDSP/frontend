import type { RouteObject } from 'react-router-dom';
import type { ReactElement } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import HomePage from '../mounting/HomePage';
import ChatPage from '../mounting/ChatPage';
import ProfilePage from '../pages/users/ProfilePage';
import AvatarPage from '../pages/users/avatar/AvatarPage';
import FriendsPage from '../pages/users/FriendsPage';
import RandomQuestionsStepper from '../mounting/RandomQuestionsStepper';
import LeaderboardPage from '../mounting/LeaderboardPage';
import LearningHub from '../pages/learning/LearnJargon';
import Levels from '../pages/learning/Levels';
import ExistingSelect from '../pages/learning/ExistingSelect';
import CustomSelect from '../pages/learning/CustomSelect';
import CategoryStudy from '../pages/learning/CategoryStudy';
import Terms from '../pages/learning/Terms';
import Questions from '../pages/learning/Questions';
import Quizzes from '../pages/learning/Quizzes';
import TakeCustomQuiz from '../pages/learning/TakeCustomQuiz';
import TakeExistingQuiz from '../pages/learning/TakeExistingQuiz';
import TakeCategoryQuiz from '../pages/learning/TakeCategoryQuiz';
import QuizSelection from '../pages/learning/QuizSelection';
import SharedQuizzes from '../pages/learning/SharedQuizzes';
import MyQuizzes from '../pages/learning/MyQuizzes';
import DocumentsPage from '../pages/documents/DocumentsPage';
import AddDocumentPage from '../pages/documents/AddDocumentPage';
import FullTranslationView from '../pages/documents/FullTranslationView';
import DocumentStudy from '../pages/documents/DocumentStudy';
import FilePreviewPage from '../pages/documents/FilePreviewPage';
import UserDocumentsPage from '../pages/documents/UserDocumentsPage';

const protect = (element: ReactElement) => <ProtectedRoute>{element}</ProtectedRoute>;

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/chat',
    element: protect(<ChatPage />),
  },
  {
    path: '/profile',
    element: protect(<ProfilePage />),
  },
  {
    path: '/profile/avatar',
    element: protect(<AvatarPage />),
  },
  {
    path: '/profile/friends',
    element: protect(<FriendsPage />),
  },
  
  // Documents
  {
    path: '/documents',
    element: protect(<DocumentsPage />),
  },
  {
    path: '/documents/user',
    element: protect(<UserDocumentsPage />),
  },
  {
  path: '/documents/preview',
  element: protect(<FilePreviewPage />),
},
  {
    path: '/documents/add',
    element: protect(<AddDocumentPage />),
  },
  {
    path: '/documents/:id/translation',
    element: protect(<FullTranslationView />),
  },
  {
    path: '/documents/:id/status',
    element: protect(<FullTranslationView />),
  },
  {
    path: '/study/:documentId',
    element: protect(<DocumentStudy />),
  },
  
  {
    path: '/random-questions',
    element: protect(<RandomQuestionsStepper />),
  },
  {
    path: '/leaderboard',
    element: protect(<LeaderboardPage />),
  },
  
  // Learning
  {
    path: '/learning',
    element: protect(<LearningHub />),
  },
  {
    path: '/learning/shared',
    element: protect(<SharedQuizzes />),
  },
  {
    path: '/learning/my-quizzes',
    element: protect(<MyQuizzes />),
  },
  {
    path: '/learning/:type/levels',
    element: protect(<Levels />),
  },
  {
    path: '/learning/existing/levels/:levelId',
    element: protect(<ExistingSelect />),
  },
  {
    path: '/learning/custom',
    element: protect(<CustomSelect />),
  },
  {
    path: '/learning/custom/category/:category',
    element: protect(<CategoryStudy />),
  },
  
  // Terms
  {
    path: '/learning/existing/levels/:levelId/terms',
    element: protect(<Terms />),
  },
  {
    path: '/learning/custom/documents/:documentId/terms',
    element: protect(<Terms />),
  },
  {
    path: '/learning/custom/category/:category/terms',
    element: protect(<Terms />),
  },
  {
    path: '/learning/custom/terms',
    element: protect(<Terms />),
  },
  
  // Questions
  {
    path: '/learning/existing/levels/:levelId/questions',
    element: protect(<Questions />),
  },
  {
    path: '/learning/custom/documents/:documentId/questions',
    element: protect(<Questions />),
  },
  {
    path: '/learning/custom/questions',
    element: protect(<Questions />),
  },
  
  // Quizzes
  {
    path: '/learning/existing/levels/:levelId/quizzes',
    element: protect(<Quizzes />),
  },
  {
    path: '/learning/custom/documents/:documentId/quizzes',
    element: protect(<Quizzes />),
  },
  {
    path: '/learning/custom/category/:category/quizzes',
    element: protect(<Quizzes />),
  },
  {
    path: '/learning/custom/quizzes',
    element: protect(<Quizzes />),
  },
  
  // Quiz Selection
  {
    path: '/learning/existing/levels/:levelId/quiz',
    element: protect(<QuizSelection />),
  },
  {
    path: '/learning/custom/quiz',
    element: protect(<QuizSelection />),
  },
  {
    path: '/learning/custom/quiz/:quizNumber',
    element: protect(<QuizSelection />),
  },
  
  // Take Quiz
  {
    path: '/learning/existing/levels/:levelId/quiz/take',
    element: protect(<TakeExistingQuiz />),
  },
  {
    path: '/learning/custom/quiz/take',
    element: protect(<TakeCustomQuiz />),
  },
  {
    path: '/learning/custom/category/:category/quiz/take',
    element: protect(<TakeCategoryQuiz />),
  },
];