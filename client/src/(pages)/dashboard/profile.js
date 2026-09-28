import React, { useState } from 'react';
import ProfileForm from '../../components/Profile/ProfileForm';
import { useAuth } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '../../context/ThemeContext';

const ProfilePage = () => {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const { isDark } = useTheme();

  const handleSave = async (profileData) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          fullName: profileData.fullName,
          profileImageUrl: profileData.profileImageUrl,
        }),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        login(updatedUser, localStorage.getItem('token'));
        toast.success('Profile updated');
      } else {
        toast.error('Failed to update profile.');
      }
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async ({ password }) => {
    setLoadingPassword(true);
    try {
      const res = await fetch('http://localhost:8080/api/users/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        toast.success('Password updated');
      } else {
        toast.error('Failed to update password.');
      }
    } catch {
      toast.error('Failed to update password.');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-base-300 pb-3">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-base-content/70 mt-1">
          Name, photo, and password.
        </p>
      </div>

      <ProfileForm
        initialProfile={user || {}}
        onSave={handleSave}
        onSavePassword={handleSavePassword}
        loading={loading}
        loadingPassword={loadingPassword}
      />

      <ToastContainer position="bottom-right" theme={isDark ? 'dark' : 'light'} />
    </div>
  );
};

export default ProfilePage;
