import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import Navigation from '../../components/Navigation/Navigation';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';

const capabilities = [
  {
    title: 'Storage and transfer',
    text: 'Drag-and-drop uploads up to 25MB, file classification, and a storage usage meter.',
  },
  {
    title: 'Access and sharing',
    text: 'Invite by email or copy a link, then revoke access from the shared list.',
  },
  {
    title: 'Preview',
    text: 'Browse files in a table or grid, search them, star them, and preview PDFs in the browser.',
  },
  {
    title: 'Accounts',
    text: 'JWT sign-in, profile updates, password reset, and a PostgreSQL database on Neon.',
  },
];

export default function Home() {
  const { user } = useAuth();
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const curlCode = `# 1. Authenticate and obtain JWT
curl -X POST http://localhost:8080/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"alex@example.com","password":"secretpassword"}'

# 2. Upload file stream (multipart)
curl -X POST http://localhost:8080/api/files/upload \\
  -H "Authorization: Bearer <ACCESS_TOKEN>" \\
  -F "file=@document.pdf"

# 3. Create time-limited share link (Viewer permission)
curl -X POST http://localhost:8080/api/files/share/create-link \\
  -H "Authorization: Bearer <ACCESS_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"fileId":12,"permission":"VIEWER","expiresInHours":24}'`;

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCode);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-14 w-full space-y-12">
        <section>
          <h1 className="text-3xl font-semibold">File Sharing System</h1>
          <p className="mt-3 text-base-content/80 leading-relaxed">
            Store files, share them with another account, and open PDFs in the browser.
            The API is Spring Boot. The database is PostgreSQL on Neon.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {user ? (
              <a href="/dashboard" className="btn btn-primary btn-sm">
                Open dashboard
              </a>
            ) : (
              <a href="/auth" className="btn btn-primary btn-sm">
                Start sharing
              </a>
            )}
            <a href="/auth" className="btn btn-ghost btn-sm">
              Sign in
            </a>
            <a
              href="https://github.com/dineshkorukonda/FileSharingSystem"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
            >
              GitHub
            </a>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium border-b border-base-300 pb-2 mb-4">
            What it does
          </h2>
          <ul className="divide-y divide-base-300">
            {capabilities.map((item) => (
              <li key={item.title} className="py-4">
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-base-content/70 mt-1">{item.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex items-center justify-between border-b border-base-300 pb-2 mb-4">
            <h2 className="text-lg font-medium">API example</h2>
            <button type="button" onClick={handleCopy} className="btn btn-ghost btn-xs gap-1">
              {copiedSnippet ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedSnippet ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="bg-base-100 border border-base-300 p-4 text-xs overflow-x-auto">
            {curlCode}
          </pre>
        </section>

        <section>
          <h2 className="text-lg font-medium border-b border-base-300 pb-2 mb-4">Stack</h2>
          <dl className="bg-base-100 border border-base-300 divide-y divide-base-300 text-sm">
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-base-content/70">Backend</dt>
              <dd>Java 17, Spring Boot 3.4</dd>
            </div>
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-base-content/70">Database</dt>
              <dd>PostgreSQL (Neon)</dd>
            </div>
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-base-content/70">Client</dt>
              <dd>React 19, DaisyUI</dd>
            </div>
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-base-content/70">Auth</dt>
              <dd>JWT</dd>
            </div>
          </dl>
        </section>
      </main>

      <Footer />
    </div>
  );
}
