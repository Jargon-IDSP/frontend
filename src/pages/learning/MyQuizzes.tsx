import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMyQuizzes } from "../../hooks/useMyQuizzes";
import QuizShareModal from "../../components/learning/QuizShareModal";
import Button from "../../components/learning/ui/Button";
import Card from "../../components/learning/ui/Card";
import { getUserDisplayName } from "../../types/friend";

export default function MyQuizzesPage() {
  const [shareModalQuiz, setShareModalQuiz] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const navigate = useNavigate();

  // Use custom hook
  const {
    data: quizzes = [],
    isLoading: loading,
    refetch: refetchQuizzes,
  } = useMyQuizzes();

  const handleTakeQuiz = (quizId: string) => {
    navigate(`/learning/custom/quiz/take?quizId=${quizId}`);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <Button
        onClick={() => navigate("/learning/custom")}
        variant="secondary"
        style={{ marginBottom: "1rem" }}
      >
        ← Back to Custom Learning
      </Button>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1 style={{ margin: 0 }}>My Custom Quizzes</h1>
        <Button onClick={() => navigate("/learning/shared")} variant="success">
          View Shared Quizzes
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : quizzes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
          <p style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}>
            You haven't created any custom quizzes yet
          </p>
          <p>Upload documents and create quizzes to get started!</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {quizzes.map((quiz) => (
            <Card key={quiz.id} hoverable={false}>
              <div style={{ marginBottom: "1rem" }}>
                <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem" }}>
                  {quiz.name}
                </h3>
                {quiz.category && (
                  <p
                    style={{
                      margin: "0",
                      fontSize: "0.875rem",
                      color: "#6b7280",
                    }}
                  >
                    Category: {quiz.category}
                  </p>
                )}
                <p
                  style={{
                    margin: "0.25rem 0 0 0",
                    fontSize: "0.875rem",
                    color: "#6b7280",
                  }}
                >
                  {quiz._count.questions} question
                  {quiz._count.questions !== 1 ? "s" : ""}
                </p>
              </div>

              {quiz._count.sharedWith > 0 && (
                <div
                  style={{
                    backgroundColor: "#f0f9ff",
                    padding: "0.75rem",
                    borderRadius: "6px",
                    marginBottom: "1rem",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 0.5rem 0",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: "#0369a1",
                    }}
                  >
                    Shared with {quiz._count.sharedWith} friend
                    {quiz._count.sharedWith !== 1 ? "s" : ""}:
                  </p>
                  <div style={{ fontSize: "0.75rem", color: "#0c4a6e" }}>
                    {quiz.sharedWith.slice(0, 3).map((share) => (
                      <div key={share.id}>
                        • {getUserDisplayName(share.sharedWith)}
                      </div>
                    ))}
                    {quiz._count.sharedWith > 3 && (
                      <div style={{ fontStyle: "italic" }}>
                        ...and {quiz._count.sharedWith - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Button
                  onClick={() => handleTakeQuiz(quiz.id)}
                  variant="primary"
                  fullWidth
                >
                  Take Quiz
                </Button>
                <Button
                  onClick={() =>
                    setShareModalQuiz({ id: quiz.id, name: quiz.name })
                  }
                  variant="success"
                  fullWidth
                >
                  Share
                </Button>
              </div>

              <p
                style={{
                  margin: "0.75rem 0 0 0",
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                  textAlign: "center",
                }}
              >
                Created {new Date(quiz.createdAt).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      )}

      {shareModalQuiz && (
        <QuizShareModal
          quizId={shareModalQuiz.id}
          quizName={shareModalQuiz.name}
          onClose={() => setShareModalQuiz(null)}
          onShared={() => {
            refetchQuizzes(); // Refresh to show updated share count
          }}
        />
      )}
    </div>
  );
}

// import { useState, useEffect } from "react";
// import { useAuth } from "@clerk/clerk-react";
// import { useNavigate } from "react-router-dom";
// import { BACKEND_URL } from "../../lib/api";
// import QuizShareModal from "../../components/learning/QuizShareModal";
// import Button from "../../components/learning/ui/Button";
// import Card from "../../components/learning/ui/Card";
// import { getUserDisplayName } from "../../types/friend";

// interface CustomQuiz {
//   id: string;
//   name: string;
//   category: string | null;
//   createdAt: string;
//   _count: {
//     questions: number;
//     sharedWith: number;
//   };
//   sharedWith: Array<{
//     id: string;
//     sharedAt: string;
//     sharedWith: {
//       id: string;
//       username: string | null;
//       firstName: string | null;
//       lastName: string | null;
//     };
//   }>;
// }

// export default function MyQuizzesPage() {
//   const [quizzes, setQuizzes] = useState<CustomQuiz[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [shareModalQuiz, setShareModalQuiz] = useState<{ id: string; name: string } | null>(null);
//   const { getToken } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchQuizzes();
//   }, []);

//   const fetchQuizzes = async () => {
//     try {
//       const token = await getToken();
//       const res = await fetch(`${BACKEND_URL}/learning/sharing/my-shared-quizzes`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (res.ok) {
//         const data = await res.json();
//         setQuizzes(data.data || []);
//       }
//     } catch (err) {
//       console.error("Error fetching quizzes:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleTakeQuiz = (quizId: string) => {
//     navigate(`/learning/custom/quiz/take?quizId=${quizId}`);
//   };

//   return (
//     <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
//       <Button onClick={() => navigate("/learning/custom")} variant="secondary" style={{ marginBottom: "1rem" }}>
//         ← Back to Custom Learning
//       </Button>

//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
//         <h1 style={{ margin: 0 }}>My Custom Quizzes</h1>
//         <Button onClick={() => navigate("/learning/shared")} variant="success">
//           View Shared Quizzes
//         </Button>
//       </div>

//       {loading ? (
//         <p>Loading...</p>
//       ) : quizzes.length === 0 ? (
//         <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
//           <p style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}>
//             You haven't created any custom quizzes yet
//           </p>
//           <p>Upload documents and create quizzes to get started!</p>
//         </div>
//       ) : (
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.5rem" }}>
//           {quizzes.map((quiz) => (
//             <Card key={quiz.id} hoverable={false}>
//               <div style={{ marginBottom: "1rem" }}>
//                 <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem" }}>
//                   {quiz.name}
//                 </h3>
//                 {quiz.category && (
//                   <p style={{ margin: "0", fontSize: "0.875rem", color: "#6b7280" }}>
//                     Category: {quiz.category}
//                   </p>
//                 )}
//                 <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "#6b7280" }}>
//                   {quiz._count.questions} question{quiz._count.questions !== 1 ? "s" : ""}
//                 </p>
//               </div>

//               {quiz._count.sharedWith > 0 && (
//                 <div
//                   style={{
//                     backgroundColor: "#f0f9ff",
//                     padding: "0.75rem",
//                     borderRadius: "6px",
//                     marginBottom: "1rem",
//                   }}
//                 >
//                   <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.875rem", fontWeight: "600", color: "#0369a1" }}>
//                     Shared with {quiz._count.sharedWith} friend{quiz._count.sharedWith !== 1 ? "s" : ""}:
//                   </p>
//                   <div style={{ fontSize: "0.75rem", color: "#0c4a6e" }}>
//                     {quiz.sharedWith.slice(0, 3).map((share) => (
//                       <div key={share.id}>
//                         • {getUserDisplayName(share.sharedWith)}
//                       </div>
//                     ))}
//                     {quiz._count.sharedWith > 3 && (
//                       <div style={{ fontStyle: "italic" }}>
//                         ...and {quiz._count.sharedWith - 3} more
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               <div style={{ display: "flex", gap: "0.5rem" }}>
//                 <Button
//                   onClick={() => handleTakeQuiz(quiz.id)}
//                   variant="primary"
//                   fullWidth
//                 >
//                   Take Quiz
//                 </Button>
//                 <Button
//                   onClick={() => setShareModalQuiz({ id: quiz.id, name: quiz.name })}
//                   variant="success"
//                   fullWidth
//                 >
//                   Share
//                 </Button>
//               </div>

//               <p style={{ margin: "0.75rem 0 0 0", fontSize: "0.75rem", color: "#9ca3af", textAlign: "center" }}>
//                 Created {new Date(quiz.createdAt).toLocaleDateString()}
//               </p>
//             </Card>
//           ))}
//         </div>
//       )}

//       {shareModalQuiz && (
//         <QuizShareModal
//           quizId={shareModalQuiz.id}
//           quizName={shareModalQuiz.name}
//           onClose={() => setShareModalQuiz(null)}
//           onShared={() => {
//             fetchQuizzes(); // Refresh to show updated share count
//           }}
//         />
//       )}
//     </div>
//   );
// }
