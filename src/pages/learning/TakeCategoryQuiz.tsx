import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import { useCategoryQuestions } from "../../hooks/useCategoryQuestions";
import { useCompleteQuiz } from "../../hooks/useCompleteQuiz";
import QuizComponent from "../../components/learning/QuizComponent";

export default function TakeCategoryQuiz() {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const { language } = useUserPreferences();

  const quizNumber = parseInt(searchParams.get("quiz") || "1");
  const quizId = searchParams.get("quizId");

  // Fetch category questions
  const {
    data: questions = [],
    isLoading: loading,
    error: queryError,
  } = useCategoryQuestions(category, "english");

  // Complete quiz mutation
  const completeQuizMutation = useCompleteQuiz();

  const handleQuizComplete = async (score: number, totalQuestions: number) => {
    if (!category) return;

    completeQuizMutation.mutate({
      type: "custom",
      score,
      totalQuestions,
      category,
      ...(quizId && { quizId }),
    });
  };

  const error = queryError ? (queryError as Error).message : null;

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Loading quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem" }}>
        <button
          onClick={() => navigate(`/learning/custom/categories/${category}`)}
          style={{ marginBottom: "1rem" }}
        >
          ← Back
        </button>
        <div
          style={{
            backgroundColor: "#fee",
            padding: "1rem",
            borderRadius: "6px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <QuizComponent
      questions={questions}
      quizNumber={quizNumber}
      onComplete={handleQuizComplete}
      onBack={() => navigate(`/learning/custom/categories/${category}`)}
      preferredLanguage={language}
    />
  );
}

// import { useState, useEffect } from 'react';
// import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
// import { useAuth } from '@clerk/clerk-react';
// import { useUserPreferences } from '../../hooks/useUserPreferences';
// import { BACKEND_URL } from '../../lib/api';
// import QuizComponent from '../../components/learning/QuizComponent';
// import type { QuizQuestion } from '../../types/learning';

// export default function TakeCategoryQuiz() {
//   const navigate = useNavigate();
//   const { category } = useParams<{ category: string }>();
//   const [searchParams] = useSearchParams();
//   const { getToken } = useAuth();
//   const { language } = useUserPreferences();

//   const quizNumber = parseInt(searchParams.get('quiz') || '1');
//   const quizId = searchParams.get('quizId'); // Get quizId from URL

//   const [questions, setQuestions] = useState<QuizQuestion[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     fetchQuiz();
//   }, []);

//   const fetchQuiz = async () => {
//     try {
//       setLoading(true);
//       const token = await getToken();

//       // Fetch all questions from this category for the current user
//       const url = `${BACKEND_URL}/learning/custom/categories/${category}/questions?language=english`;

//       const response = await fetch(url, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!response.ok) {
//         throw new Error('Failed to fetch category questions');
//       }

//       const data = await response.json();
//       setQuestions(data.data || []);
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleQuizComplete = async (score: number, totalQuestions: number) => {
//     try {
//       const token = await getToken();
//       const payload = {
//         type: 'custom',
//         score,
//         totalQuestions,
//         category,
//         ...(quizId && { quizId }), // Include quizId if available
//       };

//       await fetch(`${BACKEND_URL}/learning/quiz/complete`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       });
//     } catch (err: any) {
//       console.error('Error saving quiz results:', err);
//     }
//   };

//   if (loading) {
//     return (
//       <div style={{ padding: '2rem', textAlign: 'center' }}>
//         <p>Loading quiz...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div style={{ padding: '2rem' }}>
//         <button onClick={() => navigate(`/learning/custom/categories/${category}`)} style={{ marginBottom: '1rem' }}>
//           ← Back
//         </button>
//         <div style={{ backgroundColor: '#fee', padding: '1rem', borderRadius: '6px' }}>
//           <strong>Error:</strong> {error}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <QuizComponent
//       questions={questions}
//       quizNumber={quizNumber}
//       onComplete={handleQuizComplete}
//       onBack={() => navigate(`/learning/custom/categories/${category}`)}
//       preferredLanguage={language}
//     />
//   );
// }
