import { UploadDocumentForm } from '../../components/UploadDocumentForm'
import { useNavigate } from 'react-router-dom'

export default function AddDocumentPage() {
  const navigate = useNavigate()

  const handleUploadSuccess = () => {
    navigate('/documents')
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Upload a Document</h1>
      <UploadDocumentForm onSuccess={handleUploadSuccess} />
    </div>
  )
}