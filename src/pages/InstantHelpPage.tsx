import { useNavigate } from "react-router-dom";
import CameraToolIdentifier from "../components/CameraToolIdentifier";
import goBackIcon from "../assets/icons/goBackIcon.svg";

export default function InstantHelpPage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="instant-help-page">
        <div className="instant-help-header">
          <button onClick={() => navigate("/")}>
            <img src={goBackIcon} alt="Back" />
          </button>
          <h1 className="page-title">Instant Help</h1>
        </div>

        <CameraToolIdentifier autoStart={true} />
      </div>
    </div>
  );
}

