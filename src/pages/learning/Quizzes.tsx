// import { useParams, useSearchParams, useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";
// import { useAuth } from "@clerk/clerk-react";
// import { useLearning } from "../../hooks/useLearning";
// import { useUserPreferences } from "../../hooks/useUserPreferences";
// import { useDocument } from "../../hooks/useDocument";
// import { useSharedQuizzes } from "../../hooks/useSharedQuizzes";
// import { useQuizAttempts } from "../../hooks/useQuizAttempts";
// import QuizCard from "../../components/learning/QuizCard";
// import EmptyState from "../../components/learning/EmptyState";
// import type { Quiz, CustomQuiz, SharedQuiz } from "../../types/learning";

// // Helper function to check document access
// const hasAccessToDocument = (
//   sharedQuizzes: SharedQuiz[] | undefined,
//   documentId: string
// ): boolean => {
//   if (!sharedQuizzes) return false;

//   return sharedQuizzes.some(
//     (quiz) =>
//       quiz.documentId === documentId ||
//       quiz.customQuiz.documentId === documentId
//   );
// };

// export default function Quizzes() {
//   const navigate = useNavigate();
//   const location = window.location;
//   const { userId } = useAuth();
//   const { type, levelId, documentId, category } = useParams<{
//     type?: "existing" | "custom";
//     levelId?: string;
//     documentId?: string;
//     category?: string;
//   }>();
//   const [searchParams] = useSearchParams();
//   const [documentOwnerId, setDocumentOwnerId] = useState<string | null>(null);

//   const {
//     language,
//     industryId,
//     loading: preferencesLoading,
//   } = useUserPreferences();

//   const queryLanguage = searchParams.get("language") || language;
//   const queryIndustryId =
//     searchParams.get("industry_id") || industryId?.toString();

//   const actualType = location.pathname.includes("/existing/")
//     ? "existing"
//     : "custom";

//   let endpoint = "";
//   if (documentId) {
//     endpoint = `documents/${documentId}/quizzes`;
//   } else if (category) {
//     endpoint = `categories/${category}/quizzes`;
//   } else if (levelId && actualType === "existing") {
//     endpoint = `levels/${levelId}/quizzes`;
//   } else {
//     endpoint = "quizzes";
//   }

//   const { data, error } = useLearning<Quiz[] | CustomQuiz[]>({
//     type: actualType,
//     endpoint,
//     params: {
//       language: queryLanguage,
//       ...(queryIndustryId && { industry_id: queryIndustryId }),
//     },
//     enabled: !preferencesLoading,
//   });

//   const quizzes: (Quiz | CustomQuiz)[] = data?.data || [];
//   const count = data?.count || 0;
//   const isEmpty = quizzes.length === 0;

//   const documentName =
//     documentId &&
//     quizzes.length > 0 &&
//     "document" in quizzes[0] &&
//     quizzes[0].document
//       ? quizzes[0].document.filename
//       : null;

//   // Fetch document ownership (only if documentId exists)
//   const { data: documentData } = useDocument(documentId);

//   // Fetch shared quizzes (only if user doesn't own the document)
//   const { data: sharedQuizzes } = useSharedQuizzes(
//     !!documentData && documentData.document.userId !== userId
//   );

//   // Fetch quiz attempts using custom hook
//   const firstQuizId =
//     actualType === "custom" && quizzes.length > 0 ? quizzes[0]?.id : null;
//   const { data: attempts = [] } = useQuizAttempts(
//     firstQuizId,
//     actualType === "custom"
//   );

//   // Check document ownership and redirect if needed
//   useEffect(() => {
//     if (!documentData || !userId || !documentId) return;

//     const ownerId = documentData.document.userId;
//     setDocumentOwnerId(ownerId);

//     console.log("Quizzes ownership check:", {
//       ownerId,
//       userId,
//       isOwner: ownerId === userId,
//     });

//     // If user IS the owner, allow access
//     if (ownerId === userId) {
//       console.log("User is owner, allowing access");
//       return;
//     }

//     // User is NOT the owner - check if they have shared access
//     console.log("User is not owner, checking shared access...");

//     const hasSharedAccess = hasAccessToDocument(sharedQuizzes, documentId);

//     console.log("Has shared access:", hasSharedAccess);

//     if (hasSharedAccess) {
//       console.log("User has shared access, allowing access");
//     } else {
//       console.log("User has no access, redirecting to /learning/custom");
//       navigate("/learning/custom", { replace: true });
//     }
//   }, [documentData, sharedQuizzes, userId, documentId, navigate]);

//   const showLoading = !data && !error;

//   const handleBack = () => {
//     if (documentId) {
//       // Smart back navigation based on document ownership
//       if (documentOwnerId && userId && documentOwnerId !== userId) {
//         // User is NOT the owner (shared user) - go to shared quizzes
//         navigate("/learning/shared");
//         return;
//       }
//       // User IS the owner - go to document study page
//       navigate(`/learning/documents/${documentId}`);
//     } else if (category) {
//       navigate(`/learning/custom/categories/${category}`);
//     } else {
//       navigate(-1);
//     }
//   };

//   if (showLoading) {
//     return (
//       <div style={{ padding: "2rem" }}>
//         <div
//           style={{
//             padding: "3rem 2rem",
//             textAlign: "center",
//             color: "#666",
//           }}
//         >
//           <p style={{ margin: 0, fontSize: "1rem" }}>Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={{ padding: "2rem" }}>
//       <button onClick={handleBack} style={{ marginBottom: "1rem" }}>
//         ← Back
//       </button>

//       <h1>
//         {documentName ||
//           (documentId
//             ? "Document Quiz"
//             : type === "existing"
//             ? "Red Seal"
//             : "Custom")}{" "}
//         Quiz History
//       </h1>

//       {error && (
//         <div
//           style={{
//             backgroundColor: "#fee",
//             padding: "1rem",
//             borderRadius: "6px",
//             border: "1px solid #fcc",
//             marginTop: "1rem",
//           }}
//         >
//           <strong>Error loading quizzes</strong>
//           <p style={{ margin: "0.5rem 0 0 0" }}>{error}</p>
//         </div>
//       )}

//       {!error && data && (
//         <>
//           <p style={{ color: "#666", marginBottom: "0.5rem" }}>
//             Language:{" "}
//             <strong style={{ textTransform: "capitalize" }}>
//               {queryLanguage}
//             </strong>
//           </p>

//           {count > 0 && (
//             <p style={{ color: "#666", marginBottom: "1rem" }}>
//               Total: {count} quizzes
//             </p>
//           )}

//           {isEmpty ? (
//             type === "custom" ? (
//               <EmptyState type="quizzes" />
//             ) : (
//               <div>
//                 <p>No quizzes found for this level.</p>
//               </div>
//             )
//           ) : (
//             <>
//               <div style={{ marginTop: "2rem" }}>
//                 <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>
//                   {documentId ? "Take Quiz" : "Available Quizzes"}
//                 </h2>
//                 {quizzes
//                   .slice(0, documentId ? 1 : quizzes.length)
//                   .map((quiz, index) => (
//                     <QuizCard
//                       key={quiz.id}
//                       quiz={quiz}
//                       index={index + 1}
//                       type={actualType}
//                       hasAttempts={attempts.length > 0}
//                       category={category}
//                     />
//                   ))}
//               </div>

//               {actualType === "custom" && documentId && (
//                 <div style={{ marginTop: "3rem" }}>
//                   <h2
//                     style={{
//                       marginBottom: "1rem",
//                       fontSize: "1.25rem",
//                       paddingTop: "2rem",
//                       borderTop: "1px solid #e5e7eb",
//                     }}
//                   >
//                     Your Attempts{" "}
//                     {attempts.length > 0 ? `(${attempts.length})` : ""}
//                   </h2>
//                   {attempts.length > 0 ? (
//                     attempts.map((attempt, index) => (
//                       <QuizCard
//                         key={attempt.id}
//                         quiz={attempt}
//                         index={index + 1}
//                         type={actualType}
//                       />
//                     ))
//                   ) : (
//                     <p style={{ color: "#666", fontStyle: "italic" }}>
//                       No attempts yet. Take the quiz above to see your history
//                       here.
//                     </p>
//                   )}
//                 </div>
//               )}
//             </>
//           )}
//         </>
//       )}
//     </div>
//   );
// }


import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useLearning } from "../../hooks/useLearning";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import { useDocument } from "../../hooks/useDocument";
import { useSharedQuizzes } from "../../hooks/useSharedQuizzes";
import { useQuizAttempts } from "../../hooks/useQuizAttempts";
import QuizCard from "../../components/learning/QuizCard";
import EmptyState from "../../components/learning/EmptyState";
import type { Quiz, CustomQuiz, SharedQuiz } from "../../types/learning";

// Helper function to check document access
const hasAccessToDocument = (
  sharedQuizzes: SharedQuiz[] | undefined,
  documentId: string
): boolean => {
  if (!sharedQuizzes) return false;

  return sharedQuizzes.some(
    (quiz) =>
      quiz.documentId === documentId ||
      quiz.customQuiz.documentId === documentId
  );
};

export default function Quizzes() {
  const navigate = useNavigate();
  const location = window.location;
  const { userId } = useAuth();
  const { type, levelId, documentId, category } = useParams<{
    type?: "existing" | "custom";
    levelId?: string;
    documentId?: string;
    category?: string;
  }>();
  const [searchParams] = useSearchParams();
  const [documentOwnerId, setDocumentOwnerId] = useState<string | null>(null);

  const {
    language,
    industryId,
    loading: preferencesLoading,
  } = useUserPreferences();

  const queryLanguage = searchParams.get("language") || language;
  const queryIndustryId =
    searchParams.get("industry_id") || industryId?.toString();

  const actualType = location.pathname.includes("/existing/")
    ? "existing"
    : "custom";

  let endpoint = "";
  if (documentId) {
    endpoint = `documents/${documentId}/quizzes`;
  } else if (category) {
    endpoint = `categories/${category}/quizzes`;
  } else if (levelId && actualType === "existing") {
    endpoint = `levels/${levelId}/quizzes`;
  } else {
    endpoint = "quizzes";
  }

  const { data, error } = useLearning<Quiz[] | CustomQuiz[]>({
    type: actualType,
    endpoint,
    params: {
      language: queryLanguage,
      ...(queryIndustryId && { industry_id: queryIndustryId }),
    },
    enabled: !preferencesLoading,
  });

  const quizzes: (Quiz | CustomQuiz)[] = data?.data || [];
  const count = data?.count || 0;
  const isEmpty = quizzes.length === 0;

  const documentName =
    documentId &&
    quizzes.length > 0 &&
    "document" in quizzes[0] &&
    quizzes[0].document
      ? quizzes[0].document.filename
      : null;

  // Fetch document ownership (only if documentId exists)
  const { data: documentData } = useDocument(documentId);

  // Fetch shared quizzes (only if user doesn't own the document)
  const { data: sharedQuizzes } = useSharedQuizzes(
    !!documentData && documentData.document.userId !== userId
  );

  // Fetch quiz attempts using custom hook
  const firstQuizId =
    actualType === "custom" && quizzes.length > 0 ? quizzes[0]?.id : null;
  const { data: attempts = [] } = useQuizAttempts(
    firstQuizId,
    actualType === "custom"
  );

  // Check document ownership and redirect if needed
  useEffect(() => {
    if (!documentData || !userId || !documentId) return;

    const ownerId = documentData.document.userId;
    setDocumentOwnerId(ownerId);

    console.log("Quizzes ownership check:", {
      ownerId,
      userId,
      isOwner: ownerId === userId,
    });

    // If user IS the owner, allow access
    if (ownerId === userId) {
      console.log("User is owner, allowing access");
      return;
    }

    // User is NOT the owner - check if they have shared access
    console.log("User is not owner, checking shared access...");

    const hasSharedAccess = hasAccessToDocument(sharedQuizzes, documentId);

    console.log("Has shared access:", hasSharedAccess);

    if (hasSharedAccess) {
      console.log("User has shared access, allowing access");
    } else {
      console.log("User has no access, redirecting to /learning/custom");
      navigate("/learning/custom", { replace: true });
    }
  }, [documentData, sharedQuizzes, userId, documentId, navigate]);

  const showLoading = !data && !error;

  const handleBack = () => {
    if (documentId) {
      // Smart back navigation based on document ownership
      if (documentOwnerId && userId && documentOwnerId !== userId) {
        // User is NOT the owner (shared user) - go to shared quizzes
        navigate("/learning/shared");
        return;
      }
      // User IS the owner - go to document study page
      navigate(`/learning/documents/${documentId}`);
    } else if (category) {
      navigate(`/learning/custom/categories/${category}`);
    } else {
      navigate(-1);
    }
  };

  if (showLoading) {
    return (
      <div style={{ padding: "2rem" }}>
        <div
          style={{
            padding: "3rem 2rem",
            textAlign: "center",
            color: "#666",
          }}
        >
          <p style={{ margin: 0, fontSize: "1rem" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <button onClick={handleBack} style={{ marginBottom: "1rem" }}>
        ← Back
      </button>

      <h1>
        {documentName ||
          (documentId
            ? "Document Quiz"
            : type === "existing"
            ? "Red Seal"
            : "Custom")}{" "}
        Quiz History
      </h1>

      {error && (
        <div
          style={{
            backgroundColor: "#fee",
            padding: "1rem",
            borderRadius: "6px",
            border: "1px solid #fcc",
            marginTop: "1rem",
          }}
        >
          <strong>Error loading quizzes</strong>
          <p style={{ margin: "0.5rem 0 0 0" }}>{error}</p>
        </div>
      )}

      {!error && data && (
        <>
          <p style={{ color: "#666", marginBottom: "0.5rem" }}>
            Language:{" "}
            <strong style={{ textTransform: "capitalize" }}>
              {queryLanguage}
            </strong>
          </p>

          {count > 0 && (
            <p style={{ color: "#666", marginBottom: "1rem" }}>
              Total: {count} quizzes
            </p>
          )}

          {isEmpty ? (
            type === "custom" ? (
              <EmptyState type="quizzes" />
            ) : (
              <div>
                <p>No quizzes found for this level.</p>
              </div>
            )
          ) : (
            <>
              <div style={{ marginTop: "2rem" }}>
                <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>
                  {documentId ? "Take Quiz" : "Available Quizzes"}
                </h2>
                {quizzes
                  .slice(0, documentId ? 1 : quizzes.length)
                  .map((quiz, index) => (
                    <QuizCard
                      key={quiz.id}
                      quiz={quiz}
                      index={index + 1}
                      type={actualType}
                      hasAttempts={attempts.length > 0}
                      category={category}
                    />
                  ))}
              </div>

              {actualType === "custom" && documentId && (
                <div style={{ marginTop: "3rem" }}>
                  <h2
                    style={{
                      marginBottom: "1rem",
                      fontSize: "1.25rem",
                      paddingTop: "2rem",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    Your Attempts{" "}
                    {attempts.length > 0 ? `(${attempts.length})` : ""}
                  </h2>
                  {attempts.length > 0 ? (
                    attempts.map((attempt, index) => (
                      <QuizCard
                        key={attempt.id}
                        quiz={attempt}
                        index={index + 1}
                        type={actualType}
                      />
                    ))
                  ) : (
                    <p style={{ color: "#666", fontStyle: "italic" }}>
                      No attempts yet. Take the quiz above to see your history
                      here.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
