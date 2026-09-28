import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SettingsPage = () => {
  const { isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    fetchNotificationPreferences();
  }, []);

  const fetchNotificationPreferences = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users/notifications', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.enabled);
        localStorage.setItem('notifications', data.enabled);
      } else {
        const notifSetting = localStorage.getItem('notifications');
        setNotifications(notifSetting === null ? true : notifSetting === 'true');
      }
    } catch {
      const notifSetting = localStorage.getItem('notifications');
      setNotifications(notifSetting === null ? true : notifSetting === 'true');
    }
  };

  const handleNotificationToggle = async (checked) => {
    setNotifications(checked);
    localStorage.setItem('notifications', checked);

    try {
      const response = await fetch('http://localhost:8080/api/users/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ enabled: checked }),
      });

      if (response.ok) {
        toast.success(`Email notifications ${checked ? 'enabled' : 'disabled'}`);
      } else {
        setNotifications(!checked);
        localStorage.setItem('notifications', !checked);
        toast.error('Failed to update notifications');
      }
    } catch {
      setNotifications(!checked);
      localStorage.setItem('notifications', !checked);
      toast.error('Failed to update notifications');
    }
  };

  const confirmDeleteAccount = async () => {
    if (confirmText !== 'DELETE') return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/users/account', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = { error: 'Unknown server error' };
      }

      if (response.ok) {
        toast.success('Account deleted');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          window.location.href = '/auth';
        }, 1500);
      } else {
        let errorMessage = data.error || 'Failed to delete account';
        if (data.error && data.error.includes('foreign key constraint fails')) {
          errorMessage = 'Cannot delete account: remove uploaded or shared files first.';
        }
        toast.error(errorMessage);
        setIsLoading(false);
        setIsDeleteModalOpen(false);
      }
    } catch {
      toast.error('An error occurred while deleting your account.');
      setIsLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      {isDeleteModalOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-medium text-lg">Delete account</h3>
            <p className="text-sm text-base-content/70 mt-2">
              This removes your account. Type DELETE to confirm.
            </p>
            <input
              type="text"
              className="input input-bordered w-full mt-4"
              placeholder="DELETE"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoFocus
            />
            <div className="modal-action">
              <button type="button" className="btn btn-sm" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button
                type="button"
                className="btn btn-error btn-sm"
                onClick={confirmDeleteAccount}
                disabled={isLoading || confirmText !== 'DELETE'}
              >
                {isLoading ? 'Deleting' : 'Delete account'}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button type="button" onClick={() => setIsDeleteModalOpen(false)}>close</button>
          </form>
        </dialog>
      )}

      <section className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h2 className="font-medium border-b border-base-300 pb-2">Appearance</h2>
          <div className="flex gap-2 mt-3">
            <button type="button" className={`btn btn-sm ${!isDark ? 'btn-active' : 'btn-ghost'}`} onClick={() => isDark && toggleTheme()}>
              Light
            </button>
            <button type="button" className={`btn btn-sm ${isDark ? 'btn-active' : 'btn-ghost'}`} onClick={() => !isDark && toggleTheme()}>
              Dark
            </button>
          </div>
        </div>
      </section>

      <section className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h2 className="font-medium border-b border-base-300 pb-2">Notifications</h2>
          <label className="flex items-center justify-between gap-4 mt-3">
            <span className="text-sm">Email when a file is shared with you</span>
            <input
              type="checkbox"
              className="toggle"
              checked={notifications}
              onChange={(e) => handleNotificationToggle(e.target.checked)}
            />
          </label>
        </div>
      </section>

      <section className="card bg-base-100 border border-error/40">
        <div className="card-body">
          <h2 className="font-medium border-b border-base-300 pb-2">Account</h2>
          <p className="text-sm text-base-content/70 mt-3">
            Deleting the account removes the user record. Files may need to be removed first.
          </p>
          <button type="button" className="btn btn-error btn-sm w-fit mt-3" onClick={() => setIsDeleteModalOpen(true)}>
            Delete account
          </button>
        </div>
      </section>

      <ToastContainer position="bottom-right" theme={isDark ? 'dark' : 'light'} />
    </div>
  );
};

export default SettingsPage;
