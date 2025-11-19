import { useNavigate } from "react-router-dom";

export default function AvatarPageSimple() {
  const navigate = useNavigate();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#fe4d13',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h2>Avatar Editor Test</h2>
        <p>If you see this, the route is working!</p>
        <button
          onClick={() => navigate('/profile')}
          style={{
            padding: '10px 20px',
            background: '#6f2e17',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Back to Profile
        </button>
      </div>
    </div>
  );
}
