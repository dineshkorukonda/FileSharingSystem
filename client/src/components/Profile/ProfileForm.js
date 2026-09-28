import React, { useState, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import defaultAvatar from '../../assets/default-avatar.svg';

const ProfileForm = ({ initialProfile, onSave, onSavePassword, loading, loadingPassword }) => {
  const [fullName, setFullName] = useState(initialProfile.fullName || '');
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialProfile.profileImageUrl || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef();

  const getProfileImageUrl = (url) => {
    if (!url) return defaultAvatar;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    if (url.startsWith('/api/')) return `http://localhost:8080${url}`;
    return defaultAvatar;
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (profileImage) {
      uploadProfileImage();
    } else {
      onSave({
        fullName,
        profileImageUrl: previewUrl,
      });
    }
  };

  const uploadProfileImage = () => {
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', profileImage);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    fetch('http://localhost:8080/api/users/profile/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    })
      .then((response) => {
        if (!response.ok) throw new Error('Image upload failed');
        return response.json();
      })
      .then((data) => {
        setUploadProgress(100);
        onSave({
          fullName,
          profileImageUrl: data.profileImageUrl,
        });
      })
      .catch((err) => {
        setError('Failed to upload profile image.');
        console.error('Upload error:', err);
      })
      .finally(() => {
        clearInterval(progressInterval);
        setIsUploading(false);
      });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');
    if (!password || !confirmPassword) {
      setPasswordError('Please enter and confirm your new password.');
      return;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    onSavePassword({ password });
    setPassword('');
    setConfirmPassword('');
  };

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <form onSubmit={handleProfileSubmit} className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h2 className="font-medium border-b border-base-300 pb-2">Personal information</h2>
          <div className="flex items-center gap-4 mt-2">
            <img
              src={getProfileImageUrl(previewUrl)}
              alt=""
              className="h-16 w-16 rounded-full object-cover bg-slate-100"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultAvatar;
              }}
            />
            <div>
              <button type="button" className="btn btn-sm" onClick={() => fileInputRef.current?.click()}>
                Change photo
              </button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
              <p className="text-xs text-base-content/60 mt-1">PNG, JPG, or SVG</p>
            </div>
          </div>
          {isUploading && <progress className="progress w-full" value={uploadProgress} max="100" />}

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Email</legend>
            <input type="email" className="input input-bordered w-full" value={initialProfile.email || ''} disabled />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Full name</legend>
            <input
              type="text"
              className="input input-bordered w-full"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </fieldset>
          {error && <p className="text-sm text-error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-sm w-fit" disabled={loading || isUploading}>
            {loading ? 'Saving' : 'Save changes'}
          </button>
        </div>
      </form>

      <form onSubmit={handlePasswordSubmit} className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h2 className="font-medium border-b border-base-300 pb-2">Password</h2>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">New password</legend>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input input-bordered w-full pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
              />
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-square absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Show password"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Confirm password</legend>
            <input
              type={showPassword ? 'text' : 'password'}
              className="input input-bordered w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
            />
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-error mt-1">Passwords do not match.</p>
            )}
          </fieldset>
          {passwordError && <p className="text-sm text-error">{passwordError}</p>}
          <button
            type="submit"
            className="btn btn-sm w-fit"
            disabled={loadingPassword || !password || !confirmPassword || !passwordsMatch}
          >
            {loadingPassword ? 'Updating' : 'Update password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
