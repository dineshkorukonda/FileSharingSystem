import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../context/AuthContext';

const Icon = ({ name, className = 'text-[18px]' }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const fieldClass = 'block w-full rounded-lg border border-[#c3c6d7]/60 bg-white py-2.5 pl-10 pr-3 text-[15px] text-[#0b1c30] outline-none placeholder:text-[#737686] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/10';

const Auth = () => {
  const [params, setParams] = useSearchParams();
  const mode = params.get('mode') === 'register' ? 'register' : 'signin';
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [tier, setTier] = useState('starter');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const setMode = (next) => {
    setError('');
    setParams(next === 'register' ? { mode: 'register' } : {});
  };

  const strength = useMemo(() => {
    if (!password || password.length < 4) return { label: 'Too short', bars: 0, color: 'text-[#737686]' };
    if (password.length < 6) return { label: 'Weak', bars: 1, color: 'text-[#ba1a1a]' };
    if (password.length < 10) return { label: 'Medium', bars: 2, color: 'text-[#784b00]' };
    return { label: 'Strong', bars: 3, color: 'text-[#006a61]' };
  }, [password]);

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
    } catch {
      setError('Unable to connect to server. Please try again.');
      toast.error('Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!agreed) {
      setError('Agree to the terms to create an account.');
      return;
    }
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
        setMode('signin');
        setPassword('');
      } else {
        const msg = data.message || 'Registration failed';
        setError(msg);
        toast.error(msg);
      }
    } catch {
      setError('Unable to connect to server. Please try again.');
      toast.error('Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#f8f9ff] text-[#0b1c30] lg:flex-row">
      {mode === 'signin' ? <SignInStory /> : <SignUpStory tier={tier} setTier={setTier} />}
      <section className="flex flex-1 items-center justify-center bg-white p-6 sm:p-12">
        <div className="w-full max-w-md">
          {mode === 'signin' ? (
            <>
              <h2 className="font-display text-[28px] font-bold leading-9">Welcome back</h2>
              <p className="mt-2 text-[15px] text-[#434655]">Sign in to access your files and shared drives</p>
              {error && <p className="mb-3 mt-6 rounded-lg bg-[#ffdad6] px-3 py-2 text-sm text-[#93000a]">{error}</p>}
              <form className="mt-6 space-y-4" onSubmit={handleSignIn}>
                <label className="block text-sm font-medium" htmlFor="work-email">Work Email Address
                  <span className="relative mt-1.5 block">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#737686]"><Icon name="mail" /></span>
                    <input id="work-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className={fieldClass} />
                  </span>
                </label>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-sm font-medium" htmlFor="user-password">Password</label>
                    <a href="/reset-password" className="text-xs font-medium text-[#004ac6]">Forgot password?</a>
                  </div>
                  <span className="relative block">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#737686]"><Icon name="lock" /></span>
                    <input id="user-password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your security credentials" className={`${fieldClass} pr-10`} />
                    <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#737686]" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password visibility">
                      <Icon name={showPassword ? 'visibility_off' : 'visibility'} />
                    </button>
                  </span>
                </div>
                <label className="flex items-center gap-2 text-sm text-[#434655]">
                  <input type="checkbox" className="h-4 w-4 rounded border-[#c3c6d7] text-[#2563eb]" />
                  Remember this device for 30 days
                </label>
                <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] py-3 text-sm font-semibold text-white hover:bg-[#004ac6]">
                  {loading ? 'Signing in' : 'Sign In to Workspace'}
                  <Icon name="arrow_forward" />
                </button>
              </form>
              <p className="mt-8 border-t border-[#c3c6d7]/30 pt-6 text-center text-sm text-[#434655]">
                Don&apos;t have an account?
                <button type="button" className="ml-1 font-medium text-[#004ac6]" onClick={() => setMode('register')}>Sign up for free</button>
              </p>
            </>
          ) : (
            <>
              <h2 className="font-display text-[28px] font-bold leading-9">Create your account</h2>
              <p className="mt-2 text-[15px] text-[#434655]">Start sharing files securely in seconds. No credit card required.</p>
              {error && <p className="mb-3 mt-6 rounded-lg bg-[#ffdad6] px-3 py-2 text-sm text-[#93000a]">{error}</p>}
              <form className="mt-6 space-y-4" onSubmit={handleRegister}>
                <Field icon="person" label="Full Name" value={fullName} onChange={setFullName} placeholder="Alex Vance" />
                <Field icon="mail" label="Work Email" type="email" value={email} onChange={setEmail} placeholder="alex@company.com" />
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-medium">Password</span>
                  </div>
                  <span className="relative block">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#737686]"><Icon name="lock" /></span>
                    <input type={showPassword ? 'text' : 'password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter strong password" className={`${fieldClass} pr-10`} />
                    <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#737686]" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password visibility">
                      <Icon name={showPassword ? 'visibility_off' : 'visibility'} />
                    </button>
                  </span>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-[#434655]">Password Strength</span>
                    <span className={`font-semibold ${strength.color}`}>{strength.label}</span>
                  </div>
                  <div className="mt-1 grid grid-cols-3 gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className={`h-1.5 rounded-lg ${i < strength.bars ? 'bg-[#006a61]' : 'bg-[#c3c6d7]/40'}`} />
                    ))}
                  </div>
                  <p className="mt-1 text-[11px] text-[#737686]">Must contain at least 6 characters.</p>
                </div>
                <label className="flex items-start gap-2 text-sm text-[#434655]">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 h-4 w-4 rounded" />
                  <span>I agree to create an account with this email and password.</span>
                </label>
                <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] py-3 text-sm font-semibold text-white hover:bg-[#004ac6]">
                  {loading ? 'Creating account' : 'Create Free Account'}
                  <Icon name="arrow_forward" />
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-[#434655]">
                Already have an account?
                <button type="button" className="ml-1 font-semibold text-[#004ac6]" onClick={() => setMode('signin')}>Sign in</button>
              </p>
            </>
          )}
        </div>
      </section>
      <ToastContainer position="bottom-right" theme="light" />
    </main>
  );
};

function Field({ icon, label, value, onChange, placeholder, type = 'text' }) {
  return (
    <label className="block text-sm font-medium">{label}
      <span className="relative mt-1.5 block">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#737686]"><Icon name={icon} /></span>
        <input type={type} required value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={fieldClass} />
      </span>
    </label>
  );
}

function SignInStory() {
  return (
    <section className="relative flex flex-col justify-between overflow-hidden border-b border-[#c3c6d7]/30 bg-[#f8f9ff] p-8 lg:w-1/2 lg:border-b-0 lg:border-r lg:p-14">
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#004ac6 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="relative flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#2563eb] text-white">
          <Icon name="folder_copy" className="text-2xl" />
        </div>
        <div>
          <div className="font-display text-xl font-bold">FileSharingSystem</div>
          <div className="text-[11px] text-[#434655]">Enterprise Workspace Sync</div>
        </div>
      </div>
      <div className="relative max-w-xl py-12">
        <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-[#c3c6d7]/40 bg-[#eff4ff] px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-[#006a61]" />
          <span className="text-xs font-medium text-[#006a61]">Enterprise Drive v4.1 Release</span>
        </div>
        <h1 className="font-display text-[28px] font-bold leading-9">Secure enterprise file storage, sync, and seamless team collaboration.</h1>
        <p className="mt-4 text-[15px] leading-6 text-[#434655]">Centralize company assets with high-speed uploads, private files, and email invitations.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ['shield_lock', 'End-to-End', 'Signed-in access for every file.'],
            ['admin_panel_settings', 'Access Control', 'Invite by email, then revoke.'],
            ['sync', 'Delta Sync', 'Upload, star, and download.'],
          ].map(([icon, title, text]) => (
            <div key={title} className="rounded-lg border border-[#c3c6d7]/30 bg-white p-4 shadow-sm">
              <div className="mb-3 grid h-8 w-8 place-items-center rounded-lg bg-[#eff4ff] text-[#004ac6]"><Icon name={icon} /></div>
              <div className="font-display text-base font-semibold">{title}</div>
              <div className="mt-1 text-[11px] text-[#434655]">{text}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative flex flex-wrap items-center gap-3 border-t border-[#c3c6d7]/20 pt-6 text-xs">
        <span className="h-2.5 w-2.5 rounded-full bg-[#006a61]" />
        <span className="font-semibold">Systems Operational</span>
        <span className="text-[#c3c6d7]">|</span>
        <span className="text-[#434655]">API on port 8080</span>
      </div>
    </section>
  );
}

function SignUpStory({ tier, setTier }) {
  return (
    <section className="relative flex flex-col justify-between overflow-hidden border-b border-[#c3c6d7]/30 bg-[#eff4ff] p-8 lg:w-5/12 lg:border-b-0 lg:border-r lg:p-12">
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#004ac6 1px, transparent 1px), linear-gradient(to right, #004ac6 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#2563eb] text-white"><Icon name="folder" className="text-2xl" /></div>
          <div>
            <div className="font-display text-xl font-bold">FileSharingSystem</div>
            <div className="text-[11px] text-[#434655]">Enterprise Workspace Cloud</div>
          </div>
        </div>
        <h1 className="font-display mt-12 text-3xl font-bold leading-tight">Get started with free encrypted cloud storage.</h1>
        <p className="mt-3 text-[15px] text-[#434655]">Create an account, then upload and share from the dashboard.</p>
        <div className="mt-8 rounded-lg border border-[#c3c6d7]/50 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#434655]">Selected account tier</span>
            <div className="flex rounded-lg bg-[#eff4ff] p-1">
              <button type="button" onClick={() => setTier('starter')} className={`rounded-lg px-2.5 py-1 text-xs font-medium ${tier === 'starter' ? 'bg-white text-[#004ac6] shadow-sm' : 'text-[#434655]'}`}>Starter</button>
              <button type="button" onClick={() => setTier('pro')} className={`rounded-lg px-2.5 py-1 text-xs font-medium ${tier === 'pro' ? 'bg-white text-[#004ac6] shadow-sm' : 'text-[#434655]'}`}>Pro</button>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <div className="font-display font-bold">{tier === 'starter' ? 'Free Starter' : 'Pro Team'}</div>
              <p className="text-[11px] text-[#434655]">{tier === 'starter' ? 'Included with the account' : 'Shown for the design. Billing is not connected.'}</p>
            </div>
            <div className="font-display font-bold text-[#004ac6]">{tier === 'starter' ? '$0' : '$12'}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Auth;
