import { useNavigate } from "react-router-dom";

export default function CustomQuizSelect() {
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate("/learning/custom")}>← Back</button>

      <h1 style={{ marginBottom: "1rem" }}>Select Custom Quiz</h1>

      {[1, 2, 3, 4, 5].map((quizNum) => (
        <button
          key={quizNum}
          onClick={() => navigate(`/learning/custom/quiz/${quizNum}`)}
        >
          Custom Quiz {quizNum}
        </button>
      ))}
    </div>
  );
}
