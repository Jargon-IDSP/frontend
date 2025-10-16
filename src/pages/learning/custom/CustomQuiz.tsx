import { useNavigate, useParams } from "react-router-dom";

export default function CustomQuiz() {
  const navigate = useNavigate();
  const { quizNumber } = useParams();

  return (
    <div>
      <button onClick={() => navigate("/learning/custom/quiz-select")}>
        ← Back
      </button>

      <h1>Custom Quiz {quizNumber}</h1>

      <button style={{ margin: "1rem" }} onClick={() => console.log(`Start Custom Quiz ${quizNumber}`)}>
        Start Quiz
      </button>
    </div>
  );
}
