import React, { useState, useEffect } from 'react';
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
      <div className="modal-box max-w-lg">
        <h3 className="font-medium text-lg">
          Share {file?.originalName || file?.fileName}
        </h3>
        <p className="text-sm text-base-content/70 mt-1">Send access by email or copy a link.</p>

        <div className="mt-4 space-y-1">
          <div className="text-sm">Link</div>
          <div className="flex gap-2">
            <input
              readOnly
              className="input input-bordered input-sm w-full"
              value={`${window.location.origin}/shared/access/${file?.id || ''}`}
            />
            <button type="button" className="btn btn-sm" onClick={copyFileLink}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-2">
          <label className="text-sm">Invite by email</label>
          <div className="flex gap-2">
            <input
              type="email"
              className="input input-bordered input-sm w-full"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting || !email}>
              {isSubmitting ? 'Sharing' : 'Share'}
            </button>
          </div>
        </form>

        <div className="mt-4 border-t border-base-300 pt-3">
          <div className="text-sm mb-2">People with access ({sharedWithEmails.length})</div>
          {isLoadingShares ? (
            <p className="text-sm text-base-content/60">Loading</p>
          ) : sharedWithEmails.length > 0 ? (
            <ul className="divide-y divide-base-300 max-h-44 overflow-y-auto">
              {sharedWithEmails.map((share, idx) => (
                <li key={idx} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <span className="truncate">{share.sharedWithEmail}</span>
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
            <p className="text-sm text-base-content/60">Only you can access this file.</p>
          )}
        </div>

        <div className="modal-action">
          <button type="button" className="btn btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default ShareModal;
