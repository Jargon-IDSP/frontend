import React from 'react';
import '../../styles/components/_onboardingForm.scss';
import type { OnboardingFormProps } from '../../types/onboardingForm';

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
  nextButtonText,
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
        >
          {nextButtonText || (isLastStep ? 'Finish' : 'Next')}
        </button>

        {showSkip && onSkip && (
          <button
            className="onboarding-form__button onboarding-form__button--skip"
            onClick={onSkip}
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
};
