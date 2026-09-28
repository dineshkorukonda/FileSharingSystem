import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Auth = () => {
  const [tab, setTab] = useState('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        login(
          {
            email: data.email || email,
            fullName: data.fullName || email.split('@')[0],
            profileImageUrl: data.profileImageUrl,
          },
          data.accessToken
        );
        toast.success('Welcome back');
      } else {
        const msg = data.message || 'Invalid email or password';
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
      toast.error('Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Account created. Sign in to continue.');
        setTab('signin');
        setPassword('');
      } else {
        const msg = data.message || 'Registration failed';
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
      toast.error('Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <header className="navbar bg-base-100 border-b border-base-300 px-4">
        <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
          <a href="/" className="btn btn-ghost btn-sm gap-2">
            <ArrowLeft className="h-4 w-4" />
            Home
          </a>
          <button
            type="button"
            onClick={() => toggleTheme()}
            className="btn btn-ghost btn-sm btn-square"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="card bg-base-100 border border-base-300 w-full max-w-sm">
          <div className="card-body">
            <h1 className="text-xl font-semibold">
              {tab === 'signin' ? 'Sign in' : 'Create an account'}
            </h1>
            <p className="text-sm text-base-content/70">
              {tab === 'signin'
                ? 'Use your email and password.'
                : 'Register to upload and share files.'}
            </p>

            <div role="tablist" className="tabs tabs-border mt-2">
              <button
                type="button"
                role="tab"
                className={`tab ${tab === 'signin' ? 'tab-active' : ''}`}
                onClick={() => { setTab('signin'); setError(''); }}
              >
                Sign in
              </button>
              <button
                type="button"
                role="tab"
                className={`tab ${tab === 'register' ? 'tab-active' : ''}`}
                onClick={() => { setTab('register'); setError(''); }}
              >
                Register
              </button>
            </div>

            {error && <div className="alert alert-error text-sm mt-4">{error}</div>}

            {tab === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4 mt-4">
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
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">
                    Password
                    <a href="/reset-password" className="link link-hover text-xs font-normal">
                      Forgot password
                    </a>
                  </legend>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input input-bordered w-full pr-10"
                      aria-label="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
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
                <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                  {loading ? 'Signing in' : 'Continue'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4 mt-4">
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
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Password</legend>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input input-bordered w-full pr-10"
                      aria-label="Password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                  {loading ? 'Creating account' : 'Create account'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <ToastContainer position="bottom-right" theme={isDark ? 'dark' : 'light'} />
    </div>
  );
};

export default Auth;
