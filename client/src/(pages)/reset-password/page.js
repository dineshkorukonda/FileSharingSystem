import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PasswordResetPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  const isResetMode = !!token;

  useEffect(() => {
    const existingToken = localStorage.getItem('token');
    if (existingToken) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/password/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setResetRequested(true);
        toast.success('Password reset link sent to your email');
      } else {
        toast.error(data.message || 'Failed to request password reset');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error('Please enter a new password');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setResetComplete(true);
        toast.success('Password reset successful');
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <header className="navbar bg-base-100 border-b border-base-300 px-4">
        <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
          <button type="button" onClick={() => navigate('/auth')} className="btn btn-ghost btn-sm gap-2">
            <ArrowLeft className="h-4 w-4" />
            Sign in
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="card bg-base-100 border border-base-300 w-full max-w-sm">
          <div className="card-body">
            {resetRequested ? (
              <>
                <h1 className="text-xl font-semibold">Check your inbox</h1>
                <p className="text-sm text-base-content/70">
                  A reset link was sent to {email}.
                </p>
                <button type="button" className="btn btn-primary mt-4" onClick={() => navigate('/auth')}>
                  Return to sign in
                </button>
              </>
            ) : resetComplete ? (
              <>
                <h1 className="text-xl font-semibold">Password updated</h1>
                <p className="text-sm text-base-content/70">
                  You can sign in with the new password.
                </p>
                <button type="button" className="btn btn-primary mt-4" onClick={() => navigate('/auth')}>
                  Go to sign in
                </button>
              </>
            ) : (
              <>
                <h1 className="text-xl font-semibold">
                  {isResetMode ? 'Choose a new password' : 'Reset your password'}
                </h1>
                <p className="text-sm text-base-content/70">
                  {isResetMode
                    ? 'Use at least 6 characters.'
                    : 'We will email you a reset link.'}
                </p>

                {isResetMode ? (
                  <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
                    <fieldset className="fieldset">
                      <legend className="fieldset-legend">New password</legend>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="input input-bordered w-full pr-10"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
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
                        required
                        minLength={6}
                      />
                    </fieldset>
                    <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
                      {isLoading ? 'Updating' : 'Set new password'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRequestReset} className="space-y-4 mt-4">
                    <fieldset className="fieldset">
                      <legend className="fieldset-legend">Email</legend>
                      <input
                        type="email"
                        className="input input-bordered w-full"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </fieldset>
                    <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
                      {isLoading ? 'Sending' : 'Send reset link'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <ToastContainer position="bottom-right" theme="light" />
    </div>
  );
};

export default PasswordResetPage;
