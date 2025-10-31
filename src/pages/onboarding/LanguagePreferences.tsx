import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { OnboardingForm } from '../../components/onboarding/OnboardingForm';
import type { OnboardingOption } from '../../components/onboarding/OnboardingForm';
import { useProfile } from '../../hooks/useProfile';
import { BACKEND_URL } from '../../lib/api';
import rockyWhiteLogo from '/rockyWhite.svg';
import '../../styles/pages/_languagePreferences.scss';

const languageOptions: OnboardingOption[] = [
  { id: 'fr', label: 'French (Français)', value: 'french' },
  { id: 'es', label: 'Spanish (Español)', value: 'spanish' },
  { id: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)', value: 'punjabi' },
  { id: 'zh', label: 'Chinese (中文)', value: 'chinese' },
  { id: 'ko', label: 'Korean (한국어)', value: 'korean' },
];

export default function LanguagePreferences() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  // Determine if user is updating from profile or doing initial onboarding
  const isUpdating = profile?.onboardingCompleted;

  // Set initial value if user already has a language
  useEffect(() => {
    if (profile?.language && profile.language !== 'english') {
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

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      // If updating from profile, go back to profile
      if (isUpdating) {
        navigate('/profile');
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

  const handleNext = () => {
    if (isUpdating) {
      // If updating from profile, save directly to backend
      updateLanguageMutation.mutate(selectedLanguage);
    } else {
      // If in onboarding flow, store in sessionStorage and continue
      const onboardingData = JSON.parse(sessionStorage.getItem('onboardingData') || '{}');
      onboardingData.language = selectedLanguage;
      sessionStorage.setItem('onboardingData', JSON.stringify(onboardingData));
      navigate('/onboarding/industry');
    }
  };

  const handleSkip = () => {
    if (isUpdating) {
      // If updating from profile, just go back
      navigate('/profile');
    } else {
      // If in onboarding flow, set default and continue
      const onboardingData = JSON.parse(sessionStorage.getItem('onboardingData') || '{}');
      onboardingData.language = 'english';
      sessionStorage.setItem('onboardingData', JSON.stringify(onboardingData));
      navigate('/onboarding/industry');
    }
  };

  return (
    <div className="container language-preferences">
      <div className="language-preferences__header">
        <img src={rockyWhiteLogo} alt="Rocky Logo" className="language-preferences__logo" />
      </div>

      <div className="language-preferences__content">
        <OnboardingForm
          title="What language do you speak?"
          subtitle="Choose your native language"
          options={languageOptions}
          selectedValue={selectedLanguage}
          onSelect={setSelectedLanguage}
          onNext={handleNext}
          onSkip={handleSkip}
          showSkip={!isUpdating}
          nextButtonText={isUpdating ? 'Done' : undefined}
        />

        {updateLanguageMutation.isPending && (
          <div className="language-preferences__loading">
            Updating your language preference...
          </div>
        )}

        {updateLanguageMutation.isError && (
          <div className="language-preferences__error">
            {(updateLanguageMutation.error as Error).message}
          </div>
        )}
      </div>
    </div>
  );
}
