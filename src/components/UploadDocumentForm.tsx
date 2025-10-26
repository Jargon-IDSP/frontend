import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../lib/api';

interface UploadDocumentFormProps {
  onSuccess: () => void;
}

export function UploadDocumentForm({ onSuccess }: UploadDocumentFormProps) {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const token = await getToken();

      const signRes = await fetch(`${BACKEND_URL}/documents/upload/sign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          type: file.type,
        }),
      });

      if (!signRes.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, key } = await signRes.json();

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload file');
      }

      const saveRes = await fetch(`${BACKEND_URL}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileKey: key,
          filename: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      if (!saveRes.ok) {
        throw new Error('Failed to save document');
      }

      const { redirectUrl, documentId } = await saveRes.json();

      setFile(null);
      setUploading(false);
      onSuccess();

      if (redirectUrl) {
        console.log('🚀 Redirecting to:', redirectUrl);
        navigate(redirectUrl, {
          state: {
            documentId: documentId
          }
        });
      }

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Select Document
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png"
          disabled={uploading}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '2px solid #e5e7eb',
            borderRadius: '6px',
          }}
        />
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
          Supported formats: PDF, JPG, PNG
        </p>
      </div>

      {error && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#fee2e2',
          border: '1px solid #ef4444',
          borderRadius: '6px',
          color: '#991b1b',
        }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!file || uploading}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: uploading || !file ? '#d1d5db' : '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: uploading || !file ? 'not-allowed' : 'pointer',
        }}
      >
        {uploading ? 'Uploading...' : 'Choose File'}
      </button>

      {uploading && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#eff6ff',
          borderRadius: '6px',
          fontSize: '0.875rem',
          textAlign: 'center',
        }}>
          <p style={{ margin: 0 }}>
            📤 Uploading and processing document... You'll be redirected when ready.
          </p>
        </div>
      )}
    </form>
  );
}