import { useNavigate } from "react-router-dom";
import { NavigationCard } from "@/components/learning/ui/Card";
import Button from "@/components/learning/ui/Button";
import folderIcon from "@/assets/icons/folderIcon.svg";

export default function Categories() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <Button onClick={() => navigate("/learning")} variant="secondary">
          Custom Learning
        </Button>
      </div>

      <h1>My Generated Lessons</h1>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          margin: "1.5rem 0",
        }}
      >
        <img src={folderIcon} alt="Add folder icon" />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          marginBottom: "2rem",
        }}
      >
        <NavigationCard
          title="Safety"
          onClick={() => navigate("/learning/custom/categories/safety")}
        />
        <NavigationCard
          title="Technical"
          onClick={() => navigate("/learning/custom/categories/technical")}
        />
        <NavigationCard
          title="Training"
          onClick={() => navigate("/learning/custom/categories/training")}
        />
        <NavigationCard
          title="Workplace"
          onClick={() => navigate("/learning/custom/categories/workplace")}
        />
        <NavigationCard
          title="Professional"
          onClick={() => navigate("/learning/custom/categories/professional")}
        />
        <NavigationCard
          title="General"
          onClick={() => navigate("/learning/custom/categories/general")}
        />
      </div>
    </div>
  );
}
