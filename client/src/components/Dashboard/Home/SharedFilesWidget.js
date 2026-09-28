import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Download } from 'lucide-react';

const SharedFilesWidget = () => {
  const [sharedFiles, setSharedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSharedFiles = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:8080/api/files/shared-with-me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const recentShared = data
            .sort((a, b) => new Date(b.sharedDate) - new Date(a.sharedDate))
            .slice(0, 4);
          setSharedFiles(recentShared);
        } else {
          setSharedFiles([]);
        }
      } catch (error) {
        setSharedFiles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedFiles();
  }, []);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
          <h2 className="text-sm font-medium">Shared with you</h2>
          <Link to="/dashboard/shared" className="link link-hover text-sm">View all</Link>
        </div>
        {isLoading ? (
          <p className="p-4 text-sm text-base-content/60">Loading</p>
        ) : sharedFiles.length === 0 ? (
          <p className="p-4 text-sm text-base-content/60">Nothing shared with you yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="hidden sm:table-cell">Size</th>
                  <th className="hidden md:table-cell">From</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sharedFiles.map((file, idx) => (
                  <tr key={file.id || idx}>
                    <td>
                      <div className="max-w-[200px] truncate">{file.originalName || file.fileName}</div>
                      <div className="text-xs text-base-content/60">{formatDate(file.sharedDate)}</div>
                    </td>
                    <td className="hidden sm:table-cell">{formatFileSize(file.fileSize)}</td>
                    <td className="hidden md:table-cell">{file.ownerName || 'User'}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs btn-square"
                        title="Download"
                        onClick={() => window.open(`http://localhost:8080/api/files/download/${file.id}`, '_blank')}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedFilesWidget;
