import React from "react";
import type { DocumentNavProps } from "../types/documentNav";
import translateFileIcon from "../assets/icons/translateFileIcon.svg";
import fileIconB from "../assets/icons/fileIconB.svg";
import lessonIcon from "../assets/icons/lessonIcon.svg";
import lessonIconB from "../assets/icons/lessonIconB.svg";
import goBackIcon from "../assets/icons/goBackIcon.svg";
import optionsIcon from "../assets/icons/optionsIcon.svg";

const DocumentNav: React.FC<DocumentNavProps> = ({
  activeTab,
  title,
  onLessonClick,
  onDocumentClick,
  onBackClick,
  onSubtitleClick,
}) => {
  const isLessonDisabled = !onLessonClick;

  return (
    <>
      <div className="top">
        <img
          src={goBackIcon}
          alt="back button"
          onClick={onBackClick}
          style={{ cursor: onBackClick ? "pointer" : "default" }}
        />
        <h1>{title}</h1>
        <button
          // className="subtitle-button"
          className="button-options"
          onClick={onSubtitleClick}
          disabled={!onSubtitleClick}
        >
          <img src={optionsIcon} alt="options" />
        </button>
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
