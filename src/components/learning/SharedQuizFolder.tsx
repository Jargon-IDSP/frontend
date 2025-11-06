import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserDisplayName } from "@/types/friend";
import type { SharedQuiz } from "@/types/learning";

interface SharedQuizFolderProps {
  categoryName: string;
  sharedQuizzes: SharedQuiz[];
}

export function SharedQuizFolder({ categoryName, sharedQuizzes }: SharedQuizFolderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleFolder = () => {
    setIsOpen(!isOpen);
  };

  const handleQuizClick = (quiz: SharedQuiz["customQuiz"]) => {
    // Check if quiz has a documentId to determine the correct route
    if ("documentId" in quiz && quiz.documentId) {
      navigate(`/learning/documents/${quiz.documentId}/study`);
    } else {
      // For general custom quizzes, go to the custom quiz page
      navigate(`/learning/custom/quiz/take?quizId=${quiz.id}&skipHistory=true`);
    }
  };

  return (
    <div className="category-folder">
      <div className="category-folder-header" onClick={toggleFolder}>
        <div className="category-folder-title">
          <h3>{categoryName}</h3>
          <span className="quiz-count">({sharedQuizzes.length} quiz{sharedQuizzes.length !== 1 ? 'es' : ''})</span>
        </div>
        <svg
          className={`chevron ${isOpen ? 'open' : ''}`}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="category-folder-content">
          {sharedQuizzes.length > 0 ? (
            <div className="document-list">
              {sharedQuizzes.map((share) => (
                <div
                  key={share.id}
                  className="document-item"
                  onClick={() => handleQuizClick(share.customQuiz)}
                >
                  <div className="document-info">
                    <span className="document-name">{share.customQuiz.name}</span>
                    <div className="document-stats">
                      <span className="stat">
                        Shared by {getUserDisplayName(share.customQuiz.user)}
                      </span>
                      <span className="stat">
                        {share.customQuiz._count.questions} question{share.customQuiz._count.questions !== 1 ? 's' : ''}
                      </span>
                      <span className="stat">
                        {new Date(share.sharedAt).toLocaleDateString()}
                      </span>
                    </div>
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
        </div>
      )}
    </div>
  );
}
