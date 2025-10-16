import { useNavigate, useParams } from "react-router-dom";

export default function ExistingTerms() {
  const navigate = useNavigate();
  const { level } = useParams();

  return (
    <div>
      <button onClick={() => navigate(`/learning/existing/levels/${level}`)}>← Back</button>

      <h1>Terms - {level?.replace("level", "Red Seal Level ")}</h1>

      <p style={{margin: "1rem"}}>Terms will go here</p>
    </div>
  );
}
