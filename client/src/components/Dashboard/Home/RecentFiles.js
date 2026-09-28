import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Download, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecentFiles = ({ files, isLoading }) => {
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

  const handleDownload = (file) => {
    const url = `http://localhost:8080/api/files/download/${file.id}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = file.originalName || file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (file) => {
    window.open(`http://localhost:8080/api/files/download/${file.id}`, '_blank');
  };

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
          <h2 className="text-sm font-medium">Recent files</h2>
          <Link to="/dashboard/files" className="link link-hover text-sm">View all</Link>
        </div>
        {isLoading ? (
          <p className="p-4 text-sm text-base-content/60">Loading</p>
        ) : !files || files.length === 0 ? (
          <p className="p-4 text-sm text-base-content/60">No files yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="hidden sm:table-cell">Size</th>
                  <th className="hidden md:table-cell">Uploaded</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {files.map((file, idx) => (
                  <tr key={file.id || idx}>
                    <td className="max-w-[220px] truncate">{file.originalName || file.fileName}</td>
                    <td className="hidden sm:table-cell">{formatFileSize(file.fileSize)}</td>
                    <td className="hidden md:table-cell">{formatDate(file.uploadDate)}</td>
                    <td className="text-right">
                      <button type="button" className="btn btn-ghost btn-xs btn-square" onClick={() => handlePreview(file)} title="View">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" className="btn btn-ghost btn-xs btn-square" onClick={() => handleDownload(file)} title="Download">
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

export default RecentFiles;
