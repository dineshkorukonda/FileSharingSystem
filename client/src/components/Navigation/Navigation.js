import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Navigation() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="/" className="font-display text-base font-semibold text-slate-900">
          File Sharing
        </a>
        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <a href="#features" className="hover:text-slate-900">Features</a>
          <a href="#workspace" className="hover:text-slate-900">Workspace</a>
          <a href="#limits" className="hover:text-slate-900">Limits</a>
          <a href="#api" className="hover:text-slate-900">API</a>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <a href="/dashboard" className="btn btn-primary btn-sm rounded-full px-4">
              Open drive
            </a>
          ) : (
            <>
              <a href="/auth" className="btn btn-ghost btn-sm hidden sm:inline-flex">
                Sign in
              </a>
              <a href="/auth" className="btn btn-primary btn-sm rounded-full px-4">
                Get started
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
