import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingForm } from '../../components/onboarding/OnboardingForm';
import type { OnboardingOption } from '../../components/onboarding/OnboardingForm';
import rockyWhiteLogo from '/rockyWhite.svg';
import '../../styles/pages/_languagePreferences.scss';

const languageOptions: OnboardingOption[] = [
  { id: 'en', label: 'English', value: 'english' },
  { id: 'fr', label: 'French (Français)', value: 'french' },
  { id: 'es', label: 'Spanish (Español)', value: 'spanish' },
  { id: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)', value: 'punjabi' },
  { id: 'zh', label: 'Chinese (中文)', value: 'chinese' },
  { id: 'ko', label: 'Korean (한국어)', value: 'korean' },
];

export default function LanguagePreferences() {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  const handleNext = () => {
    // Store the selection in sessionStorage for now
    const onboardingData = JSON.parse(sessionStorage.getItem('onboardingData') || '{}');
    onboardingData.language = selectedLanguage;
    sessionStorage.setItem('onboardingData', JSON.stringify(onboardingData));

    // Navigate to industry preferences
    navigate('/onboarding/industry');
  };

  const handleSkip = () => {
    // Set default to english and navigate
    const onboardingData = JSON.parse(sessionStorage.getItem('onboardingData') || '{}');
    onboardingData.language = 'english';
    sessionStorage.setItem('onboardingData', JSON.stringify(onboardingData));
    navigate('/onboarding/industry');
  };

  return (
    <div className="container language-preferences">
      <div className="language-preferences__header">
        <img src={rockyWhiteLogo} alt="Rocky Logo" className="language-preferences__logo" />
      </div>

      <div className="language-preferences__content">
        <OnboardingForm
          title="What language are you learning?"
          subtitle="Choose your primary language of study"
          options={languageOptions}
          selectedValue={selectedLanguage}
          onSelect={setSelectedLanguage}
          onNext={handleNext}
          onSkip={handleSkip}
          showSkip={true}
          primaryColor="#fe4d13"
          secondaryColor="#652a15"
        />
      </div>
    </div>
  );
}
