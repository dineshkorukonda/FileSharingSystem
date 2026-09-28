import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navigation() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-40 px-4">
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
        <a href="/" className="text-sm font-semibold">
          File Sharing System
        </a>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/dineshkorukonda/FileSharingSystem"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm hidden sm:inline-flex"
          >
            Source
          </a>
          <button
            type="button"
            onClick={() => toggleTheme()}
            className="btn btn-ghost btn-sm btn-square"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {user ? (
            <a href="/dashboard" className="btn btn-primary btn-sm">
              Dashboard
            </a>
          ) : (
            <>
              <a href="/auth" className="btn btn-ghost btn-sm">
                Sign in
              </a>
              <a href="/auth" className="btn btn-primary btn-sm">
                Get started
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
