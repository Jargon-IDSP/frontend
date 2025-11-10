export interface LessonRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  notificationId: string;
  requesterName: string;
  requesterId: string;
}