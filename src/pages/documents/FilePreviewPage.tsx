// // Demo version of FilePreviewPage.tsx

// import { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useMutation } from "@tanstack/react-query";
// import fileIcon from "../../assets/icons/fileIcon.svg";
// import goBackIcon from "../../assets/icons/goBackIcon.svg";
// import { BACKEND_URL } from "../../lib/api";
// import type {
//   FileInfo,
//   UploadRequest,
//   SignResponse,
//   SaveResponse,
// } from "@/types/filePreviewPage";

// export default function FilePreviewPage() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [isAgreementChecked, setIsAgreementChecked] = useState(false);

//   const fileInfo = location.state as FileInfo | null;

//   // Upload mutation
//   const uploadMutation = useMutation({
//     mutationFn: async ({ fileInfo, token }: UploadRequest): Promise<SaveResponse> => {
//       // Step 1: Get signed upload URL
//       const signRes = await fetch(`${BACKEND_URL}/documents/upload/sign`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           filename: fileInfo.fileName,
//           type: fileInfo.fileType,
//         }),
//       });

//       if (!signRes.ok) throw new Error("Failed to get upload URL");

//       const { uploadUrl, key }: SignResponse = await signRes.json();

//       // Step 2: Upload file to S3
//       const uploadRes = await fetch(uploadUrl, {
//         method: "PUT",
//         body: fileInfo.file,
//         headers: { "Content-Type": fileInfo.fileType },
//       });

//       if (!uploadRes.ok) throw new Error("Failed to upload file");

//       // Step 3: Save document metadata
//       const saveRes = await fetch(`${BACKEND_URL}/documents`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           filename: fileInfo.fileName,
//           fileType: fileInfo.fileType,
//           fileSize: fileInfo.fileSize,
//           fileKey: key,
//         }),
//       });

//       if (!saveRes.ok) throw new Error("Failed to save document");

//       return await saveRes.json();
//     },
//     onSuccess: (data) => {
//       navigate("/documents/user", {
//         state: {
//           message: "Uploading document...",
//           documentId: data.document.id,
//         },
//       });
//     },
//   });

//   // Early return if no file info
//   if (!fileInfo) {
//     navigate("/documents");
//     return null;
//   }

//   // Utilities
//   const formatFileSize = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;
//   const handleBack = () => navigate("/documents");
//   const handleStart = () => navigate('/learning/documents/cmha47br90001ztmchu5awy17/study');

//   const isImageFile = fileInfo.fileType.startsWith("image/");

//   return (
//     <div className="file-preview-page">
//       <div className="container">
//         {/* Header */}
//         <button className="upload-back" onClick={handleBack}>
//           <h1 className="page-title">
//             <img src={goBackIcon} alt="go back" />
//             Upload your document
//           </h1>
//         </button>

//         <div className="preview-section">
//           {/* File Preview */}
//           <div className="preview-content">
//             <div className="file-preview">
//               {isImageFile ? (
//                 <img
//                   src={URL.createObjectURL(fileInfo.file)}
//                   alt="File preview"
//                   className="preview-image"
//                 />
//               ) : (
//                 <div className="preview-placeholder">
//                   <div className="file-icon">
//                     <img src={fileIcon} alt="file" />
//                   </div>
//                   <p className="file-name-preview">{fileInfo.fileName}</p>
//                 </div>
//               )}
//             </div>

//             {/* File Info */}
//             <div className="file-info">
//               <p className="file-details">
//                 Size: {formatFileSize(fileInfo.fileSize)} | Type: {fileInfo.fileType}
//               </p>
//             </div>

//             {/* Actions */}
//             <div className="action-buttons">
//               <button
//                 className="btn btn-outline back-to-choose-button-preview"
//                 onClick={handleBack}
//               >
//                 Choose Different File
//               </button>

//               {/* Agreement Checkbox */}
//               <div className="agreement-checkbox">
//                 <label className="checkbox-label">
//                   <span className="checkbox-text-required">*</span>
//                   <input
//                     type="checkbox"
//                     checked={isAgreementChecked}
//                     onChange={(e) => setIsAgreementChecked(e.target.checked)}
//                     className="checkbox-input"
//                     disabled={uploadMutation.isPending}
//                   />
//                   <span className="checkbox-text">
//                     I have legal rights to upload this file and it complies with
//                     the Acceptable Use Policy.
//                   </span>
//                 </label>
//               </div>
//             </div>
//           </div>

//           {/* Upload Section */}
//           <div className="upload-section-preview">
//             <button
//               className="btn btn-primary upload-button-preview"
//               onClick={handleStart}
//               disabled={!isAgreementChecked || uploadMutation.isPending}
//             >
//               {uploadMutation.isPending ? "Processing..." : "Start"}
//             </button>

//             {/* Warning Messages */}
//             <div className="warning-messages">
//               <p className="upload-hint-preview">
//                 AI-generated content may be incomplete or inaccurate.
//               </p>
//               <p className="upload-hint-preview">
//                 Review the output and verify important details before sharing or publishing.
//               </p>
//             </div>

//             {/* Error Display */}
//             {uploadMutation.isError && (
//               <div className="error-message">
//                 <p className="error-text">
//                   {uploadMutation.error instanceof Error
//                     ? uploadMutation.error.message
//                     : "An unexpected error occurred"}
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// Working version of the file

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useMutation } from "@tanstack/react-query";
import fileIcon from "../../assets/icons/fileIcon.svg";
import goBackIcon from "../../assets/icons/goBackIcon.svg";
import { BACKEND_URL } from "../../lib/api";
import type {
  FileInfo,
  UploadRequest,
  SignResponse,
  SaveResponse,
} from "@/types/filePreviewPage";

export default function FilePreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [isAgreementChecked, setIsAgreementChecked] = useState(false);

  const fileInfo = location.state as FileInfo | null;

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({
      fileInfo,
      token,
    }: UploadRequest): Promise<SaveResponse> => {
      // Step 1: Get signed upload URL
      const signRes = await fetch(`${BACKEND_URL}/documents/upload/sign`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: fileInfo.fileName,
          type: fileInfo.fileType,
        }),
      });

      if (!signRes.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl, key }: SignResponse = await signRes.json();

      // Step 2: Upload file to S3
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: fileInfo.file,
        headers: {
          "Content-Type": fileInfo.fileType,
        },
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload file");
      }

      // Step 3: Save document metadata
      const saveRes = await fetch(`${BACKEND_URL}/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: fileInfo.fileName,
          fileType: fileInfo.fileType,
          fileSize: fileInfo.fileSize,
          fileKey: key,
        }),
      });

      if (!saveRes.ok) {
        throw new Error("Failed to save document");
      }

      return await saveRes.json();
    },
    onSuccess: (data) => {
      // Navigate to custom learning page with processing state
      // This allows users to see progress and do other things while document processes
      navigate("/learning/custom", {
        state: {
          message: "Uploading document...",
          documentId: data.document.id,
        },
      });
    },
  });

  if (!fileInfo) {
    navigate("/documents");
    return null;
  }

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  const handleBack = () => {
    navigate("/documents");
  };

  const handleUpload = async () => {
    if (!fileInfo) {
      return;
    }

    if (!isAgreementChecked) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      uploadMutation.mutate({ fileInfo, token });
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  return (
    <div className="container">
      <button onClick={handleBack} className="back-button">
        <h1 className="page-title">
          <img src={goBackIcon} alt="go back" />
          Upload your document
        </h1>
      </button>

      <div className="preview-section">
        <div className="preview-content">
          <div className="file-preview">
            {fileInfo.fileType.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(fileInfo.file)}
                alt="File preview"
                className="preview-image"
              />
            ) : (
              <div className="preview-placeholder">
                <div className="file-icon">
                  <img src={fileIcon} alt="file" />
                </div>
                <p className="file-name-preview">{fileInfo.fileName}</p>
              </div>
            )}
          </div>

          <div className="file-info">
            <p className="file-details">
              Size: {formatFileSize(fileInfo.fileSize)} | Type:{" "}
              {fileInfo.fileType}
            </p>
          </div>

          <div className="action-buttons">
            <button
              className="btn btn-outline back-to-choose-button-preview"
              onClick={handleBack}
            >
              Choose Different File
            </button>

            <div className="agreement-checkbox">
              <label className="checkbox-label">
                <span className="checkbox-text-required">*</span>
                <input
                  type="checkbox"
                  checked={isAgreementChecked}
                  onChange={(e) => setIsAgreementChecked(e.target.checked)}
                  className="checkbox-input"
                  disabled={uploadMutation.isPending}
                />
                <span className="checkbox-text">
                  I have legal rights to upload this file and it complies with
                  the Acceptable Use Policy.
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="upload-section-preview">
        <button
          className="btn btn-primary upload-button-preview"
          onClick={handleUpload}
          disabled={!isAgreementChecked || uploadMutation.isPending}
        >
          {uploadMutation.isPending ? "Processing..." : "Start"}
        </button>
        <div className="warning-messages">
          <p className="upload-hint-preview">
            AI-generated content may be incomplete or inaccurate.
          </p>
          <p className="upload-hint-preview">
            Review the output and verify important details before sharing or
            publishing.
          </p>
        </div>

        {uploadMutation.isError && (
          <div className="error-message">
            <p className="error-text">
              {uploadMutation.error instanceof Error
                ? uploadMutation.error.message
                : "An unexpected error occurred"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}