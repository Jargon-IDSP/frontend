import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationCard } from "../../components/learning/ui/Card";
import HappyRocky from "../../components/avatar/HappyRocky";
import { useProfile } from "../../hooks/useProfile";
import { getIndustryName } from "../../hooks/useUserPreferences";
import DocumentDrawer from "../drawers/DocumentDrawer";

export default function LearnJargon() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Get the user's industry name dynamically
  const industryName = getIndustryName(profile?.industryId);

 

  return (
    <div className="container">
      <div className="learningOverview">
        <div className="learningOverviewHeader">
          <div className="headerContent">
            <h1>
              <span className="badge">{industryName}</span>
              My Courses
            </h1>
            <p>
              Let’s learn and get some badges today! Who knows maybe we’ll even get on the leaderboard this week...
            </p>
          </div>
          <HappyRocky />
        </div>

        <DocumentDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />

         <NavigationCard
          title=""
          description=""
          cardType="industry"
          buttonText={` ${industryName} Courses`}
          onClick={() => navigate("/learning/existing/levels")}
        />

        <NavigationCard
          title=""
          description=""
          cardType="generated"
          buttonText="View Lessons"
          onClick={() => navigate("/learning/custom/categories")}
        />

        <NavigationCard
          title=""
          description=""
          cardType="friends"
          buttonText="Friend's Lessons"
          onClick={() => navigate("/learning/shared")}
        />
      </div>
    </div>
  );
}
