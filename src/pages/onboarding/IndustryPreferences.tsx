import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { OnboardingForm } from '../../components/onboarding/OnboardingForm';
import type { OnboardingOption } from '../../types/onboardingForm';
import { useProfile } from '../../hooks/useProfile';
import { BACKEND_URL } from '../../lib/api';
import OnboardingHeader from '../../components/onboarding/OnboardingHeader';
import LoadingBar from '../../components/LoadingBar';
import '../../styles/pages/_industryPreferences.scss';

const industryOptions: OnboardingOption[] = [
  { id: 'general', label: 'General', value: 'general' },
  { id: 'electrician', label: 'Electrician', value: 'electrician' },
  { id: 'plumber', label: 'Plumber', value: 'plumber' },
  { id: 'carpenter', label: 'Carpenter', value: 'carpenter' },
  { id: 'mechanic', label: 'Mechanic', value: 'mechanic' },
  { id: 'welder', label: 'Welder', value: 'welder' },
];

const industryIdToName: { [key: number]: string } = {
  0: 'general',
  1: 'electrician',
  2: 'plumber',
  3: 'carpenter',
  4: 'mechanic',
  5: 'welder',
};

interface OnboardingData {
  language?: string;
  industry?: string;
}

export default function IndustryPreferences() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useProfile();
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');

  // Determine if user is updating from profile or doing initial onboarding
  const isUpdating = profile?.onboardingCompleted;

  // Redirect to introduction if not viewed (only check after profile has loaded)
  useEffect(() => {
    if (!isLoading && profile && !profile.introductionViewed && !isUpdating) {
      navigate('/onboarding/introduction', { replace: true });
    }
  }, [profile, isLoading, isUpdating, navigate]);

  // Set initial value if user already has an industry
  useEffect(() => {
    if (profile?.industryId) {
      const industryName = industryIdToName[profile.industryId];
      if (industryName) {
        setSelectedIndustry(industryName);
      }
    }
  }, [profile]);

  const submitOnboardingMutation = useMutation({
    mutationFn: async (data: OnboardingData) => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/profile/onboarding`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save preferences');
      }

      return res.json();
    },
    onSuccess: async () => {
      // Invalidate and refetch profile data
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      await queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
      // Refetch queries immediately to update all components
      await queryClient.refetchQueries({ queryKey: ['profile'] });
      await queryClient.refetchQueries({ queryKey: ['userPreferences'] });
      // Clear session storage
      sessionStorage.removeItem('onboardingData');
      // Navigate based on context
      if (isUpdating) {
        navigate('/profile');
      } else {
        // Mark onboarding as just completed to prevent redirect loop
        sessionStorage.setItem('onboardingJustCompleted', 'true');
        navigate('/onboarding/avatar');
      }
    },
    onError: (error) => {
      console.error('Failed to save onboarding preferences:', error);
      alert('Failed to save your preferences. Please try again.');
    },
  });

  const handleFinish = () => {
    if (isUpdating) {
      // If updating from profile, only update industry
      submitOnboardingMutation.mutate({ industry: selectedIndustry });
    } else {
      // If in onboarding flow, get stored language and submit both
      const onboardingData: OnboardingData = JSON.parse(
        sessionStorage.getItem('onboardingData') || '{}'
      );
      onboardingData.industry = selectedIndustry;
      submitOnboardingMutation.mutate(onboardingData);
    }
  };

  const handleSkip = () => {
    if (isUpdating) {
      // If updating from profile, just go back
      navigate('/profile');
    } else {
      // If in onboarding flow, skip without submitting - just clear and go home
      sessionStorage.removeItem('onboardingData');
      sessionStorage.setItem('onboardingSkippedThisSession', 'true');
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <>
        <LoadingBar isLoading={true} hasData={false} text="Loading" />
      </>
    );
  }

  return (
    <div className="container">
      <div className="industry-preferences">
        <OnboardingHeader
        title="What trade are you in?"
        subtitle="Choose a trade to start learning with!"
        onBack={() => navigate('/onboarding/language')}
        progressPercentage={50}
        showProgress={true}
      />

      <div className="industry-preferences__content">
        <OnboardingForm
          title="What's your industry or field?"
          subtitle="This helps us personalize your learning experience"
          options={industryOptions}
          selectedValue={selectedIndustry}
          onSelect={setSelectedIndustry}
          onNext={handleFinish}
          onSkip={handleSkip}
          isLastStep={false}
          showSkip={!isUpdating}
          nextButtonText={isUpdating ? 'Next' : undefined}
        />

        {submitOnboardingMutation.isPending && (
          <div className="industry-preferences__loading">
            Saving your preferences...
          </div>
        )}

        {submitOnboardingMutation.isError && (
          <div className="industry-preferences__error">
            {(submitOnboardingMutation.error as Error).message}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
