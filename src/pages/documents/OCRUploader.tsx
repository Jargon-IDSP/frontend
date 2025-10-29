import React, { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import type { OCRResponse } from "../../types/ocr";
import { BACKEND_URL } from "../../lib/api";

const AllowedFileTypes = ["application/pdf", "image/jpeg", "image/png"];
const MaxFileSize = 20 * 1024 * 1024;

interface OCRUploadRequest {
  file: File;
}

const OCRUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedPage, setSelectedPage] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // OCR upload mutation
  const ocrMutation = useMutation({
    mutationFn: async ({ file }: OCRUploadRequest): Promise<OCRResponse> => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${BACKEND_URL}/ocr`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process PDF");
      }

      return await response.json();
    },
    onSuccess: () => {
      setSelectedPage(0);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!AllowedFileTypes.includes(selectedFile.type)) {
        return;
      }
      if (selectedFile.size > MaxFileSize) {
        return;
      }
      setFile(selectedFile);
      ocrMutation.reset(); // Clear previous results and errors
    }
  };

  const handleUpload = async () => {
    if (!file) {
      return;
    }

    ocrMutation.mutate({ file });
  };

  const handleClear = () => {
    setFile(null);
    setSelectedPage(0);
    ocrMutation.reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadText = () => {
    if (!ocrMutation.data?.fullText) return;

    const blob = new Blob([ocrMutation.data.fullText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name.replace(".pdf", "")}_extracted.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getDisplayText = (): string => {
    if (!ocrMutation.data) return "";
    if (selectedPage === 0) return ocrMutation.data.fullText || "";
    const page = ocrMutation.data.pages?.[selectedPage - 1];
    return page?.text || "";
  };

  // Validation errors
  const getFileError = (): string | null => {
    if (!file) return null;
    if (!AllowedFileTypes.includes(file.type)) {
      return "Please select a PDF, JPEG, or PNG file";
    }
    if (file.size > MaxFileSize) {
      return "File size must be less than 20MB";
    }
    return null;
  };

  const fileError = getFileError();
  const result = ocrMutation.data;
  const loading = ocrMutation.isPending;
  const error = ocrMutation.error;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        PDF OCR Text Extractor
      </h1>

      <div
        style={{
          border: "2px dashed #ccc",
          borderRadius: "8px",
          padding: "30px",
          textAlign: "center",
          marginBottom: "20px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            borderRadius: "4px",
            cursor: "pointer",
            display: "inline-block",
            marginBottom: "15px",
          }}
        >
          Choose File
        </label>

        {file && (
          <div style={{ marginTop: "15px" }}>
            <p>
              <strong>Selected:</strong> {file.name}
            </p>
            <p>
              <strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        {fileError && (
          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              backgroundColor: "#f8d7da",
              color: "#721c24",
              borderRadius: "4px",
            }}
          >
            {fileError}
          </div>
        )}

        <div style={{ marginTop: "20px" }}>
          <button
            onClick={handleUpload}
            disabled={!file || loading || !!fileError}
            style={{
              padding: "12px 30px",
              backgroundColor:
                loading || !file || fileError ? "#ccc" : "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading || !file || fileError ? "not-allowed" : "pointer",
              fontSize: "16px",
              marginRight: "10px",
            }}
          >
            {loading ? "Processing..." : "Extract Text"}
          </button>

          <button
            onClick={handleClear}
            disabled={loading}
            style={{
              padding: "12px 30px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "16px",
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <strong>Error:</strong>{" "}
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred"}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div
            style={{
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #007bff",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              animation: "spin 1s linear infinite",
              margin: "0 auto",
            }}
          />
          <p style={{ marginTop: "15px" }}>Processing your file...</p>
        </div>
      )}

      {result && result.success && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h2>Extracted Text</h2>
            <button
              onClick={downloadText}
              style={{
                padding: "8px 16px",
                backgroundColor: "#17a2b8",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Download Text
            </button>
          </div>

          {result.pages && result.pages.length > 1 && (
            <div style={{ marginBottom: "15px" }}>
              <label htmlFor="page-select" style={{ marginRight: "10px" }}>
                <strong>View Page:</strong>
              </label>
              <select
                id="page-select"
                value={selectedPage}
                onChange={(e) => setSelectedPage(Number(e.target.value))}
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value={0}>All Pages</option>
                {result.pages.map((page) => (
                  <option key={page.pageNumber} value={page.pageNumber}>
                    Page {page.pageNumber}
                    {page.confidence &&
                      ` (${(page.confidence * 100).toFixed(1)}% confidence)`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "20px",
              backgroundColor: "white",
              maxHeight: "600px",
              overflowY: "auto",
              whiteSpace: "pre-wrap",
              fontFamily: "monospace",
              fontSize: "14px",
              lineHeight: "1.6",
            }}
          >
            {getDisplayText() || "No text found"}
          </div>

          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              backgroundColor: "#e9ecef",
              borderRadius: "4px",
            }}
          >
            <strong>Statistics:</strong> {result.fullText?.length || 0}{" "}
            characters, {result.pages?.length || 0} pages
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OCRUploader;
