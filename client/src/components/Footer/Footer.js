import React from 'react';

export default function Footer() {
  return (
    <footer className="footer footer-horizontal border-t border-base-300 bg-base-100 px-6 py-6 text-sm text-base-content/70">
      <div className="max-w-3xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3">
        <span>File Sharing System</span>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/dineshkorukonda/FileSharingSystem"
            target="_blank"
            rel="noopener noreferrer"
            className="link link-hover"
          >
            GitHub
          </a>
          <a href="/dashboard" className="link link-hover">
            Dashboard
          </a>
          <a href="/auth" className="link link-hover">
            Sign in
          </a>
        </div>
      </div>
    </footer>
  );
}
