import { useNavigate } from "react-router-dom";

export default function ExistingLearning() {
  const navigate = useNavigate();

  const levels = ["level1", "level2", "level3"];

  return (
    <div>
      <button onClick={() => navigate("/learning")}>← Back</button>

      <h1 style={{ textAlign: "center" }}>Select a Level</h1>

      {levels.map((level) => (
        <button
          key={level}
          onClick={() => navigate(`/learning/existing/levels/${level}`)}
          style={{ margin: "1rem" }}
        >
          {level.replace("level", "Red Seal Level ")}
        </button>
      ))}
    </div>
  );
}
