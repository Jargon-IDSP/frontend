import { useNavigate } from "react-router-dom";
import RockySpeechBubble from "../../components/RockySpeechBubble";
import { SimpleFileUpload } from "../../components/SimpleFileUpload";
import goBackIcon from "../../assets/icons/goBackIcon.svg";

export default function DocumentsPage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="fallbackDocPage">
        <div className="documentHeader">
        <button onClick={() => navigate("/home")}>
        <img src={goBackIcon} alt="Back" />
      </button>
      <h1 className="page-title">AI Translate & Lesson</h1>
      </div>

      <RockySpeechBubble
        text="Upload your documents and I'll turn them into bite-sized lessons!"
        className="documents-speech-bubble"
      />

      <div className="upload-section">
        <SimpleFileUpload />
      </div>
    </div>
    </div>
  );
}
