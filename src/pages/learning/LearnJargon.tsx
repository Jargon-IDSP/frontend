import { useNavigate } from "react-router-dom";
import { NavigationCard } from "../../components/learning/ui/Card";
import HappyRocky from "../../components/avatar/HappyRocky";
import continueLearning from "../../assets/continueLearning.png";

export default function LearnJargon() {
  const navigate = useNavigate();

  return (
    <div className="container">

        <div className="learningOverviewheader">

      <h1>Courses</h1>
      <p>Explore your courses below</p>
      <HappyRocky />
      </div>

      <h2>Start Learning</h2>

<img src={continueLearning} alt="Continue Learning" />

      <NavigationCard
        title="Generate"
        description="Generate your own lesson!"
        onClick={() => navigate("/documents")}
      />

      <NavigationCard
        title="Explore"
        description="Explore generated lessons from your friends"
        onClick={() => navigate("/learning/shared")}
      />

      <NavigationCard
        title="View Course"
        description="View our prebuilt Red Seal courses"
        onClick={() => navigate("/learning/existing/levels")}
      />

      <NavigationCard
        title="View My Generated Lessons"
        description="Review all your generated lessons"
        onClick={() => navigate("/learning/custom/categories")}
      />

      <NavigationCard
        title="View All Generated Flashcards"
        description="Review all your generated flashcards"
        onClick={() => navigate("/learning/custom/terms")}
      />

    </div>
  );
}
