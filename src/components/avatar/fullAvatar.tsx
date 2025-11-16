import HappyRocky from "./rocky/HappyRocky";
import TopHat from "./props/TopHat";
import Mustache from "./props/Mustache";

export default function FullAvatar() {
  return (
    <div className="avatarContainer">
      <div className="bodyAvatar">
        <HappyRocky />
      </div>

      <div className="hatAvatar">
        <TopHat />
      </div>

      <div className="facialHairAvatar">
        <Mustache />
      </div>
    </div>
  );
}   