export type NotificationType = "DOCUMENT_READY" | "FRIEND_REQUEST" | "LESSON_APPROVED" | "QUIZ_SHARED" | "ERROR" | "SUCCESS";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  documentId?: string;
  followId?: string;
  lessonRequestId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}
