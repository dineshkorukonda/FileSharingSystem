import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { downloadFile } from '../../utils/fileUtils';

const SharedFiles = () => {
  const [activeTab, setActiveTab] = useState('with-me');
  const [sharedWithMe, setSharedWithMe] = useState([]);
  const [sharedByMe, setSharedByMe] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [revokingFile, setRevokingFile] = useState(null);

  useEffect(() => {
    loadSharedFiles();
  }, [activeTab]);

  const loadSharedFiles = async () => {
    setIsLoading(true);
    setError('');

    try {
      const endpoint = activeTab === 'with-me' ? 'shared-with-me' : 'shared-by-me';
      const response = await fetch(`http://localhost:8080/api/files/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching shared files: ${response.status}`);
      }

      const data = await response.json();
      if (activeTab === 'with-me') {
        setSharedWithMe(data);
      } else {
        setSharedByMe(data);
      }
    } catch (err) {
      console.error('Error loading shared files:', err);
      setError('Failed to load shared files. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleView = (file) => {
    window.open(`http://localhost:8080/api/files/download/${file.id || file.fileId}`, '_blank');
  };

  const handleUnshare = async (share) => {
    if (!window.confirm(`Stop sharing with ${share.sharedWithEmail}?`)) {
      return;
    }

    try {
      setRevokingFile(share.fileId || share.id);
      const response = await fetch('http://localhost:8080/api/files/share', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          fileId: share.fileId || share.id,
          email: share.sharedWithEmail,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Sharing revoked');
        loadSharedFiles();
      } else {
        toast.error(data.error || 'Failed to revoke access');
      }
    } catch (err) {
      console.error('Error revoking access:', err);
      toast.error('An error occurred while revoking access');
    } finally {
      setRevokingFile(null);
    }
  };

  const copyShareLink = (fileId) => {
    navigator.clipboard
      .writeText(`${window.location.origin}/shared/access/${fileId}`)
      .then(() => toast.success('Link copied'))
      .catch(() => toast.error('Failed to copy link'));
  };

  const empty = (message) => (
    <p className="text-sm text-base-content/70 border border-base-300 bg-base-100 p-6">{message}</p>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div role="tablist" className="tabs tabs-border">
          <button type="button" role="tab" className={`tab ${activeTab === 'with-me' ? 'tab-active' : ''}`} onClick={() => setActiveTab('with-me')}>
            With me
          </button>
          <button type="button" role="tab" className={`tab ${activeTab === 'by-me' ? 'tab-active' : ''}`} onClick={() => setActiveTab('by-me')}>
            By me
          </button>
        </div>
        <button type="button" className="btn btn-sm btn-ghost" onClick={loadSharedFiles}>Refresh</button>
      </div>

      {isLoading ? (
        <p className="text-sm text-base-content/70">Loading</p>
      ) : error ? (
        <div className="alert alert-error">
          <span>{error}</span>
          <button type="button" className="btn btn-sm" onClick={loadSharedFiles}>Try again</button>
        </div>
      ) : activeTab === 'with-me' ? (
        sharedWithMe.length === 0 ? empty('No files have been shared with you.') : (
          <div className="overflow-x-auto bg-base-100 border border-base-300">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="hidden sm:table-cell">Size</th>
                  <th className="hidden md:table-cell">From</th>
                  <th className="hidden md:table-cell">Date</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sharedWithMe.map((file) => (
                  <tr key={file.id}>
                    <td>
                      <button type="button" className="link" onClick={() => handleView(file)}>
                        {file.originalName || file.fileName}
                      </button>
                    </td>
                    <td className="hidden sm:table-cell">{formatFileSize(file.fileSize)}</td>
                    <td className="hidden md:table-cell">{file.ownerName || 'User'}</td>
                    <td className="hidden md:table-cell">{formatDate(file.sharedDate)}</td>
                    <td className="text-right">
                      <button type="button" className="btn btn-ghost btn-xs" onClick={() => handleView(file)}>View</button>
                      <button type="button" className="btn btn-ghost btn-xs" onClick={() => downloadFile(file)}>Download</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : sharedByMe.length === 0 ? (
        <div className="space-y-3">
          {empty('You have not shared any files.')}
          <a href="/dashboard/files" className="btn btn-primary btn-sm">Go to files</a>
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-100 border border-base-300">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Name</th>
                <th className="hidden sm:table-cell">Size</th>
                <th className="hidden md:table-cell">Recipient</th>
                <th className="hidden md:table-cell">Date</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sharedByMe.map((share, idx) => (
                <tr key={share.id || idx}>
                  <td>
                    <button type="button" className="link" onClick={() => handleView(share)}>
                      {share.originalName || share.fileName}
                    </button>
                  </td>
                  <td className="hidden sm:table-cell">{formatFileSize(share.fileSize)}</td>
                  <td className="hidden md:table-cell">{share.sharedWithEmail || 'Link'}</td>
                  <td className="hidden md:table-cell">{formatDate(share.sharedDate)}</td>
                  <td className="text-right">
                    <button type="button" className="btn btn-ghost btn-xs" onClick={() => copyShareLink(share.fileId || share.id)}>Copy link</button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-error"
                      disabled={revokingFile === (share.fileId || share.id)}
                      onClick={() => handleUnshare(share)}
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SharedFiles;
