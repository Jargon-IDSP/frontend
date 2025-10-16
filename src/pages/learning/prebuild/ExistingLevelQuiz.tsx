import { useNavigate, useParams } from "react-router-dom";

export default function ExistingQuiz() {
  const navigate = useNavigate();
  const { level } = useParams();

  return (
    <div>
      <button onClick={() => navigate(`/learning/existing/levels/${level}`)}>
        ← Back
      </button>

      <h1>Quiz - {level?.replace("level", "Red Seal Level ")}</h1>

      <button style={{margin: "1rem"}} onClick={() => console.log(`Start quiz for ${level}`)}>
        Start Quiz
      </button>
    </div>
  );
}
