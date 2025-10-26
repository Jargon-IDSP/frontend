import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import uploadIcon from '../assets/icons/uploadIcon.svg';

interface SimpleFileUploadProps {
  onSuccess: () => void;
}

export function SimpleFileUpload({ onSuccess }: SimpleFileUploadProps) {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);

  const handleChooseFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        setFile(target.files[0]);
        navigate('/documents/preview', { 
          state: { 
            fileName: target.files[0].name,
            fileSize: target.files[0].size,
            fileType: target.files[0].type,
            file: target.files[0]
          } 
        });
      }
    };
    input.click();
  };

  return (
      <div className="simple-upload-container">
        <div className="upload-header">
          <img src={uploadIcon} alt="upload" className="upload-icon" />
          <span className="upload-text">Upload your PDF file (max 50 MB)</span>
        </div>
        <button
          onClick={handleChooseFile}
          className="btn btn-primary choose-file-button"
        >
          Choose file
        </button>
      </div>
  );
}
