import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfile } from "../../hooks/useProfile";
import { BACKEND_URL } from "../../lib/api";
import { AvatarDisplay } from "../../components/avatar";
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

export default function AccountPage() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useProfile();

  const [username, setUsername] = useState('');
  const [selectedIndustryId, setSelectedIndustryId] = useState<number | null>(null);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('••••••••••••');

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setUsername(profile.firstName || profile.username || '');
      setSelectedIndustryId(profile.industryId || null);
      setEmail(profile.email || '');
    }
  }, [profile]);

  // Mutation to update industry
  const updateIndustryMutation = useMutation({
    mutationFn: async (industryName: string) => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/profile/onboarding`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ industry: industryName }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update industry');
      }

      return res.json();
    },
    onSuccess: async () => {
      // Invalidate and refetch profile data
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      console.error('Failed to update industry:', error);
      alert('Failed to update industry. Please try again.');
      // Revert to the original industry on error
      if (profile?.industryId) {
        setSelectedIndustryId(profile.industryId);
      }
    },
  });

  const handleIndustrySelect = (industryId: number, industryLabel: string) => {
    setSelectedIndustryId(industryId);
    setShowIndustryDropdown(false);

    // Convert label to lowercase value for backend
    const industryValue = industryLabel.toLowerCase();
    updateIndustryMutation.mutate(industryValue);
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmed) {
      console.log('Delete account requested');
      alert('Account deletion is not yet implemented.');
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="account-page">
          <div className="account-loading">Loading account information...</div>
        </div>
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
            <div className="account-dropdown-container">
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
                      onClick={() => handleIndustrySelect(industry.id, industry.label)}
                    >
                      {industry.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Languages Button */}
          <div className="account-form-group">
            <label className="account-form-label">Languages</label>
            <button
              className="account-language-button"
              onClick={() => navigate("/onboarding/language")}
            >
              <span>Manage Languages</span>
              <img src={downArrowBrown} alt="Arrow" className="account-language-arrow" />
            </button>
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
        <button className="account-save-button" disabled>
          Save
        </button>
      </div>
    </div>
  );
}
