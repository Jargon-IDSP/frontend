import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import { testConnection } from './services/api';
import './App.css';

function App() {
const [backendStatus, setBackendStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testConnection()
      .then(data => {
        setBackendStatus(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Backend connection failed:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Jargon App</h1>
        <h2>Frontend ↔️ Backend Connection</h2>
        
        {loading ? (
          <p>Testing backend connection...</p>
        ) : backendStatus ? (
          <div>
            <h3>✅ Backend Connected!</h3>
            <div style={{ 
              background: '#282c34', 
              padding: '20px', 
              borderRadius: '8px',
              marginTop: '20px'
            }}>
              <pre style={{ 
                textAlign: 'left', 
                fontSize: '14px',
                color: '#61dafb'
              }}>
                {JSON.stringify(backendStatus, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div>
            <h3>❌ Backend Connection Failed</h3>
            <p>Make sure your backend is running on port 8000</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;