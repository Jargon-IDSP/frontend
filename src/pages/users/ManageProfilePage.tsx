import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfile } from "../../hooks/useProfile";
import { BACKEND_URL } from "../../lib/api";
import goBackIcon from "../../assets/icons/goBackIcon.svg";

const industryOptions = [
  { id: 'electrician', label: 'Electrician', value: 'electrician' },
  { id: 'plumber', label: 'Plumber', value: 'plumber' },
  { id: 'carpenter', label: 'Carpenter', value: 'carpenter' },
  { id: 'mechanic', label: 'Mechanic', value: 'mechanic' },
  { id: 'welder', label: 'Welder', value: 'welder' },
];

const industryIdToName: { [key: number]: string } = {
  1: 'electrician',
  2: 'plumber',
  3: 'carpenter',
  4: 'mechanic',
  5: 'welder',
};


export default function ManageProfilePage() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');

  useEffect(() => {
    if (profile?.industryId) {
      const industryName = industryIdToName[profile.industryId];
      if (industryName) {
        setSelectedIndustry(industryName);
      }
    }
  }, [profile]);

  const updateIndustryMutation = useMutation({
    mutationFn: async (data: { industry?: string }) => {
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
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      await queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
      // Refetch queries immediately to update all components
      await queryClient.refetchQueries({ queryKey: ['profile'] });
      await queryClient.refetchQueries({ queryKey: ['userPreferences'] });
      navigate('/profile');
    },
    onError: (error) => {
      console.error('Failed to save onboarding preferences:', error);
      alert('Failed to save your preferences. Please try again.');
    },
  });

  const handleIndustrySelect = (industry: string) => {
    setSelectedIndustry(industry);
  };

  const handleSave = () => {
    if (selectedIndustry) {
      updateIndustryMutation.mutate({ industry: selectedIndustry });
    }
  };

  return (
    <div className="container">
    <div className="manage-profile-page">
      <div className="manage-profile-header">
        <button 
          className="manage-profile-back"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <img src={goBackIcon} alt="Back Button" />    
        </button>
        <h1 className="manage-profile-title">Manage Your Profile</h1>
      </div>

      <div className="manage-profile-content">
        {/* Trades Section */}
        <div className="manage-profile-trades">
          <h2 className="manage-profile-trades-title">Trades</h2>
          <div className="manage-profile-trades-options">
            {industryOptions.map((option) => (
              <button
                key={option.id}
                className={`manage-profile-trade-option ${
                  selectedIndustry === option.value ? 'manage-profile-trade-option--selected' : ''
                }`}
                onClick={() => handleIndustrySelect(option.value)}
                disabled={updateIndustryMutation.isPending}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="manage-profile-trades-actions">
            <button
              className="manage-profile-save-button"
              onClick={handleSave}
              disabled={!selectedIndustry || updateIndustryMutation.isPending}
            >
              {updateIndustryMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
          {updateIndustryMutation.isError && (
            <p className="manage-profile-error">
              {(updateIndustryMutation.error as Error).message}
            </p>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

