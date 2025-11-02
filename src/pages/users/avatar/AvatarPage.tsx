import { useNavigate } from "react-router-dom";
import HappyRocky from "../../../components/avatar/HappyRocky";
import TopHat from "@/components/avatar/TopHat";
import Mustache from "@/components/avatar/Mustache";
import goBackIcon from "../../../assets/icons/goBackIcon.svg";

export default function AvatarPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "2rem" }}>
      <button 
        onClick={() => navigate(-1)}
        aria-label="Back"
      >
        <img src={goBackIcon} alt="Back Button" />    
      </button>
      <h1>Your Avatar</h1>
      
      <div style={{ 
        position: "relative", 
        width: "200px", 
        height: "200px",
        margin: "0 auto"
      }}>

        <div style={{ position: "absolute", top: 30, left: 25 }}>
          <HappyRocky />
        </div>
        
        <div style={{ 
          position: "absolute", 
          top: "-5px",  
          left: "-5px", 
          width: "200px",
          height: "100px"
        }}>
          <TopHat />
        </div>
        
        <div style={{ 
          position: "absolute", 
          top: "60px", 
          left: "58px",
          width: "100px",
          height: "50px"
        }}>
          <Mustache />
        </div>
      </div>
    </div>
  );
}