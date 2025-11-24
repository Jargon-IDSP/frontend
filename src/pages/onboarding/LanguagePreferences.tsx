import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { useProfile } from '../../hooks/useProfile';
import { BACKEND_URL } from '../../lib/api';
import goBackIcon from '../../assets/icons/goBackIcon.svg';
import '../../styles/pages/_languagePreferences.scss';

const languageOptions = [
  { id: 'en', label: 'English', value: 'english' },
  { id: 'zh', label: 'Chinese (中文)', value: 'chinese' },
  { id: 'fr', label: 'French (Français)', value: 'french' },
  { id: 'ko', label: 'Korean (한국어)', value: 'korean' },
  { id: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)', value: 'punjabi' },
  { id: 'es', label: 'Spanish (Español)', value: 'spanish' },
];

export default function LanguagePreferences() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useProfile();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('english');

  const isUpdating = profile?.onboardingCompleted;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!isLoading && profile && !profile.introductionViewed && !isUpdating) {
      navigate('/onboarding/introduction', { replace: true });
    }
  }, [profile, isLoading, isUpdating, navigate]);

  // Set initial value if user already has a language
  useEffect(() => {
    if (profile?.language) {
      setSelectedLanguage(profile.language);
    }
  }, [profile]);

  const updateLanguageMutation = useMutation({
    mutationFn: async (language: string) => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/profile/onboarding`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update language');
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      // If updating from settings, go back to settings
      if (isUpdating) {
        navigate('/settings');
      } else {
        // If in onboarding flow, continue to industry
        navigate('/onboarding/industry');
      }
    },
    onError: (error) => {
      console.error('Failed to update language:', error);
      alert('Failed to update language. Please try again.');
    },
  });

  const handleSave = () => {
    if (isUpdating) {
      // If updating from settings, save directly to backend
      updateLanguageMutation.mutate(selectedLanguage);
    } else {
      // If in onboarding flow, store in sessionStorage and continue
      const onboardingData = JSON.parse(sessionStorage.getItem('onboardingData') || '{}');
      onboardingData.language = selectedLanguage;
      sessionStorage.setItem('onboardingData', JSON.stringify(onboardingData));
      navigate('/onboarding/industry');
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="language-preferences">
          <div className="language-preferences__header">
            <button
              className="language-preferences__back-button"
              onClick={() => navigate(-1)}
              aria-label="Go Back"
            >
              <img src={goBackIcon} alt="Go Back" />
            </button>
            <h1 className="language-preferences__title">Settings</h1>
            <div className="language-preferences__header-spacer" />
          </div>
          <div className="language-preferences__loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="language-preferences">
        {/* Header */}
        <div className="language-preferences__header">
          <button
            className="language-preferences__back-button"
            onClick={() => navigate(-1)}
            aria-label="Go Back"
          >
            <img src={goBackIcon} alt="Go Back" />
          </button>
          <h1 className="language-preferences__title">Settings</h1>
          <div className="language-preferences__header-spacer" />
        </div>

        {/* Language Section */}
        <div className="language-preferences__section">
          <h2 className="language-preferences__section-title">System Languages</h2>

          <div className="language-preferences__options">
            {languageOptions.map((option) => (
              <button
                key={option.id}
                className={`language-preferences__option ${
                  selectedLanguage === option.value ? 'language-preferences__option--selected' : ''
                }`}
                onClick={() => setSelectedLanguage(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          className="language-preferences__save-button"
          onClick={handleSave}
          disabled={updateLanguageMutation.isPending}
        >
          {updateLanguageMutation.isPending ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
