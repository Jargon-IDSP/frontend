export interface UploadDocumentFormProps {
  onSuccess: () => void;
}

export interface UploadData {
  file: File;
  token: string;
}

export interface SignResponse {
  uploadUrl: string;
  key: string;
}

export interface SaveResponse {
  redirectUrl?: string;
  documentId: string;
}
