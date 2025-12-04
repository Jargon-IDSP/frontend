import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSmartNavigation } from "../hooks/useSmartNavigation";
import type { DocumentNavProps } from "../types/documentNav";
import { truncateFilename } from "../utils/stringUtils";
import translateFileIcon from "../assets/icons/translateFileIcon.svg";
import fileIconB from "../assets/icons/fileIconB.svg";
import lessonIcon from "../assets/icons/lessonIcon.svg";
import lessonIconB from "../assets/icons/lessonIconB.svg";
import goBackIcon from "../assets/icons/goBackIcon.svg";
import editIcon from "../assets/icons/editIcon.svg";

const DocumentNav: React.FC<DocumentNavProps> = ({
  activeTab,
  title,
  onLessonClick,
  onDocumentClick,
  onBackClick,
  onSubtitleClick,
  lessonId,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { navigateWithOrigin } = useSmartNavigation();
  const isLessonDisabled = !onLessonClick;

  const handleSubtitleClick = () => {
    if (lessonId) {
      navigateWithOrigin(`/profile/lessons/${lessonId}/edit`, {
        state: {
          lessonName: title,
        },
        replace: true,
      });
    } else if (onSubtitleClick) {
      onSubtitleClick();
    }
  };

  return (
    <>
      <div className="top">
        <img
          src={goBackIcon}
          alt="back button"
          onClick={onBackClick}
          style={{ cursor: onBackClick ? "pointer" : "default" }}
        />
        <h1 title={title}>{truncateFilename(title, 25)}</h1>
        {(onSubtitleClick || lessonId) && (
          <button
            // className="subtitle-button"
            className="button-options"
            onClick={handleSubtitleClick}
          >
            <img src={editIcon} alt="options" />
          </button>
        )}
      </div>

      <div className="switch-view">
        <button
          className={`demoLesson ${activeTab === "lesson" ? "active" : ""} ${
            isLessonDisabled ? "disabled" : ""
          }`}
          onClick={onLessonClick}
          disabled={isLessonDisabled}
          title={
            isLessonDisabled
              ? "Processing... please wait"
              : "View flashcards and quizzes"
          }
        >
          <img
            src={activeTab === "lesson" ? lessonIcon : lessonIconB}
            alt="lesson icon"
          />
          Lesson
        </button>

        <button
          className={`demoDocs ${activeTab === "document" ? "active" : ""}`}
          onClick={onDocumentClick}
        >
          <img
            src={activeTab === "document" ? fileIconB : translateFileIcon}
            alt="document icon"
          />
          Document
        </button>
      </div>
    </>
  );
};

export default DocumentNav;
