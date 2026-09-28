import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <div className="font-display text-base font-semibold text-slate-900">File Sharing</div>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Store files, share them with another account, and open PDFs in the browser.
          </p>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Product</div>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
            <a href="#features" className="hover:text-slate-900">Features</a>
            <a href="/dashboard/files" className="hover:text-slate-900">My drive</a>
            <a href="/dashboard/upload" className="hover:text-slate-900">Upload</a>
          </div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Account</div>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
            <a href="/auth" className="hover:text-slate-900">Sign in</a>
            <a href="/reset-password" className="hover:text-slate-900">Reset password</a>
            <a href="/dashboard/settings" className="hover:text-slate-900">Settings</a>
          </div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Source</div>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
            <a
              href="https://github.com/dineshkorukonda/FileSharingSystem"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900"
            >
              GitHub
            </a>
            <a href="#api" className="hover:text-slate-900">API example</a>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 px-4 py-4 text-center text-xs text-slate-400 sm:px-6">
        File Sharing System
      </div>
    </footer>
  );
}
