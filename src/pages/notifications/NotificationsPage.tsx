import { useNavigate } from "react-router-dom";
import { NotificationsList } from "../../components/NotificationsList";
import "../../styles/pages/_notifications.scss";

export default function NotificationsPage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="notifications-page">
        <div className="notifications-page__header">
          <button
            className="notifications-page__back"
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            ←
          </button>
          <h1 className="notifications-page__title">Notifications</h1>
        </div>

        <div className="notifications-page__content">
          <NotificationsList />
        </div>
      </div>
    </div>
  );
}
