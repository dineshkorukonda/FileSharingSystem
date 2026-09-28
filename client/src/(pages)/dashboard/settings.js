import React from 'react';
import SettingsPage from '../../components/Settings/SettingsPage';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-base-300 pb-3">
        <h1 className="font-display text-[28px] font-semibold leading-9">Settings</h1>
        <p className="text-sm text-base-content/70 mt-1">
          Email notifications and account deletion.
        </p>
      </div>
      <SettingsPage />
    </div>
  );
};

export default Settings;
