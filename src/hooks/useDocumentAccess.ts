import { useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import type { Document } from '../types/document';
import type { DocumentAccessResult } from '../types/documentAccess';

export function useDocumentAccess(document: Document | null): DocumentAccessResult {
  const { user, isLoaded } = useUser();

  const result = useMemo(() => {
    if (!isLoaded || !document) {
      return {
        isOwner: false,
        hasAccess: false,
        isLoading: !isLoaded,
      };
    }

    const isOwner = document.userId === user?.id;

    // For now, we assume if the document loads, the user has access
    // (either as owner or via quiz share, validated by backend)
    // The backend will return 403 if they don't have access
    const hasAccess = true;

    return {
      isOwner,
      hasAccess,
      isLoading: false,
    };
  }, [document, user?.id, isLoaded]);

  return result;
}
