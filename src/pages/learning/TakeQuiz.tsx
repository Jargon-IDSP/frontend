import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import { useExistingQuiz } from "../../hooks/useExistingQuiz";
import { useCompleteExistingQuiz } from "../../hooks/useCompleteExistingQuiz";
import QuizComponent from "../../components/learning/QuizComponent";

export default function TakeQuiz() {
  const navigate = useNavigate();
  const { levelId } = useParams<{ levelId: string }>();
  const [searchParams] = useSearchParams();
  const { language, industryId } = useUserPreferences();

  const quizNumber = parseInt(searchParams.get("quiz") || "1");
  const queryLanguage = searchParams.get("language") || language;
  const queryIndustryId =
    searchParams.get("industry_id") || industryId?.toString();

  // Fetch quiz questions
  const {
    data: questions = [],
    isLoading: loading,
    error: queryError,
  } = useExistingQuiz(levelId, quizNumber, queryIndustryId, queryLanguage);

  // Complete quiz mutation
  const completeQuizMutation = useCompleteExistingQuiz();

  const handleQuizComplete = async (score: number, totalQuestions: number) => {
    if (!levelId) return;

    completeQuizMutation.mutate({
      type: "existing",
      score,
      totalQuestions,
      levelId,
      quizId: `quiz-${levelId}-${Date.now()}`,
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
          onClick={() =>
            navigate(`/learning/existing/levels/${levelId}/quizzes`)
          }
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
      onBack={() => navigate(`/learning/existing/levels/${levelId}/quizzes`)}
      preferredLanguage={queryLanguage}
    />
  );
}

// import { useState, useEffect, useRef } from 'react';
// import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '@clerk/clerk-react';
// import { useUserPreferences } from '../../hooks/useUserPreferences';
// import { BACKEND_URL } from '../../lib/api';
// import TranslateButton from '../../components/learning/TranslateButton';
// import type { UserQuizAttempt, QuizQuestion } from '../../types/learning';

// export default function TakeQuiz() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { levelId } = useParams<{ levelId?: string }>();
//   const [searchParams] = useSearchParams();
//   const { getToken } = useAuth();
//   const { language, industryId } = useUserPreferences();

//   const type = location.pathname.includes('/existing/') ? 'existing' : 'custom';

//   const quizNumber = parseInt(searchParams.get('quiz') || '1');
//   const quizId = searchParams.get('quizId'); // Get quiz ID if provided
//   const skipHistory = searchParams.get('skipHistory') === 'true'; // Skip history and start directly
//   const queryIndustryId = searchParams.get('industry_id') || industryId?.toString();

//   const [questions, setQuestions] = useState<QuizQuestion[]>([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
//   const [answers, setAnswers] = useState<{ [key: number]: string }>({});
//   const [score, setScore] = useState(0);
//   const [isComplete, setIsComplete] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showChatModal, setShowChatModal] = useState(false);
//   const [chatPrompt, setChatPrompt] = useState('');
//   const [chatReply, setChatReply] = useState('');
//   const [chatLoading, setChatLoading] = useState(false);
//   const chatReplyRef = useRef<HTMLDivElement>(null);

//   // New state for quiz attempts
//   const [previousAttempts, setPreviousAttempts] = useState<UserQuizAttempt[]>([]);
//   const [showAttempts, setShowAttempts] = useState(true);
//   const [loadingAttempts, setLoadingAttempts] = useState(true);

//   useEffect(() => {
//     if (skipHistory) {
//       // Skip history and go straight to quiz
//       setLoadingAttempts(false);
//       setShowAttempts(false);
//     } else if (quizId && type === 'custom') {
//       fetchPreviousAttempts();
//     } else {
//       setLoadingAttempts(false);
//       setShowAttempts(false);
//     }
//   }, [quizId, skipHistory]);

//   const fetchPreviousAttempts = async () => {
//     if (!quizId) return;

//     try {
//       setLoadingAttempts(true);
//       const token = await getToken();
//       const response = await fetch(`${BACKEND_URL}/quiz/${quizId}/history`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         if (data && data.attempts && data.attempts.length > 0) {
//           setPreviousAttempts(data.attempts);
//           setLoadingAttempts(false);
//         } else {
//           // No previous attempts - skip the attempts screen and start quiz directly
//           setShowAttempts(false);
//           setLoadingAttempts(false);
//         }
//       } else {
//         // If fetch fails, skip attempts screen
//         setShowAttempts(false);
//         setLoadingAttempts(false);
//       }
//     } catch (err) {
//       console.error('Error fetching attempts:', err);
//       // On error, skip attempts screen and go straight to quiz
//       setShowAttempts(false);
//       setLoadingAttempts(false);
//     }
//   };

//   const handleStartNewAttempt = () => {
//     setShowAttempts(false);
//   };

//   useEffect(() => {
//     if (!showAttempts && !loadingAttempts) {
//       fetchQuiz();
//     }
//   }, [showAttempts, loadingAttempts]);

//   useEffect(() => {
//     if (chatReplyRef.current) {
//       chatReplyRef.current.scrollTop = chatReplyRef.current.scrollHeight;
//     }
//   }, [chatReply]);

// const fetchQuiz = async () => {
//   try {
//     setLoading(true);
//     const token = await getToken();

//     let url = '';
//     if (type === 'existing' && levelId) {
//       url = `${BACKEND_URL}/learning/existing/levels/${levelId}/quiz/generate?quiz_number=${quizNumber}&language=english`;
//       if (queryIndustryId) {
//         url += `&industry_id=${queryIndustryId}`;
//       }
//     } else if (quizId) {
//       // Fetch a specific custom quiz by ID
//       url = `${BACKEND_URL}/quiz/${quizId}/quiz?language=english`;
//     } else {
//       // Generate a new custom quiz
//       url = `${BACKEND_URL}/learning/custom/quiz/generate?quiz_number=${quizNumber}&language=english`;
//     }

//     const response = await fetch(url, {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     if (!response.ok) {
//       throw new Error('Failed to fetch quiz');
//     }

//     const data = await response.json();

//     // Handle different response formats
//     if (quizId) {
//       // Custom quiz by ID returns { quiz: {...}, language: "..." }
//       setQuestions(data.quiz?.questions || []);
//     } else {
//       // Generated quizzes return { data: [...] }
//       setQuestions(data.data || []);
//     }
//   } catch (err: any) {
//     setError(err.message);
//   } finally {
//     setLoading(false);
//   }
// };
//   const handleAnswerSelect = (choiceId: string) => {
//     setSelectedAnswer(choiceId);
//   };

//   const handleNext = () => {
//     if (selectedAnswer) {
//       setAnswers({ ...answers, [currentQuestionIndex]: selectedAnswer });

//       const currentQuestion = questions[currentQuestionIndex];
//       const selectedChoice = currentQuestion.choices.find(c => c.id === selectedAnswer);
//       const newScore = selectedChoice?.isCorrect ? score + 1 : score;
//       setScore(newScore);

//       if (currentQuestionIndex < questions.length - 1) {
//         setCurrentQuestionIndex(currentQuestionIndex + 1);
//         setSelectedAnswer(null);
//         // Reset chat when moving to next question
//         setChatPrompt('');
//         setChatReply('');
//         setShowChatModal(false);
//       } else {
//         // Quiz complete - save results to backend
//         saveQuizResults(newScore);
//         setIsComplete(true);
//       }
//     }
//   };

//   const saveQuizResults = async (finalScore: number) => {
//     try {
//       const token = await getToken();
//       const payload: any = {
//         type,
//         score: finalScore,
//         totalQuestions: questions.length,
//       };

//       // Add quizId if available
//       if (quizId) {
//         payload.quizId = quizId;
//       }

//       // Add levelId for existing quizzes
//       if (type === 'existing' && levelId) {
//         payload.levelId = levelId;
//         payload.quizId = payload.quizId || `quiz-${levelId}-${Date.now()}`;
//       }

//       console.log('Saving quiz results:', payload);

//       const response = await fetch(`${BACKEND_URL}/learning/quiz/complete`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();
//       console.log('Quiz save response:', data);

//       if (!response.ok) {
//         console.error('Failed to save quiz:', data);
//       }
//     } catch (err: any) {
//       console.error('Error saving quiz results:', err);
//       // Don't block quiz completion if save fails
//     }
//   };

//   const handlePrevious = () => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//       setSelectedAnswer(answers[currentQuestionIndex - 1] || null);
//       // Reset chat when moving to previous question
//       setChatPrompt('');
//       setChatReply('');
//       setShowChatModal(false);
//     }
//   };

//   const handleRetry = () => {
//     setCurrentQuestionIndex(0);
//     setSelectedAnswer(null);
//     setAnswers({});
//     setScore(0);
//     setIsComplete(false);
//     fetchQuiz();
//   };

//   const handleTranslate = async (toLanguage: string) => {
//     const token = await getToken();
//     let url = '';

//     if (type === 'existing' && levelId) {
//       url = `${BACKEND_URL}/learning/existing/levels/${levelId}/quiz/generate?quiz_number=${quizNumber}&language=${toLanguage}`;
//       if (queryIndustryId) {
//         url += `&industry_id=${queryIndustryId}`;
//       }
//     } else if (quizId) {
//       // For specific quiz, fetch the same quiz in the new language
//       url = `${BACKEND_URL}/learning/custom/quiz/${quizId}?language=${toLanguage}`;
//     } else {
//       url = `${BACKEND_URL}/learning/custom/quiz/generate?quiz_number=${quizNumber}&language=${toLanguage}`;
//     }

//     const response = await fetch(url, {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     if (response.ok) {
//       const data = await response.json();
//       return data.data?.[currentQuestionIndex]?.prompt || questions[currentQuestionIndex].prompt;
//     }

//     return questions[currentQuestionIndex].prompt;
//   };

//   const handleSendChat = async (e?: React.FormEvent) => {
//     e?.preventDefault();
//     if (!chatPrompt.trim() || chatLoading) return;

//     setChatLoading(true);
//     setChatReply('');

//     try {
//       const token = await getToken();
//       const currentQuestion = questions[currentQuestionIndex];

//       // Add context about the current question to the prompt with a helpful personality
//       const contextualPrompt = `You are a friendly, helpful tutor assisting immigrants learning skilled trades terminology in British Columbia, Canada. Your role is to explain concepts in simple, clear language. Give short, conversational answers (2-4 sentences) that are warm and encouraging. Use everyday examples when helpful.

// Current quiz question the student is working on: "${currentQuestion.prompt}"

// Student's question: ${chatPrompt}

// Remember: Be supportive, keep it brief, and explain like you're talking to a friend who's learning English and trades at the same time.`;

//       const res = await fetch(`${BACKEND_URL}/chat`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ prompt: contextualPrompt }),
//       });

//       if (!res.ok) {
//         throw new Error(`Request failed (${res.status})`);
//       }

//       const reader = res.body?.getReader();
//       const decoder = new TextDecoder();

//       if (!reader) {
//         const text = await res.text();
//         setChatReply(text);
//       } else {
//         while (true) {
//           const { done, value } = await reader.read();
//           if (done) break;
//           const chunk = decoder.decode(value, { stream: true });
//           setChatReply((prev) => prev + chunk);
//         }
//       }
//     } catch (err: any) {
//       console.error(err);
//       setChatReply('Error: ' + (err?.message || 'Unknown error'));
//     } finally {
//       setChatLoading(false);
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
//         <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
//           ← Back
//         </button>
//         <div style={{ backgroundColor: '#fee', padding: '1rem', borderRadius: '6px' }}>
//           <strong>Error:</strong> {error}
//         </div>
//       </div>
//     );
//   }

//   if (questions.length === 0) {
//     return (
//       <div style={{ padding: '2rem' }}>
//         <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
//           ← Back
//         </button>
//         <div style={{
//           backgroundColor: '#f0f0f0',
//           padding: '2rem',
//           borderRadius: '6px',
//           textAlign: 'center'
//         }}>
//           <p style={{ margin: 0, fontSize: '1.1rem', color: '#666' }}>
//             No questions available for this quiz. Please try again or select a different quiz.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (isComplete) {
//     const percentage = Math.round((score / questions.length) * 100);
//     return (
//       <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
//         <h1>Quiz Complete! 🎉</h1>
//         <div style={{
//           backgroundColor: '#f9fafb',
//           padding: '2rem',
//           borderRadius: '8px',
//           marginTop: '2rem',
//           textAlign: 'center',
//         }}>
//           <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
//             {percentage >= 80 ? '🌟' : percentage >= 60 ? '👍' : '📚'}
//           </div>
//           <h2 style={{ margin: 0, marginBottom: '1rem' }}>
//             Your Score: {score} / {questions.length}
//           </h2>
//           <p style={{ fontSize: '1.5rem', color: '#3b82f6', fontWeight: '600' }}>
//             {percentage}%
//           </p>
//           <div style={{
//             width: '100%',
//             height: '20px',
//             backgroundColor: '#e5e7eb',
//             borderRadius: '10px',
//             marginTop: '1rem',
//             overflow: 'hidden',
//           }}>
//             <div style={{
//               width: `${percentage}%`,
//               height: '100%',
//               backgroundColor: percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444',
//               transition: 'width 0.5s ease',
//             }} />
//           </div>
//         </div>

//         <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
//           <button
//             onClick={handleRetry}
//             style={{
//               flex: 1,
//               padding: '0.75rem',
//               backgroundColor: '#3b82f6',
//               color: 'white',
//               border: 'none',
//               borderRadius: '6px',
//               cursor: 'pointer',
//               fontWeight: '600',
//             }}
//           >
//             Try Again
//           </button>
//           <button
//             onClick={() => navigate(-1)}
//             style={{
//               flex: 1,
//               padding: '0.75rem',
//               backgroundColor: '#6b7280',
//               color: 'white',
//               border: 'none',
//               borderRadius: '6px',
//               cursor: 'pointer',
//               fontWeight: '600',
//             }}
//           >
//             Back to Learning
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const currentQuestion = questions[currentQuestionIndex];

//   // Show previous attempts screen if we have a quizId and haven't started yet
//   if (showAttempts && quizId && type === 'custom') {
//     return (
//       <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
//         <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
//           ← Back
//         </button>

//         <h1 style={{ marginBottom: '1.5rem' }}>Quiz Attempts</h1>

//         {loadingAttempts ? (
//           <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
//             Loading previous attempts...
//           </div>
//         ) : (
//           <>
//             {previousAttempts.length > 0 && (
//               <div style={{ marginBottom: '2rem' }}>
//                 <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Previous Attempts</h2>
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
//                   {previousAttempts.map((attempt, index) => (
//                     <div
//                       key={attempt.id}
//                       style={{
//                         border: '1px solid #e5e7eb',
//                         borderRadius: '8px',
//                         padding: '1.5rem',
//                         backgroundColor: '#fff',
//                       }}
//                     >
//                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
//                         <div>
//                           <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
//                             Attempt {previousAttempts.length - index}
//                           </h3>
//                           <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
//                             {new Date(attempt.startedAt).toLocaleDateString()} at {new Date(attempt.startedAt).toLocaleTimeString()}
//                           </p>
//                         </div>
//                         <span
//                           style={{
//                             padding: '0.5rem 1rem',
//                             borderRadius: '12px',
//                             fontWeight: '600',
//                             fontSize: '0.875rem',
//                             backgroundColor: attempt.completed ? '#d1fae5' : '#fef3c7',
//                             color: attempt.completed ? '#065f46' : '#92400e',
//                           }}
//                         >
//                           {attempt.completed ? '✓ Completed' : 'In Progress'}
//                         </span>
//                       </div>

//                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
//                         <div>
//                           <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Score</p>
//                           <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: '600' }}>
//                             {attempt.pointsEarned} / {attempt.maxPossiblePoints}
//                           </p>
//                         </div>
//                         <div>
//                           <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Accuracy</p>
//                           <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: '600' }}>
//                             {attempt.percentCorrect}%
//                           </p>
//                         </div>
//                         <div>
//                           <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Questions</p>
//                           <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem', fontWeight: '600' }}>
//                             {attempt.questionsAnswered} / {attempt.totalQuestions}
//                           </p>
//                         </div>
//                         <div>
//                           <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Correct</p>
//                           <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem', fontWeight: '600' }}>
//                             {attempt.questionsCorrect}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {previousAttempts.length === 0 && (
//               <div style={{
//                 textAlign: 'center',
//                 padding: '3rem',
//                 backgroundColor: '#f9fafb',
//                 borderRadius: '8px',
//                 marginBottom: '2rem'
//               }}>
//                 <p style={{ color: '#6b7280', margin: 0 }}>No previous attempts found</p>
//               </div>
//             )}

//             <button
//               onClick={handleStartNewAttempt}
//               style={{
//                 width: '100%',
//                 padding: '1rem',
//                 backgroundColor: '#3b82f6',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '8px',
//                 fontSize: '1rem',
//                 fontWeight: '600',
//                 cursor: 'pointer',
//               }}
//             >
//               {previousAttempts.length > 0 ? 'Start New Attempt' : 'Start Quiz'}
//             </button>
//           </>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
//       <div style={{ marginBottom: '2rem' }}>
//         <button onClick={() => {
//           if (type === 'existing') {
//             navigate('/learning/existing/levels');
//           } else {
//             navigate(-1);
//           }
//         }} style={{ marginBottom: '1rem' }}>
//           ← Back
//         </button>
//         <h1>Quiz {quizNumber}</h1>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <span style={{ color: '#666' }}>
//             Question {currentQuestionIndex + 1} of {questions.length}
//           </span>
//           <span style={{ color: '#666' }}>
//             Score: {score} / {currentQuestionIndex}
//           </span>
//         </div>
//         <div style={{
//           width: '100%',
//           height: '8px',
//           backgroundColor: '#e5e7eb',
//           borderRadius: '4px',
//           marginTop: '0.5rem',
//           overflow: 'hidden',
//         }}>
//           <div style={{
//             width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
//             height: '100%',
//             backgroundColor: '#3b82f6',
//             transition: 'width 0.3s ease',
//           }} />
//         </div>
//       </div>

//       <div style={{
//         backgroundColor: '#fff',
//         padding: '2rem',
//         borderRadius: '8px',
//         border: '1px solid #e5e7eb',
//         marginBottom: '2rem',
//       }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
//           <TranslateButton
//             text={currentQuestion.prompt}
//             preferredLanguage={language}
//             onTranslate={handleTranslate}
//           />
//           <button
//             onClick={() => setShowChatModal(true)}
//             style={{
//               padding: '0.5rem 1rem',
//               backgroundColor: '#10b981',
//               color: 'white',
//               border: 'none',
//               borderRadius: '6px',
//               cursor: 'pointer',
//               fontWeight: '600',
//               fontSize: '0.875rem',
//             }}
//           >
//             💬 Need Help?
//           </button>
//         </div>

//         <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
//           {currentQuestion.choices.map((choice) => {
//             const isSelected = selectedAnswer === choice.id;
//             const isCorrect = choice.isCorrect;
//             const showFeedback = selectedAnswer !== null;

//             let backgroundColor = '#f9fafb';
//             let borderColor = '#e5e7eb';

//             if (showFeedback) {
//               if (isSelected && isCorrect) {
//                 // Selected and correct
//                 backgroundColor = '#d1fae5';
//                 borderColor = '#10b981';
//               } else if (isSelected && !isCorrect) {
//                 // Selected but wrong
//                 backgroundColor = '#fee2e2';
//                 borderColor = '#ef4444';
//               } else if (!isSelected && isCorrect) {
//                 // Not selected but this is the correct answer
//                 backgroundColor = '#dbeafe';
//                 borderColor = '#3b82f6';
//               }
//             } else if (isSelected) {
//               backgroundColor = '#dbeafe';
//               borderColor = '#3b82f6';
//             }

//             return (
//               <button
//                 key={choice.id}
//                 onClick={() => !showFeedback && handleAnswerSelect(choice.id)}
//                 disabled={showFeedback}
//                 style={{
//                   padding: '1rem',
//                   textAlign: 'left',
//                   backgroundColor,
//                   border: `2px solid ${borderColor}`,
//                   borderRadius: '8px',
//                   cursor: showFeedback ? 'default' : 'pointer',
//                   fontWeight: isSelected ? '600' : '400',
//                   transition: 'all 0.2s ease',
//                   position: 'relative',
//                   display: 'flex',
//                   justifyContent: 'space-between',
//                   alignItems: 'center',
//                 }}
//               >
//                 <div>
//                   <span style={{ marginRight: '1rem', fontWeight: '700' }}>{choice.id}.</span>
//                   {choice.term}
//                 </div>
//                 {showFeedback && (
//                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                     {isSelected && isCorrect && (
//                       <span style={{ fontSize: '1.5rem', color: '#10b981' }}>✓</span>
//                     )}
//                     {isSelected && !isCorrect && (
//                       <span style={{ fontSize: '1.5rem', color: '#ef4444' }}>✗</span>
//                     )}
//                     {!isSelected && isCorrect && (
//                       <span style={{ fontSize: '0.875rem', color: '#3b82f6', fontWeight: '600' }}>
//                         Correct answer
//                       </span>
//                     )}
//                   </div>
//                 )}
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       <div style={{ display: 'flex', gap: '1rem' }}>
//         <button
//           onClick={handlePrevious}
//           disabled={currentQuestionIndex === 0}
//           style={{
//             padding: '0.75rem 1.5rem',
//             backgroundColor: currentQuestionIndex === 0 ? '#e5e7eb' : '#6b7280',
//             color: 'white',
//             border: 'none',
//             borderRadius: '6px',
//             cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
//             fontWeight: '600',
//           }}
//         >
//           ← Previous
//         </button>
//         <button
//           onClick={handleNext}
//           disabled={!selectedAnswer}
//           style={{
//             flex: 1,
//             padding: '0.75rem 1.5rem',
//             backgroundColor: !selectedAnswer ? '#e5e7eb' : '#3b82f6',
//             color: !selectedAnswer ? '#9ca3af' : 'white',
//             border: 'none',
//             borderRadius: '6px',
//             cursor: !selectedAnswer ? 'not-allowed' : 'pointer',
//             fontWeight: '600',
//           }}
//         >
//           {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next →'}
//         </button>
//       </div>

//       {/* Chat Modal */}
//       {showChatModal && (
//         <div
//           style={{
//             position: 'fixed',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             backgroundColor: 'rgba(0, 0, 0, 0.5)',
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center',
//             zIndex: 1000,
//           }}
//           onClick={() => setShowChatModal(false)}
//         >
//           <div
//             style={{
//               backgroundColor: 'white',
//               borderRadius: '12px',
//               padding: '2rem',
//               maxWidth: '600px',
//               width: '90%',
//               maxHeight: '80vh',
//               display: 'flex',
//               flexDirection: 'column',
//             }}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
//               <h2 style={{ margin: 0 }}>Need Help?</h2>
//               <button
//                 onClick={() => setShowChatModal(false)}
//                 style={{
//                   background: 'none',
//                   border: 'none',
//                   fontSize: '1.5rem',
//                   cursor: 'pointer',
//                   color: '#6b7280',
//                 }}
//               >
//                 ×
//               </button>
//             </div>

//             <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
//               <strong>Current Question:</strong> {currentQuestion.prompt}
//             </div>

//             {chatReply && (
//               <div
//                 ref={chatReplyRef}
//                 style={{
//                   flex: 1,
//                   overflowY: 'auto',
//                   backgroundColor: '#f9fafb',
//                   padding: '1rem',
//                   borderRadius: '8px',
//                   marginBottom: '1rem',
//                   whiteSpace: 'pre-wrap',
//                   maxHeight: '300px',
//                 }}
//               >
//                 {chatReply}
//               </div>
//             )}

//             <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '0.5rem' }}>
//               <input
//                 type="text"
//                 value={chatPrompt}
//                 onChange={(e) => setChatPrompt(e.target.value)}
//                 placeholder="Ask your question..."
//                 disabled={chatLoading}
//                 style={{
//                   flex: 1,
//                   padding: '0.75rem',
//                   border: '1px solid #e5e7eb',
//                   borderRadius: '6px',
//                   fontSize: '1rem',
//                 }}
//               />
//               <button
//                 type="submit"
//                 disabled={chatLoading || !chatPrompt.trim()}
//                 style={{
//                   padding: '0.75rem 1.5rem',
//                   backgroundColor: chatLoading || !chatPrompt.trim() ? '#e5e7eb' : '#10b981',
//                   color: chatLoading || !chatPrompt.trim() ? '#9ca3af' : 'white',
//                   border: 'none',
//                   borderRadius: '6px',
//                   cursor: chatLoading || !chatPrompt.trim() ? 'not-allowed' : 'pointer',
//                   fontWeight: '600',
//                 }}
//               >
//                 {chatLoading ? '...' : 'Send'}
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
