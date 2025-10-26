import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import type { ApiResponse } from '../types/learning';
import { BACKEND_URL } from '../lib/api';

interface UseLearningOptions {
  type: 'existing' | 'custom';
  endpoint: string;
  params?: Record<string, string>;
  enabled?: boolean;
}

export const useLearning = <T>({ 
  type, 
  endpoint, 
  params, 
  enabled = true 
}: UseLearningOptions): { 
  data: ApiResponse<T> | null; 
  loading: boolean; 
  error: string | null;
} => {
  const [data, setData] = useState<ApiResponse<T> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken, isLoaded, isSignedIn } = useAuth();

  // Memoize params to prevent unnecessary re-renders
  const paramsString = useMemo(() => JSON.stringify(params || {}), [params?.language, params?.industry_id]);

  useEffect(() => {
    if (!enabled || !isLoaded || !isSignedIn) {
      console.log('Not ready:', { enabled, isLoaded, isSignedIn });
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const queryString = params 
          ? '?' + new URLSearchParams(params).toString() 
          : '';
        
        // Special handling for document routes - they go directly under /learning/documents
        // not /learning/custom/documents
        let url: string;
        if (endpoint.startsWith('documents/')) {
          // Document routes: /learning/documents/:documentId/terms
          url = `${BACKEND_URL}/learning/${endpoint}${queryString}`;
        } else {
          // Regular routes: /learning/existing/... or /learning/custom/...
          url = `${BACKEND_URL}/learning/${type}/${endpoint}${queryString}`;
        }
        
        console.log('Fetching from:', url);

        const token = await getToken();
        console.log('Token exists:', !!token);
        
        if (!token) {
          throw new Error('No authentication token available. Please log in.');
        }

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response not OK:', response.status, errorText);
          throw new Error(`Failed to fetch data: ${response.status} - ${errorText}`);
        }

        const result: ApiResponse<T> = await response.json();
        console.log('Fetch result:', result);
        setData(result);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, endpoint, paramsString, enabled, getToken, isLoaded, isSignedIn]); 

  return { data, loading, error };
};