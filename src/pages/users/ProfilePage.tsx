import { useState, useEffect } from "react";
import { useAuth, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../lib/api";


export default function ProfilePage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError(null);
        const token = await getToken();
        const res = await fetch(`${BACKEND_URL}/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `Unable to fetch data`);
        }
        
        const json = await res.json();
        setData(json);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(errorMsg);
        console.error("Error fetching data:", err);
      }
    };

    fetchProfile();
  }, [getToken]);

  return (
    <div className="container">
      <div className="profile-header">
        <button 
          className="back-button"
          onClick={() => navigate("/")}
        >
          ← Back to Dashboard
        </button>
        <UserButton />
      </div>
      
      <h1 className="profile-title">Profile Page</h1>
      
      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {data && (
        <div className="profile-content">
          <div className="profile-data">
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/profile/avatar")}
            >
              View Avatar
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/profile/friends")}
            >
              Friends
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
