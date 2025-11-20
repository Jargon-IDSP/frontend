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
  nextButtonText?: string;
}
