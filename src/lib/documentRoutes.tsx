import type { RouteObject } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import DocumentsPage from '../pages/documents/DocumentsPage';
import AddDocumentPage from '../pages/documents/AddDocumentPage';
import FullTranslationView from '../pages/documents/FullTranslationView';
import DocumentStudy from '../pages/documents/DocumentStudy';
import FilePreviewPage from '../pages/documents/FilePreviewPage';

const protect = (element: React.ReactElement) => <ProtectedRoute>{element}</ProtectedRoute>;

export const documentRoutes: RouteObject[] = [
  {
    path: '/documents',
    element: protect(<DocumentsPage />),
  },
  {
    path: '/documents/preview',
    element: protect(<FilePreviewPage />),
  },
  {
    path: '/documents/add',
    element: protect(<AddDocumentPage />),
  },
  {
    path: '/documents/:id/translation',
    element: protect(<FullTranslationView />),
  },
  {
    path: '/documents/:id/status',
    element: protect(<FullTranslationView />),
  },
  {
    path: '/documents/:documentId/study',
    element: protect(<DocumentStudy />),
  },
];
