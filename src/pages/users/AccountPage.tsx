import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfile } from "../../hooks/useProfile";
import { BACKEND_URL } from "../../lib/api";
import { AvatarDisplay } from "../../components/avatar";
import LoadingBar from "../../components/LoadingBar";
import goBackIcon from '../../assets/icons/goBackIcon.svg';
import rockyWhiteLogo from '../../../public/rockyWhite.svg';
import downArrowBrown from '../../assets/icons/downArrowBrown.svg';
import '../../styles/pages/_account.scss';

const industryOptions = [
  { id: 0, label: 'General', value: 'general' },
  { id: 1, label: 'Electrician', value: 'electrician' },
  { id: 2, label: 'Plumber', value: 'plumber' },
  { id: 3, label: 'Carpenter', value: 'carpenter' },
  { id: 4, label: 'Mechanic', value: 'mechanic' },
  { id: 5, label: 'Welder', value: 'welder' },
];

const industryIdToName: { [key: number]: string } = {
  0: 'General',
  1: 'Electrician',
  2: 'Plumber',
  3: 'Carpenter',
  4: 'Mechanic',
  5: 'Welder',
};

const languageOptions = [
  { id: 'en', label: 'English', value: 'english' },
  { id: 'zh', label: 'Chinese (中文)', value: 'chinese' },
  { id: 'fr', label: 'French (Français)', value: 'french' },
  { id: 'ko', label: 'Korean (한국어)', value: 'korean' },
  { id: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)', value: 'punjabi' },
  { id: 'es', label: 'Spanish (Español)', value: 'spanish' },
];

const languageValueToLabel: { [key: string]: string } = {
  'english': 'English',
  'chinese': 'Chinese (中文)',
  'french': 'French (Français)',
  'korean': 'Korean (한국어)',
  'punjabi': 'Punjabi (ਪੰਜਾਬੀ)',
  'spanish': 'Spanish (Español)',
};

export default function AccountPage() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useProfile();

  const [username, setUsername] = useState('');
  const [selectedIndustryId, setSelectedIndustryId] = useState<number | null>(null);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [email, setEmail] = useState('');
  const [password] = useState('••••••••••••');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const industryDropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile) {
      setUsername(profile.firstName || profile.username || '');
      setSelectedIndustryId(profile.industryId || null);
      setSelectedLanguage(profile.language || null);
      setEmail(profile.email || '');
    }
  }, [profile]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (industryDropdownRef.current && !industryDropdownRef.current.contains(event.target as Node)) {
        setShowIndustryDropdown(false);
      }
    };

    if (showIndustryDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showIndustryDropdown]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };

    if (showLanguageDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showLanguageDropdown]);

  const saveChangesMutation = useMutation({
    mutationFn: async (updates: { industry?: string; language?: string }) => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/profile/onboarding`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      return res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      await queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
      setHasUnsavedChanges(false);
      setIsSaving(false);
      navigate('/profile');
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
      setIsSaving(false);

      if (profile?.industryId !== undefined) {
        setSelectedIndustryId(profile.industryId);
      }
      if (profile?.language) {
        setSelectedLanguage(profile.language);
      }
    },
  });

  const handleIndustrySelect = (industryId: number) => {
    setSelectedIndustryId(industryId);
    setShowIndustryDropdown(false);

    if (profile?.industryId !== industryId) {
      setHasUnsavedChanges(true);
    } else {
      const languageChanged = profile?.language !== selectedLanguage;
      setHasUnsavedChanges(languageChanged);
    }
  };

  const handleDeleteAccount = () => {
    const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmed) {
      console.log('Delete account requested');
      alert('Account deletion is not yet implemented.');
    }
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges || isSaving) return;

    setIsSaving(true);

    const updates: { industry?: string; language?: string } = {};

    if (profile?.industryId !== selectedIndustryId && selectedIndustryId !== null) {
      const industryName = industryIdToName[selectedIndustryId].toLowerCase();
      updates.industry = industryName;
    }

    if (profile?.language !== selectedLanguage && selectedLanguage !== null) {
      updates.language = selectedLanguage;
    }

    if (Object.keys(updates).length > 0) {
      saveChangesMutation.mutate(updates);
    } else {
      setIsSaving(false);
      setHasUnsavedChanges(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <LoadingBar isLoading={true} text="Loading account" />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="account-page">
        {/* Header */}
        <div className="account-header">
          <button
            className="account-back-button"
            onClick={() => navigate(-1)}
            aria-label="Go Back"
          >
            <img src={goBackIcon} alt="Go Back" />
          </button>
          <h1 className="account-title">Settings</h1>
          <div className="account-header-spacer" />
        </div>

        {/* Avatar Section */}
        <div className="account-avatar-section">
          <div className="account-avatar">
            {profile?.avatar ? (
              <AvatarDisplay
                config={profile.avatar}
                size={70}
                className="account-avatar-image"
              />
            ) : (
              <img src={rockyWhiteLogo} alt="User Avatar" className="account-avatar-placeholder" />
            )}
          </div>
          <button
            className="account-edit-avatar-button"
            onClick={() => navigate("/avatar/edit")}
          >
            Edit my avatar
          </button>
        </div>

        {/* Form Fields */}
        <div className="account-form">
          {/* User Name */}
          <div className="account-form-group">
            <label className="account-form-label">User Name</label>
            <input
              type="text"
              className="account-form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              disabled
            />
          </div>

          {/* Trade/Industry */}
          <div className="account-form-group">
            <label className="account-form-label">Trade</label>
            <div className="account-dropdown-container" ref={industryDropdownRef}>
              <button
                className="account-dropdown-trigger"
                onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
              >
                <span className={selectedIndustryId !== null ? "account-dropdown-selected" : "account-dropdown-placeholder"}>
                  {selectedIndustryId !== null ? industryIdToName[selectedIndustryId] : 'Select your trade'}
                </span>
                <img
                  src={downArrowBrown}
                  alt="Dropdown"
                  className={`account-dropdown-arrow ${showIndustryDropdown ? 'account-dropdown-arrow--open' : ''}`}
                />
              </button>

              {showIndustryDropdown && (
                <div className="account-dropdown-menu">
                  {industryOptions.map((industry) => (
                    <button
                      key={industry.id}
                      className={`account-dropdown-item ${selectedIndustryId === industry.id ? 'account-dropdown-item--selected' : ''}`}
                      onClick={() => handleIndustrySelect(industry.id)}
                    >
                      {industry.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Languages Dropdown */}
          <div className="account-form-group">
            <label className="account-form-label">Languages</label>
            <div className="account-dropdown-container" ref={languageDropdownRef}>
              <button
                className="account-dropdown-trigger"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              >
                <span className={selectedLanguage !== null ? "account-dropdown-selected" : "account-dropdown-placeholder"}>
                  {selectedLanguage !== null ? languageValueToLabel[selectedLanguage] : 'Select your language'}
                </span>
                <img
                  src={downArrowBrown}
                  alt="Dropdown"
                  className={`account-dropdown-arrow ${showLanguageDropdown ? 'account-dropdown-arrow--open' : ''}`}
                />
              </button>

              {showLanguageDropdown && (
                <div className="account-dropdown-menu">
                  {languageOptions.map((language) => (
                    <button
                      key={language.id}
                      className={`account-dropdown-item ${selectedLanguage === language.value ? 'account-dropdown-item--selected' : ''}`}
                      onClick={() => {
                        setSelectedLanguage(language.value);
                        setShowLanguageDropdown(false);

                        if (profile?.language !== language.value) {
                          setHasUnsavedChanges(true);
                        } else {
                          const industryChanged = profile?.industryId !== selectedIndustryId;
                          setHasUnsavedChanges(industryChanged);
                        }
                      }}
                    >
                      {language.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="account-form-group">
            <label className="account-form-label">Email</label>
            <input
              type="email"
              className="account-form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              disabled
            />
          </div>

          {/* Password */}
          <div className="account-form-group">
            <label className="account-form-label">Password</label>
            <input
              type="password"
              className="account-form-input"
              value={password}
              disabled
            />
          </div>
        </div>

        {/* Delete Account */}
        <div className="account-delete-section">
          <button
            className="account-delete-button"
            onClick={handleDeleteAccount}
          >
            Delete My Account
          </button>
          <p className="account-delete-warning">
            Your account can be permanently removed from the application at any time of use
          </p>
        </div>

        {/* Save Button */}
        <button
          className="account-save-button"
          onClick={handleSave}
          disabled={!hasUnsavedChanges || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
