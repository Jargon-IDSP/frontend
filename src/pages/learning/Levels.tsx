import { useNavigate } from "react-router-dom";
import LevelButton from "../../components/learning/LevelSelector";

export default function ExistingLevels() {
  const navigate = useNavigate();

  const levels = [
    { id: 1, name: "Foundation", description: "Basic trades terminology" },
    { id: 2, name: "Intermediate", description: "Common trade practices" },
    { id: 3, name: "Advanced", description: "Complex technical concepts" },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={() => navigate("/learning")} style={{ marginBottom: "1rem" }}>
        ← Back to Learning Hub
      </button>
      
      <h1>Red Seal Apprentice Levels</h1>
      <p>Choose your apprenticeship level to start studying trades jargon:</p>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem', 
        marginTop: '2rem',
        maxWidth: '600px'
      }}>
        {levels.map((level) => (
          <LevelButton
            key={level.id}
            onClick={() => navigate(`/learning/existing/levels/${level.id}`)}
          >
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                Level {level.id}: {level.name}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                {level.description}
              </div>
            </div>
            <span style={{ fontSize: '1.5rem' }}>→</span>
          </LevelButton>
        ))}
      </div>
    </div>
  );
}