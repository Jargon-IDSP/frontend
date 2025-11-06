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

  const handleUpload = () => {
    setIsDrawerOpen(true);
  };

  return (
    <div className="container">
      <div className="learningOverview">
        <div className="learningOverviewHeader">
          <div className="headerContent">
            <h1>
              Courses <span className="badge">{industryName}</span>
            </h1>
            <p>
              View your all of your {industryName.toLowerCase()} courses below
            </p>
          </div>
          <HappyRocky />
        </div>

        <DocumentDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />

        <h2>Start Learning</h2>

        <NavigationCard
          title="Generate"
          description="A1-Level 3: Pipe Joining"
          buttonText="Continue Learning"
          onClick={() => navigate("/learning/existing/levels")}
        />

        <NavigationCard
          title="Generate"
          description="Generate your own lesson!"
          buttonText="Generate"
          onClick={handleUpload}
        />

        <NavigationCard
          title="Explore"
          description="Explore generated lessons from your friends"
          buttonText="Explore"
          onClick={() => navigate("/learning/shared")}
        />
        <h2> View Course </h2>
        <NavigationCard
          title="View Course"
          description="View our prebuilt Red Seal courses"
          buttonText="View Course"
          onClick={() => navigate("/learning/existing/levels")}
        />
        <h2> View My Generated Lessons</h2>

        <NavigationCard
          title="View My Generated Lessons"
          description="Review all your generated lessons"
          buttonText="View Lessons"
          onClick={() => navigate("/learning/custom/categories")}
        />

        <h2> View All Generated Flashcards</h2>
        <NavigationCard
          title="View All Generated Flashcards"
          description="Review all your generated flashcards"
          buttonText="View Flashcards"
          onClick={() => navigate("/learning/custom/terms")}
        />
      </div>
    </div>
  );
}
