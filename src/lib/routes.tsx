import type { RouteObject } from "react-router-dom";
import type { ReactElement } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import HomePage from "../mounting/HomePage";
import ChatPage from "../mounting/ChatPage";
import ProfilePage from "../pages/users/ProfilePage";
import AvatarPage from "../pages/users/avatar/AvatarPage";
import FriendsPage from "../pages/users/FriendsPage";
import FriendProfilePage from "../pages/users/FriendProfilePage";
import ManageProfilePage from "../pages/users/ManageProfilePage";
import NotificationsPage from "../pages/notifications/NotificationsPage";
import LeaderboardPage from "../mounting/LeaderboardPage";
import Levels from "../pages/learning/Levels";
import ExistingSelect from "../pages/learning/ExistingSelect";
import Categories from "../pages/learning/Categories";
import CategoryStudy from "../pages/learning/CategoryStudy";
import Terms from "../pages/learning/Terms";
import Questions from "../pages/learning/Questions";
import Quizzes from "../pages/learning/StartQuiz";
import UnifiedQuizTaker from "../pages/learning/UnifiedQuizTaker";
import QuizSelection from "../pages/learning/QuizSelection";
import SharedQuizzes from "../pages/learning/SharedQuizzes";
import MyQuizzes from "../pages/learning/MyQuizzes";
import SelectStudyType from "../pages/learning/SelectStudyType";
import DocumentsPage from "../pages/documents/DocumentsPage";
import AddDocumentPage from "../pages/documents/AddDocumentPage";
import FullTranslationView from "../pages/documents/FullTranslationView";
import FilePreviewPage from "../pages/documents/FilePreviewPage";
import IntroductionPage from "../pages/onboarding/IntroductionPage";
import LanguagePreferences from "../pages/onboarding/LanguagePreferences";
import IndustryPreferences from "../pages/onboarding/IndustryPreferences";
import LearnJargon from "../pages/learning/LearnJargon";

const protect = (element: ReactElement) => (
  <ProtectedRoute>{element}</ProtectedRoute>
);

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/onboarding/introduction",
    element: protect(<IntroductionPage />),
  },
  {
    path: "/onboarding/language",
    element: protect(<LanguagePreferences />),
  },
  {
    path: "/onboarding/industry",
    element: protect(<IndustryPreferences />),
  },
  {
    path: "/chat",
    element: protect(<ChatPage />),
  },
  {
    path: "/profile",
    element: protect(<ProfilePage />),
  },
  {
    path: "/profile/avatar",
    element: protect(<AvatarPage />),
  },
  {
    path: "/profile/friends",
    element: protect(<FriendsPage />),
  },
  {
    path: "/profile/friends/:friendId",
    element: protect(<FriendProfilePage />),
  },
  {
    path: "/profile/manage",
    element: protect(<ManageProfilePage />),
  },
  {
    path: "/notifications",
    element: protect(<NotificationsPage />),
  },

  // Documents
  {
    path: "/documents",
    element: protect(<DocumentsPage />),
  },
  {
    path: "/documents/preview",
    element: protect(<FilePreviewPage />),
  },
  {
    path: "/documents/add",
    element: protect(<AddDocumentPage />),
  },
  {
    path: "/documents/:id/translation",
    element: protect(<FullTranslationView />),
  },
  {
    path: "/documents/:id/status",
    element: protect(<FullTranslationView />),
  },
  {
    path: "/leaderboard",
    element: protect(<LeaderboardPage />),
  },

  // Learning - redirect to custom learning
  {
    path: "/learning",
    element: protect(<LearnJargon />),
  },
  {
    path: "/learning/shared",
    element: protect(<SharedQuizzes />),
  },
  {
    path: "/learning/my-quizzes",
    element: protect(<MyQuizzes />),
  },
  {
    path: "/learning/:type/levels",
    element: protect(<Levels />),
  },

  {
    path: "/learning/existing/levels/:levelId",
    element: protect(<ExistingSelect />),
  },
  {
    path: "/learning/custom",
    element: protect(<LearnJargon />),
  },
  {
    path: "/learning/custom/categories",
    element: protect(<Categories />),
  },
  {
    path: "/learning/custom/categories/:category",
    element: protect(<CategoryStudy />),
  },

  // Document Study - redirect to study type selection
  {
    path: "/learning/documents/:documentId",
    element: protect(<SelectStudyType />),
  },

  // Legacy route for backwards compatibility - redirect to study type selection
  // {
  //   path: "/study/:documentId",
  //   element: protect(<SelectStudyType />),
  // },

  // Flashcards (Terms)
  {
    path: "/learning/existing/levels/:levelId/flashcards/:sessionNumber",
    element: protect(<Terms />),
  },
  {
    path: "/learning/existing/levels/:levelId/terms",
    element: protect(<Terms />),
  },
  {
    path: "/learning/documents/:documentId/terms",
    element: protect(<Terms />),
  },
  {
    path: "/learning/custom/categories/:category/terms",
    element: protect(<Terms />),
  },
  {
    path: "/learning/custom/terms",
    element: protect(<Terms />),
  },

  // Questions
  {
    path: "/learning/existing/levels/:levelId/questions",
    element: protect(<Questions />),
  },
  {
    path: "/learning/documents/:documentId/questions",
    element: protect(<Questions />),
  },
  {
    path: "/learning/custom/questions",
    element: protect(<Questions />),
  },

  // Quizzes
  {
    path: "/learning/existing/levels/:levelId/quizzes",
    element: protect(<Quizzes />),
  },
  {
    path: "/learning/documents/:documentId/study",
    element: protect(<SelectStudyType />),
  },
  {
    path: "/learning/custom/categories/:category/quizzes",
    element: protect(<Quizzes />),
  },
  {
    path: "/learning/custom/quizzes",
    element: protect(<Quizzes />),
  },

  // Quiz Selection
  {
    path: "/learning/existing/levels/:levelId/quiz/:sessionNumber",
    element: protect(<QuizSelection />),
  },
  {
    path: "/learning/existing/levels/:levelId/quiz",
    element: protect(<QuizSelection />),
  },
  {
    path: "/learning/custom/quiz",
    element: protect(<QuizSelection />),
  },
  {
    path: "/learning/custom/quiz/:quizNumber",
    element: protect(<QuizSelection />),
  },

  // Take Quiz
  {
    path: "/learning/existing/levels/:levelId/quiz/:sessionNumber/take",
    element: protect(<UnifiedQuizTaker />),
  },
  {
    path: "/learning/existing/levels/:levelId/quiz/take",
    element: protect(<UnifiedQuizTaker />),
  },
  {
    path: "/learning/custom/quiz/take",
    element: protect(<UnifiedQuizTaker />),
  },
  {
    path: "/learning/custom/categories/:category/quiz/take",
    element: protect(<UnifiedQuizTaker />),
  },
];
