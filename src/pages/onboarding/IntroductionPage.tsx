import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BACKEND_URL } from '../../lib/api';
import '../../styles/pages/_introductionPage.scss';

// Media items: GIFs (auto-loop) and local video files
// For files directly in public folder: use path like '/source.gif' (no subfolder needed)
// For files in public/introduction/: use path like '/introduction/intro1.gif'
// For files in src/assets: import them and use the imported variable
const MEDIA_ITEMS = [
  { id: 1, src: '/source.gif', type: 'gif' }, // GIF - auto loops (file is in public folder)
  { id: 2, src: '/source.gif', type: 'gif' },
  { id: 3, src: '/source.gif', type: 'gif' },
  // Add more items as needed
];

export default function IntroductionPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Mark introduction as viewed in database when component mounts
  const markIntroductionViewedMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/profile/introduction-viewed`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to mark introduction as viewed');
      }

      return res.json();
    },
    onSuccess: async () => {
      // Invalidate and wait for profile to refetch before navigating
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      await queryClient.refetchQueries({ queryKey: ['profile'] });
    },
  });

  useEffect(() => {
    if (user?.id) {
      markIntroductionViewedMutation.mutate();
    }
  }, [user?.id]);

  // Pause videos when switching away from them
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video && index !== currentMediaIndex) {
        video.pause();
      }
    });
  }, [currentMediaIndex]);

  const handleContinue = async () => {
    if (!markIntroductionViewedMutation.isSuccess && user?.id) {
      try {
        await markIntroductionViewedMutation.mutateAsync();
      } catch (error) {
        console.error('Failed to mark introduction as viewed:', error);
        // Still navigate even if marking fails
      }
    }
    
    // Ensure profile is up to date before navigating
    await queryClient.refetchQueries({ queryKey: ['profile'] });
    navigate('/onboarding/language');
  };

  const goToMedia = (index: number) => {
    if (index >= 0 && index < MEDIA_ITEMS.length) {
      setCurrentMediaIndex(index);
    }
  };

  const handleNext = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % MEDIA_ITEMS.length);
  };

  const handlePrevious = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + MEDIA_ITEMS.length) % MEDIA_ITEMS.length);
  };

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swipe left - next video
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swipe right - previous video
      handlePrevious();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="container introduction-page">
      <h1 className="introduction-page__title">Jargon</h1>
      
      <div 
        className="introduction-page__card"
        ref={carouselRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="introduction-page__media-container"
          style={{ transform: `translateX(-${currentMediaIndex * 100}%)` }}
        >
          {MEDIA_ITEMS.map((item, index) => (
            <div key={item.id} className="introduction-page__media-wrapper">
              {item.src ? (
                item.type === 'gif' ? (
                  <img
                    src={item.src}
                    alt={`Introduction ${index + 1}`}
                    className="introduction-page__media"
                  />
                ) : (
                  <video
                    ref={(el) => {
                      videoRefs.current[index] = el;
                    }}
                    src={item.src}
                    controls
                    className="introduction-page__media"
                    playsInline
                  />
                )
              ) : (
                <div className="introduction-page__media-placeholder">
                  Media {index + 1}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Dots navigation */}
        <div className="introduction-page__dots">
          {MEDIA_ITEMS.map((_, index) => (
            <button
              key={index}
              className={`introduction-page__dot ${
                index === currentMediaIndex ? 'introduction-page__dot--active' : ''
              }`}
              onClick={() => goToMedia(index)}
              aria-label={`Go to media ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="introduction-page__actions">
        <button
          className="introduction-page__button introduction-page__button--primary"
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

