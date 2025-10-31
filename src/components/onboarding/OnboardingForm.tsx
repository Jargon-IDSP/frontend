import React from 'react';
import '../../styles/components/_onboardingForm.scss';

export interface OnboardingOption {
  id: string;
  label: string;
  value: string;
}

export interface OnboardingFormProps {
  title: string;
  subtitle?: string;
  options: OnboardingOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  onNext: () => void;
  onSkip?: () => void;
  isLastStep?: boolean;
  showSkip?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
}

export const OnboardingForm: React.FC<OnboardingFormProps> = ({
  title,
  subtitle,
  options,
  selectedValue,
  onSelect,
  onNext,
  onSkip,
  isLastStep = false,
  showSkip = true,
  primaryColor = '#fe4d13',
  secondaryColor = '#652a15',
}) => {
  return (
    <div className="onboarding-form">
      <div className="onboarding-form__header">
        <h1 className="onboarding-form__title">{title}</h1>
        {subtitle && <p className="onboarding-form__subtitle">{subtitle}</p>}
      </div>

      <div className="onboarding-form__options">
        {options.map((option) => (
          <button
            key={option.id}
            className={`onboarding-form__option ${
              selectedValue === option.value ? 'onboarding-form__option--selected' : ''
            }`}
            onClick={() => onSelect(option.value)}
            style={{
              backgroundColor: selectedValue === option.value ? primaryColor : 'transparent',
              color: selectedValue === option.value ? '#fff' : secondaryColor,
              borderColor: selectedValue === option.value ? primaryColor : secondaryColor,
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="onboarding-form__actions">
        <button
          className="onboarding-form__button onboarding-form__button--primary"
          onClick={onNext}
          disabled={!selectedValue}
          style={{
            backgroundColor: selectedValue ? primaryColor : '#ccc',
            borderColor: selectedValue ? primaryColor : '#ccc',
          }}
        >
          {isLastStep ? 'Finish' : 'Next'}
        </button>

        {showSkip && onSkip && (
          <button
            className="onboarding-form__button onboarding-form__button--skip"
            onClick={onSkip}
            style={{
              color: secondaryColor,
            }}
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
};
