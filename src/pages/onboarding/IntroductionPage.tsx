import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BACKEND_URL } from '../../lib/api';
import '../../styles/pages/_introductionPage.scss';
import JargonWordmark from '/Jargon_Wordmark.png';

// Media items: GIFs (auto-loop) and local video files
// For files directly in public folder: use path like '/source.gif' (no subfolder needed)
// For files in public/introduction/: use path like '/introduction/intro1.gif'
// For files in src/assets: import them and use the imported variable
const MEDIA_ITEMS = [
  { id: 1, src: '/ready-to-go-course.gif', type: 'gif' }, // GIF - auto loops (file is in public folder)
  { id: 2, src: '/upload.gif', type: 'gif' },
  { id: 3, src: '/community.gif', type: 'gif' },
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
  const wordmarkRef = useRef<HTMLImageElement>(null);
  const [wordmarkWidth, setWordmarkWidth] = useState<number | null>(null);

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

  // Match wordmark width to media width
  useEffect(() => {
    const updateWordmarkWidth = () => {
      // Get all media wrappers and find the one that's currently visible
      const mediaWrappers = carouselRef.current?.querySelectorAll('.introduction-page__media-wrapper');
      if (mediaWrappers && mediaWrappers[currentMediaIndex]) {
        const mediaElement = mediaWrappers[currentMediaIndex].querySelector('.introduction-page__media') as HTMLElement;
        
        if (mediaElement && wordmarkRef.current) {
          // Wait a bit for the media to render
          setTimeout(() => {
            const mediaWidth = mediaElement.offsetWidth;
            if (mediaWidth > 0) {
              setWordmarkWidth(mediaWidth);
            }
          }, 100);
        }
      }
    };

    // Update on mount and when media changes
    updateWordmarkWidth();
    
    // Also update on window resize
    window.addEventListener('resize', updateWordmarkWidth);
    
    return () => {
      window.removeEventListener('resize', updateWordmarkWidth);
    };
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
      <div className="introduction-page__title">
        <img 
          ref={wordmarkRef}
          src={JargonWordmark} 
          alt="Jargon Wordmark" 
          className="introduction-page__wordmark"
          style={wordmarkWidth ? { width: `${wordmarkWidth}px` } : undefined}
        />
      </div>
      
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

      <p className="introduction-page__description">
        Learn faster with courses, AI, and community.
      </p>

      <div className="introduction-page__actions">
        <button
          className="introduction-page__button introduction-page__button--primary"
          onClick={handleContinue}
        >
          Skip
        </button>
      </div>
    </div>
  );
}

