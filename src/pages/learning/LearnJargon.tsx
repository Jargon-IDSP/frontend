// import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { useDocuments } from "../../hooks/useDocuments";
import { NavigationCard } from "../../components/learning/ui/Card";
// import Button from "../../components/learning/ui/Button";
import HappyRocky from "../../components/avatar/HappyRocky";
import continueLearning from "../../assets/icons/continueLearning.png";

export default function LearnJargon() {
  const navigate = useNavigate();
  // const [loadingProgress, setLoadingProgress] = useState(0);

  // const { data: documents = [], isLoading: loading } = useDocuments();

  // useEffect(() => {
  //   if (loading) {
  //     setLoadingProgress(0);
  //     const interval = setInterval(() => {
  //       setLoadingProgress((prev) => {
  //         if (prev >= 90) return prev;
  //         return prev + 15;
  //       });
  //     }, 150);

  //     return () => clearInterval(interval);
  //   } else {
  //     setLoadingProgress(100);
  //     const timeout = setTimeout(() => setLoadingProgress(0), 500);
  //     return () => clearTimeout(timeout);
  //   }
  // }, [loading]);

  // if (loading) {
  //   return (
  //     <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
  //       <h1>Custom Learning</h1>
  //       <div style={{ marginTop: "2rem" }}>
  //         <div
  //           style={{
  //             width: "100%",
  //             height: "8px",
  //             backgroundColor: "#e5e7eb",
  //             borderRadius: "9999px",
  //             overflow: "hidden",
  //           }}
  //         >
  //           <div
  //             style={{
  //               height: "100%",
  //               width: `${loadingProgress}%`,
  //               backgroundColor: "#fe4d13",
  //               transition: "width 0.3s ease-in-out",
  //               borderRadius: "9999px",
  //             }}
  //           />
  //         </div>
  //         <div
  //           style={{
  //             marginTop: "0.5rem",
  //             textAlign: "center",
  //             fontSize: "0.875rem",
  //             color: "#666",
  //           }}
  //         >
  //           Loading documents... {loadingProgress}%
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="container">
        {/* <Button
          onClick={() => navigate("/learning/existing/levels")}
          variant="secondary"
        >
          Study Existing Content
        </Button> */}
        <div className="learningOverviewheader">

      <h1>Courses</h1>
      <p>Explore your courses below</p>
      <HappyRocky />
      </div>

      <h2>Start Learning</h2>
      {/* {documents.length === 0 ? (
        <div
          style={{
            padding: "2rem",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <p style={{ marginBottom: "1rem" }}>No documents yet.</p>
          <div
            style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}
          >
            <Button
              onClick={() => navigate("/documents/user")}
              variant="primary"
            >
              Go to My Documents
            </Button>
            <Button
              onClick={() => navigate("/learning/shared")}
              variant="secondary"
            >
              Shared with Me
            </Button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            marginBottom: "2rem",
          }}
        >
          {documents.map((doc) => (
            <NavigationCard
              key={doc.id}
              icon="📄"
              title={doc.filename}
              description={doc.ocrProcessed ? "Ready to study" : "Processing..."}
              onClick={() => navigate(`/learning/documents/${doc.id}/study`)}
              disabled={!doc.ocrProcessed}
            />
          ))}
        </div>
      )} */}

<img src={continueLearning} alt="Continue Learning" />

      <NavigationCard
        title="Generate"
        description="Generate your own lesson!"
        onClick={() => navigate("/documents")}
        // onClick={() => navigate("/learning/custom/categories")}
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
