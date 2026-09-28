import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, Eye } from 'lucide-react';
import StorageOverview from './StorageOverview';
import RecentFiles from './RecentFiles';
import QuickActions from './QuickActions';
import SharedFilesWidget from './SharedFilesWidget';

const DashboardHome = () => {
  const [recentFiles, setRecentFiles] = useState([]);
  const [starredFiles, setStarredFiles] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [sharedCount, setSharedCount] = useState(0);
  const [storage, setStorage] = useState({
    used: 0,
    total: 1000 * 1024 * 1024,
    fileTypes: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const filesResponse = await fetch('http://localhost:8080/api/files/with-details', { headers });
        if (filesResponse.ok) {
          const filesData = await filesResponse.json();
          setAllFiles(filesData);

          const sortedFiles = [...filesData].sort(
            (a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)
          );
          setRecentFiles(sortedFiles.slice(0, 5));

          const usedStorage = filesData.reduce((total, file) => total + (file.fileSize || 0), 0);

          const fileTypeMap = {};
          filesData.forEach((file) => {
            const type = file.fileType ? file.fileType.split('/')[1] || file.fileType : 'other';
            if (!fileTypeMap[type]) {
              fileTypeMap[type] = { type, count: 0, size: 0 };
            }
            fileTypeMap[type].count += 1;
            fileTypeMap[type].size += file.fileSize || 0;
          });

          setStorage({
            used: usedStorage,
            total: 1000 * 1024 * 1024,
            fileTypes: Object.values(fileTypeMap),
          });
        }

        const starredResponse = await fetch('http://localhost:8080/api/files/starred', { headers });
        if (starredResponse.ok) {
          setStarredFiles(await starredResponse.json());
        }

        const sharedResponse = await fetch('http://localhost:8080/api/files/shared-with-me', { headers });
        if (sharedResponse.ok) {
          const sharedData = await sharedResponse.json();
          setSharedCount(sharedData.length);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatBytes = (bytes, decimals = 1) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  };

  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = `http://localhost:8080/api/files/download/${file.id}`;
    link.download = file.originalName || file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = [
    { label: 'Files', value: allFiles.length },
    { label: 'Used', value: formatBytes(storage.used) },
    { label: 'Shared with you', value: sharedCount },
    { label: 'Starred', value: starredFiles.length },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="card bg-base-100 border border-base-300">
            <div className="card-body p-4">
              <div className="text-xs text-base-content/60">{stat.label}</div>
              <div className="text-2xl font-semibold mt-1">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-sm font-medium border-b border-base-300 pb-2 mb-3">Actions</h2>
        <QuickActions />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecentFiles files={recentFiles} isLoading={isLoading} />
          <SharedFilesWidget />
        </div>
        <div className="space-y-6">
          <StorageOverview storage={storage} isLoading={isLoading} />
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body p-4">
              <div className="flex items-center justify-between border-b border-base-300 pb-2">
                <h2 className="text-sm font-medium">Starred</h2>
                {starredFiles.length > 0 && (
                  <Link to="/dashboard/files" className="link link-hover text-sm">View all</Link>
                )}
              </div>
              {isLoading ? (
                <p className="text-sm text-base-content/60 mt-3">Loading</p>
              ) : starredFiles.length > 0 ? (
                <ul className="mt-3 divide-y divide-base-300">
                  {starredFiles.slice(0, 3).map((file) => (
                    <li key={file.id} className="flex items-center justify-between gap-2 py-2">
                      <div className="min-w-0">
                        <div className="text-sm truncate">{file.originalName || file.fileName}</div>
                        <div className="text-xs text-base-content/60">{formatBytes(file.fileSize)}</div>
                      </div>
                      <div className="shrink-0">
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs btn-square"
                          title="View"
                          onClick={() => window.open(`http://localhost:8080/api/files/download/${file.id}`, '_blank')}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs btn-square"
                          title="Download"
                          onClick={() => handleDownload(file)}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-base-content/60 mt-3">No starred files.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
