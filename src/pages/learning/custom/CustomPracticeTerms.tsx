import { useNavigate } from "react-router-dom";

export default function CustomPracticeTerms() {
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate("/learning/custom")}>← Back</button>

      <h1>Custom Practice Terms</h1>

      <p>Custom Terms will be loaded here</p>
    </div>
  );
}
