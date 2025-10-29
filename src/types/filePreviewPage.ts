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

export interface SignResponse {
  uploadUrl: string;
  key: string;
}

export interface SaveResponse {
  document: {
    id: string;
  };
}
