import React from 'react';
import SettingsPage from '../../components/Settings/SettingsPage';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-base-300 pb-3">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-base-content/70 mt-1">
          Theme, email notifications, and account deletion.
        </p>
      </div>
      <SettingsPage />
    </div>
  );
};

export default Settings;
