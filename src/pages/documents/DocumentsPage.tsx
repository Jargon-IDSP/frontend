import RockySpeechBubble from "../../components/RockySpeechBubble";
import { SimpleFileUpload } from "../../components/SimpleFileUpload";

export default function DocumentsPage() {
  return (
    <div className="container">
      <h1 className="page-title">AI Translate & Lesson</h1>

      <RockySpeechBubble
        text="Upload your documents and I'll turn them into bite-sized lessons!"
        className="documents-speech-bubble"
      />

      <div className="upload-section">
        <SimpleFileUpload />
      </div>
    </div>
  );
}
