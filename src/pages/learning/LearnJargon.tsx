import { useNavigate } from "react-router-dom";

export default function LearningHub() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem' }}>
      {/* <button onClick={() => navigate("/")} style={{ marginBottom: "1rem" }}>
        ← Back to Dashboard
      </button> */}
      
      <h1>Learn Trades Jargon</h1>

      <button style={{ margin: "1rem" }} onClick={() => navigate("/learning/existing/levels")}>
        Study Existing Content
      </button>

      <button style={{ margin: "1rem" }} onClick={() => navigate("/learning/custom")}>
        Study Custom Content
      </button>
    </div>
  );
}