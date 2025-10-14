import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

export default function ProfilePage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

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
    <div style={{ padding: "2rem" }}>
      <h1>Profile Page</h1>
      
      {error && (
        <div
          style={{
            color: "red",
            padding: "1rem",
            border: "1px solid red",
            marginBottom: "1rem",
            borderRadius: "4px",
          }}
        >
          Error: {error}
        </div>
      )}

      {data && (
        <div>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
