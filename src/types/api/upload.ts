// File upload types
export interface FileInfo {
  fileName: string;
  fileSize: number;
  fileType: string;
  file: File;
}

export interface UploadRequest {
  fileInfo: FileInfo;
  token: string;
}

export interface UploadData {
  file: File;
  token: string;
}

// S3 presigned URL response
export interface SignResponse {
  uploadUrl: string;
  key: string;
}

// Document save response
export interface SaveResponse {
  documentId: string;
  redirectUrl?: string;
  document?: {
    id: string;
  };
}
