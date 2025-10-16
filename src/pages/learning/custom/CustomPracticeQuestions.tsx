import { useNavigate } from "react-router-dom";

export default function CustomPracticeQuestions() {
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate("/learning/custom")}>← Back</button>

      <h1>Custom Practice Questions</h1>

      <button onClick={() => console.log("Load custom questions")}>
        Load Questions
      </button>
    </div>
  );
}
