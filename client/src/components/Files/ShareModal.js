import React, { useState, useEffect } from 'react';
import { Link2, UserPlus, X } from 'lucide-react';
import { toast } from 'react-toastify';

const ShareModal = ({ file, onClose, onShareSuccess }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sharedWithEmails, setSharedWithEmails] = useState([]);
  const [isLoadingShares, setIsLoadingShares] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (file) {
      loadExistingShares();
    }
  }, [file]);

  const loadExistingShares = async () => {
    try {
      setIsLoadingShares(true);
      const response = await fetch('http://localhost:8080/api/files/shared-by-me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSharedWithEmails(data.filter((share) => share.fileId === file.id));
      }
    } catch (error) {
      console.error('Error loading shares:', error);
    } finally {
      setIsLoadingShares(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:8080/api/files/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          fileId: file.id,
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'File shared');
        setEmail('');
        onShareSuccess && onShareSuccess();
        await loadExistingShares();
      } else {
        toast.error(data.error || 'Failed to share file');
      }
    } catch (error) {
      console.error('Error sharing file:', error);
      toast.error('An error occurred while sharing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeAccess = async (recipientEmail) => {
    try {
      const response = await fetch('http://localhost:8080/api/files/share', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          fileId: file.id,
          email: recipientEmail,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Access revoked');
        await loadExistingShares();
      } else {
        toast.error(data.error || 'Failed to revoke access');
      }
    } catch (error) {
      console.error('Error revoking access:', error);
      toast.error('An error occurred while revoking access');
    }
  };

  const copyFileLink = () => {
    const shareableLink = `${window.location.origin}/shared/access/${file.id}`;
    navigator.clipboard
      .writeText(shareableLink)
      .then(() => {
        setCopied(true);
        toast.success('Link copied');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error('Failed to copy link'));
  };

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-lg rounded-2xl p-0">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="sv-glyph bg-rose-50 text-rose-600">FILE</span>
              <div className="min-w-0">
                <h3 className="truncate font-display text-base font-semibold">
                  {file?.originalName || file?.fileName}
                </h3>
                <p className="text-xs text-slate-500">Invite by email or copy a link.</p>
              </div>
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4">
          <form onSubmit={handleSubmit} className="space-y-2">
            <label className="text-sm font-medium">Invite collaborators</label>
            <div className="flex gap-2">
              <label className="input input-bordered flex w-full items-center gap-2">
                <UserPlus className="h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  className="grow"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </label>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting || !email}>
                {isSubmitting ? 'Sharing' : 'Invite'}
              </button>
            </div>
          </form>

          <div className="mt-5">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
              People with access ({sharedWithEmails.length})
            </div>
            {isLoadingShares ? (
              <p className="mt-2 text-sm text-slate-500">Loading</p>
            ) : sharedWithEmails.length > 0 ? (
              <ul className="mt-2 max-h-44 divide-y divide-slate-100 overflow-y-auto">
                {sharedWithEmails.map((share, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-2 py-3 text-sm">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-medium text-[#2563eb]">
                        {(share.sharedWithEmail || '?').slice(0, 1).toUpperCase()}
                      </span>
                      <span className="truncate">{share.sharedWithEmail}</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => handleRevokeAccess(share.sharedWithEmail)}
                    >
                      Revoke
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Only you can access this file until you invite someone.</p>
            )}
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <div className="text-sm font-medium">Link access</div>
            <p className="text-xs text-slate-500">Copy the file link. Sharing still requires an invited account.</p>
            <div className="mt-2 flex gap-2">
              <input
                readOnly
                className="input input-bordered input-sm w-full bg-white"
                value={`${window.location.origin}/shared/access/${file?.id || ''}`}
              />
              <button type="button" className="btn btn-sm gap-1" onClick={copyFileLink}>
                <Link2 className="h-3.5 w-3.5" />
                {copied ? 'Copied' : 'Copy link'}
              </button>
            </div>
          </div>
        </div>

        <div className="modal-action border-t border-slate-200 px-5 py-3">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default ShareModal;
