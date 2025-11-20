export interface DocumentNavProps {
  activeTab: "lesson" | "document";
  title: string;
  subtitle?: string;
  onLessonClick?: () => void;
  onDocumentClick?: () => void;
  onBackClick?: () => void;
  onSubtitleClick?: () => void;
}
