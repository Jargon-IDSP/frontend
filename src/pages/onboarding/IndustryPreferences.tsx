import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { OnboardingForm } from '../../components/onboarding/OnboardingForm';
import type { OnboardingOption } from '../../components/onboarding/OnboardingForm';
import { BACKEND_URL } from '../../lib/api';
import rockyWhiteLogo from '/rockyWhite.svg';
import '../../styles/pages/_industryPreferences.scss';

const industryOptions: OnboardingOption[] = [
  { id: 'general', label: 'General', value: 'general' },
  { id: 'electrician', label: 'Electrician', value: 'electrician' },
  { id: 'plumber', label: 'Plumber', value: 'plumber' },
  { id: 'carpenter', label: 'Carpenter', value: 'carpenter' },
  { id: 'mechanic', label: 'Mechanic', value: 'mechanic' },
  { id: 'welder', label: 'Welder', value: 'welder' },
];

interface OnboardingData {
  language?: string;
  industry?: string;
}

export default function IndustryPreferences() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');

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
    onSuccess: () => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      // Clear session storage
      sessionStorage.removeItem('onboardingData');
      // Navigate to home
      navigate('/');
    },
    onError: (error) => {
      console.error('Failed to save onboarding preferences:', error);
      alert('Failed to save your preferences. Please try again.');
    },
  });

  const handleFinish = () => {
    // Get stored language preference
    const onboardingData: OnboardingData = JSON.parse(
      sessionStorage.getItem('onboardingData') || '{}'
    );
    onboardingData.industry = selectedIndustry;

    // Submit to backend
    submitOnboardingMutation.mutate(onboardingData);
  };

  const handleSkip = () => {
    // Set default to general
    const onboardingData: OnboardingData = JSON.parse(
      sessionStorage.getItem('onboardingData') || '{}'
    );
    onboardingData.industry = 'general';

    // Submit to backend
    submitOnboardingMutation.mutate(onboardingData);
  };

  return (
    <div className="container industry-preferences">
      <div className="industry-preferences__header">
        <img src={rockyWhiteLogo} alt="Rocky Logo" className="industry-preferences__logo" />
      </div>

      <div className="industry-preferences__content">
        <OnboardingForm
          title="What's your industry or field?"
          subtitle="This helps us personalize your learning experience"
          options={industryOptions}
          selectedValue={selectedIndustry}
          onSelect={setSelectedIndustry}
          onNext={handleFinish}
          onSkip={handleSkip}
          isLastStep={true}
          showSkip={true}
          primaryColor="#ffba0a"
          secondaryColor="#652a15"
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
  );
}
