import { useNavigate } from "react-router-dom";

export default function CustomLearning() {
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate("/learning")}>← Back</button>

      <h1>Custom Learning</h1>

      {/* <button onClick={() => navigate("/learning/custom/practice-questions")}>
        Practice Questions
      </button> */}

      <button style={{ margin: "1rem" }} onClick={() => navigate("/learning/custom/practice-terms")}>
        Practice Terms
      </button>

      <button style={{ margin: "1rem" }} onClick={() => navigate("/learning/custom/quiz-select")}>
        Take Quiz
      </button>
    </div>
  );
}
