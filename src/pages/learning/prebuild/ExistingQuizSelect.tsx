import { useNavigate } from "react-router-dom";

export default function ExistingQuizSelect() {
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate("/learning/existing")}>← Back</button>

      <h1>Select Existing Quiz</h1>

      {[1, 2, 3, 4, 5].map((quizNum) => (
        <button
          key={quizNum}
          onClick={() => navigate(`/learning/existing/quiz/${quizNum}`)}
        >
          Quiz {quizNum}
        </button>
      ))}
    </div>
  );
}
