import { useNavigate } from "react-router-dom";
import { NotificationsList } from "../../components/NotificationsList";
import "../../styles/pages/_notifications.scss";

export default function NotificationsPage() {
    const navigate = useNavigate();

    return (
        <div className='notifications-page'>
            <div className='notifications-page__shell'>
                <div className='notifications-page__card'>
                    <div className='notifications-page__header'>
                        <button
                            className='notifications-page__back'
                            onClick={() => navigate(-1)}
                            aria-label='Go back'
                            type='button'>
                            <svg
                                viewBox='0 0 24 24'
                                fill='currentColor'
                                aria-hidden='true'>
                                <path d='M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z' />
                            </svg>
                        </button>
                        <h1 className='notifications-page__title'>
                            Notifications
                        </h1>
                    </div>

                    <div className='notifications-page__content'>
                        <NotificationsList />
                    </div>

                    <p className='notifications-page__support'>
                        Need help? <a href='/learning/ai-chat'>Call Rocky!</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
