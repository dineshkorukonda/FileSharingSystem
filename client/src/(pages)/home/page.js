import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Icon = ({ name, fill = 0, className = '' }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: `'FILL' ${fill}` }}
  >
    {name}
  </span>
);

export default function Home() {
  const { user } = useAuth();
  const startHref = user ? '/dashboard' : '/auth?mode=register';
  const signInHref = user ? '/dashboard' : '/auth';

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30]">
      <header className="sticky top-0 z-40 border-b border-[#c3c6d7]/40 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="/" className="flex items-center gap-2 font-display text-base font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#2563eb] text-white">
              <Icon name="cloud" fill={1} className="text-[18px]" />
            </span>
            The Cloud
          </a>
          <nav className="hidden items-center gap-6 text-sm text-[#434655] md:flex">
            <a href="#product" className="hover:text-[#0b1c30]">Product</a>
            <a href="#features" className="hover:text-[#0b1c30]">Features</a>
            <a href="#security" className="hover:text-[#0b1c30]">Security</a>
            <a href="#pricing" className="hover:text-[#0b1c30]">Pricing</a>
            <a href="#help" className="hover:text-[#0b1c30]">Help</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href={signInHref} className="px-3 py-2 text-sm font-medium text-[#0b1c30]">Sign in</a>
            <a href={startHref} className="rounded-full bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white">
              Get started
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-4xl px-4 pb-6 pt-16 text-center sm:px-6">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-[#004ac6] sm:text-5xl sm:leading-[56px]">
            Cloud Storage Built for Modern Teams. Fast, Secure, Infinite.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[18px] leading-7 text-[#434655]">
            Effortlessly organize, collaborate on, and safeguard your organization&apos;s digital assets with our enterprise-grade, zero-knowledge, and intelligent cloud storage.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href={startHref} className="rounded-lg bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white">
              Get free 15GB now
            </a>
            <a href="#product" className="rounded-lg border border-[#c3c6d7] bg-white px-5 py-3 text-sm font-semibold text-[#0b1c30]">
              Request a sandbox
            </a>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-[#737686]">
            <span>1,000+ teams</span>
            <span>SOC 2 Type II</span>
            <span>GDPR ready</span>
            <span>ISO 27001</span>
          </div>
        </section>

        <section id="product" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="overflow-hidden rounded-2xl border border-[#c3c6d7]/50 bg-white shadow-[0_20px_40px_-24px_rgba(15,23,42,0.25)]">
            <div className="flex items-center gap-2 border-b border-[#e5eeff] bg-[#f8f9ff] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="ml-2 text-xs text-[#737686]">The Cloud</span>
            </div>
            <div className="grid lg:grid-cols-[200px_1fr_220px]">
              <aside className="border-b border-[#e5eeff] p-4 lg:border-b-0 lg:border-r">
                <div className="rounded-lg bg-[#2563eb] px-3 py-2 text-center text-sm font-semibold text-white">My Cloud</div>
                <ul className="mt-4 space-y-2 text-sm text-[#434655]">
                  <li className="rounded-lg bg-[#eff4ff] px-3 py-2 text-[#004ac6]">Suggested files</li>
                  <li className="px-3 py-2">Starred</li>
                  <li className="px-3 py-2">Shared</li>
                </ul>
              </aside>
              <div className="p-4">
                <div className="text-sm font-semibold">Suggested files</div>
                <div className="mt-3 overflow-hidden rounded-lg border border-[#e5eeff]">
                  {['Q4 capacity plan.pdf', 'Enterprise SLA.pdf', 'Brand system.fig'].map((name) => (
                    <div key={name} className="flex items-center justify-between border-b border-[#e5eeff] px-3 py-3 text-sm last:border-0">
                      <span>{name}</span>
                      <span className="text-xs text-[#737686]">You</span>
                    </div>
                  ))}
                </div>
              </div>
              <aside className="border-t border-[#e5eeff] bg-[#f8f9ff] p-4 lg:border-l lg:border-t-0">
                <div className="text-sm font-semibold">Vault insights</div>
                <div className="mt-4 grid h-28 place-items-center rounded-full border-8 border-[#2563eb] text-center">
                  <div>
                    <div className="font-display text-lg font-bold">2 TB</div>
                    <div className="text-[11px] text-[#737686]">available</div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-center text-3xl font-bold tracking-tight">
            Engineered for Unmatched Velocity &amp; Absolute Privacy
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[#434655]">
            Zero-knowledge mechanics and real-time sync, built around the files you already upload and share.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              ['bolt', 'Delta-block sync', 'Only changed blocks move, so large files stay fast to update.'],
              ['shield_lock', 'Zero-knowledge privacy', 'Files stay private until you invite someone by email.'],
              ['link', 'Share links and access', 'Invite a person, copy a link, or revoke access later.'],
              ['preview', 'Preview and organize', 'Browse a grid or table, star files, and open PDFs in the browser.'],
            ].map(([icon, title, text]) => (
              <article key={title} className="rounded-xl border border-[#c3c6d7]/40 bg-white p-6">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#eff4ff] text-[#004ac6]">
                  <Icon name={icon} />
                </div>
                <h3 className="font-display mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#434655]">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="security" className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold">15 GB free workspace</h2>
            <p className="mt-3 text-[#434655]">
              Sign in with the email and password you already use. Uploads, shares, and account settings stay on the same API.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-[#434655]">
              <li>Invite people by email</li>
              <li>Preview PDFs in the browser</li>
              <li>Reset a forgotten password</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-[#c3c6d7]/40 bg-white p-6 shadow-sm">
            <h3 className="font-display text-xl font-semibold">Sign in</h3>
            <p className="mt-1 text-sm text-[#434655]">Use your email and password.</p>
            <a href={signInHref} className="mt-6 block rounded-lg bg-[#2563eb] py-3 text-center text-sm font-semibold text-white">
              Continue to sign in
            </a>
            <a href={startHref} className="mt-3 block text-center text-sm font-medium text-[#004ac6]">
              Create an account
            </a>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-center text-3xl font-bold">Transparent capacity</h2>
          <p className="mt-2 text-center text-sm text-[#737686]">The running app uses a 25MB upload limit and a 500MB drive meter.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ['Starter', '$0', 'Included', 'Sign in and upload'],
              ['Pro', '$12', 'Shown in the design', 'Same account, more room later'],
              ['Business', '$24', 'Shown in the design', 'Shared drives and admin later'],
            ].map(([name, price, note, detail], index) => (
              <article key={name} className={`rounded-2xl border bg-white p-6 ${index === 1 ? 'border-[#2563eb] shadow-md' : 'border-[#c3c6d7]/40'}`}>
                <div className="text-sm text-[#434655]">{name}</div>
                <div className="font-display mt-2 text-4xl font-bold">{price}</div>
                <p className="mt-2 text-sm text-[#434655]">{note}</p>
                <p className="mt-4 text-sm text-[#737686]">{detail}</p>
                <a href={startHref} className={`mt-6 block rounded-lg py-2.5 text-center text-sm font-semibold ${index === 1 ? 'bg-[#2563eb] text-white' : 'border border-[#c3c6d7] text-[#0b1c30]'}`}>
                  {index === 0 ? 'Get started' : 'View plans'}
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white py-16">
          <h2 className="font-display text-center text-2xl font-bold">Loved by fast-moving teams</h2>
          <div className="mx-auto mt-8 grid max-w-6xl gap-4 px-4 sm:px-6 md:grid-cols-3">
            {[
              ['Upload is the daily path', 'Drop a file, then find it in My Drive.'],
              ['Sharing stays simple', 'Invite by email and revoke access from the same dialog.'],
              ['Accounts stay yours', 'Profile, password, and notification settings live in the dashboard.'],
            ].map(([title, text]) => (
              <article key={title} className="rounded-xl border border-[#e5eeff] bg-[#f8f9ff] p-5">
                <h3 className="font-display font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-[#434655]">{text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer id="help" className="border-t border-[#e5eeff] bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
          <div>
            <div className="font-display font-bold">The Cloud</div>
            <p className="mt-2 text-sm text-[#737686]">Store files, share them, and open PDFs in the browser.</p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-[#737686]">Product</div>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="/dashboard/files">My drive</a>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-[#737686]">Account</div>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <a href="/auth">Sign in</a>
              <a href="/auth?mode=register">Create account</a>
              <a href="/reset-password">Reset password</a>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-[#737686]">Source</div>
            <a className="mt-3 block text-sm" href="https://github.com/dineshkorukonda/FileSharingSystem" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
