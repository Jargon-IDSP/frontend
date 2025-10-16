import { useNavigate } from "react-router-dom";

export default function ExistingPracticeQuestions() {
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate("/learning/existing")}>← Back</button>

      <h1>Existing Practice Questions</h1>

      <button onClick={() => console.log("Load questions")}>
        Load Questions
      </button>
    </div>
  );
}
