import { useNavigate, useParams } from "react-router-dom";

export default function ExistingQuiz() {
  const navigate = useNavigate();
  const { quizNumber } = useParams();

  return (
    <div>
      <button onClick={() => navigate("/learning/existing/quiz-select")}>
        ← Back
      </button>

      <h1>Existing Quiz {quizNumber}</h1>
      <p>10 Questions</p>

      <button onClick={() => console.log(`Start Quiz ${quizNumber}`)}>
        Start Quiz
      </button>
    </div>
  );
}
