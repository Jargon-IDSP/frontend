import type { RouteObject } from 'react-router-dom';
import type { ReactElement } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import HomePage from '../pages/HomePage';
import ChatPage from '../pages/ChatPage';
import ProfilePage from '../pages/users/ProfilePage';
import AvatarPage from '../pages/users/avatar/AvatarPage';
import DocumentsPage from '../pages/documents/DocumentsPage';
import RandomQuestionsStepper from '../pages/RandomQuestionsStepper';
import LeaderboardPage from '../pages/LeaderboardPage';
import LearningHub from '../pages/learning/LearnJargon';
import Levels from '../pages/learning/Levels';
import ExistingSelect from '../pages/learning/ExistingSelect';
import CustomSelect from '../pages/learning/CustomSelect';
import Terms from '../pages/learning/Terms';
import Questions from '../pages/learning/Questions';
import Quizzes from '../pages/learning/Quizzes';
import TakeQuiz from '../pages/learning/TakeQuiz';
import QuizSelection from '../pages/learning/QuizSelection';

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
    path: '/documents',
    element: protect(<DocumentsPage />),
  },
  {
    path: '/random-questions',
    element: protect(<RandomQuestionsStepper />),
  },
  {
    path: '/leaderboard',
    element: protect(<LeaderboardPage />),
  },
  
  // Learning routes
  {
    path: '/learning',
    element: protect(<LearningHub />),
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
  
  // Terms routes
  {
    path: '/learning/existing/levels/:levelId/terms',
    element: protect(<Terms />),
  },
  {
    path: '/learning/custom/documents/:documentId/terms',
    element: protect(<Terms />),
  },
  {
    path: '/learning/custom/terms',
    element: protect(<Terms />),
  },
  
  // Questions routes
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
  
  // Quizzes routes
  {
    path: '/learning/existing/levels/:levelId/quizzes',
    element: protect(<Quizzes />),
  },
  {
    path: '/learning/custom/documents/:documentId/quizzes',
    element: protect(<Quizzes />),
  },
  {
    path: '/learning/custom/quizzes',
    element: protect(<Quizzes />),
  },
  
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
  
  // Take quiz routes
  {
    path: '/learning/existing/levels/:levelId/quiz/take',
    element: protect(<TakeQuiz />),
  },
  {
    path: '/learning/custom/quiz/take',
    element: protect(<TakeQuiz />),
  },
];