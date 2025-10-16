import { useNavigate, useParams } from "react-router-dom";

export default function ExistingLevelSelect() {
  const navigate = useNavigate();
  const { level } = useParams();

  return (
    <div>
      <button onClick={() => navigate("/learning/existing")}>← Back</button>

      <h1>{level?.replace("level", "Red Seal Level ")}</h1>

      <button style={{ margin: "1rem" }} onClick={() => navigate(`/learning/existing/levels/${level}/terms`)}>
        View All Terms
      </button>

      <button style={{ margin: "1rem" }} onClick={() => navigate(`/learning/existing/levels/${level}/quiz`)}>
        Take Quiz
      </button>
    </div>
  );
}
