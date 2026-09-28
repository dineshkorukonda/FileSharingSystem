import React, { useState, useEffect } from 'react';
import { Download, Eye, Star, Share2, LayoutGrid, List, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import PDFViewer from './PDFViewer';
import ShareModal from './ShareModal';
import { downloadFile } from '../../utils/fileUtils';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'document', label: 'Documents' },
  { id: 'image', label: 'Images' },
  { id: 'starred', label: 'Starred' },
];

const FilesList = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('uploadDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [viewingFile, setViewingFile] = useState(null);
  const [starredFiles, setStarredFiles] = useState([]);
  const [sharingFile, setSharingFile] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/files/with-details', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching files: ${response.status}`);
      }

      const data = await response.json();
      setFiles(data);
      setStarredFiles(data.filter((file) => file.isStarred).map((file) => file.id));
      setError('');
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to load files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this file? This cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`http://localhost:8080/api/files/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete: ${response.status}`);
      }

      setFiles((prev) => prev.filter((file) => file.id !== id));
      toast.success('File deleted');
    } catch (err) {
      console.error('Error deleting file:', err);
      toast.error('Failed to delete file. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewFile = (file) => setViewingFile(file);

  const getViewerContent = (file) => {
    const fileDownloadUrl = `http://localhost:8080/api/files/download/${file.id}`;

    if (file.fileType === 'application/pdf') {
      return <PDFViewer file={file} />;
    }

    if (file.fileType && file.fileType.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center p-4 max-h-[70vh] overflow-auto">
          <img src={fileDownloadUrl} alt={file.originalName} className="max-h-[65vh] max-w-full object-contain" />
        </div>
      );
    }

    return (
      <div className="text-center py-10 space-y-3">
        <p className="font-medium">{file.originalName || file.fileName}</p>
        <p className="text-sm text-base-content/70">Preview is not available for this file type.</p>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => downloadFile(file)}>
          Download
        </button>
      </div>
    );
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleToggleStar = async (fileId) => {
    try {
      const isCurrentlyStarred = starredFiles.includes(fileId);
      const response = await fetch(`http://localhost:8080/api/files/star/${fileId}`, {
        method: isCurrentlyStarred ? 'DELETE' : 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update star');
      }

      if (isCurrentlyStarred) {
        setStarredFiles(starredFiles.filter((id) => id !== fileId));
        setFiles(files.map((file) => (file.id === fileId ? { ...file, isStarred: false } : file)));
        toast.success('Removed from starred');
      } else {
        setStarredFiles([...starredFiles, fileId]);
        setFiles(files.map((file) => (file.id === fileId ? { ...file, isStarred: true } : file)));
        toast.success('Added to starred');
      }
    } catch (err) {
      toast.error('Failed to update star status');
    }
  };

  const filteredFiles = files
    .filter((file) => {
      if (fileTypeFilter === 'all') return true;
      if (fileTypeFilter === 'document') {
        return (
          file.fileType?.includes('pdf')
          || file.fileType?.includes('word')
          || file.fileType?.includes('text')
          || file.fileType?.includes('doc')
        );
      }
      if (fileTypeFilter === 'image') return file.fileType?.includes('image');
      if (fileTypeFilter === 'video') return file.fileType?.includes('video');
      if (fileTypeFilter === 'starred') return starredFiles.includes(file.id);
      return true;
    })
    .filter((file) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const name = (file.originalName || file.fileName || '').toLowerCase();
      const owner = (file.ownerName || file.user?.fullName || '').toLowerCase();
      return name.includes(q) || owner.includes(q);
    })
    .sort((a, b) => {
      if (sortField === 'uploadDate') {
        const dateA = new Date(a.uploadDate || 0);
        const dateB = new Date(b.uploadDate || 0);
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      if (sortField === 'fileSize') {
        return sortDirection === 'asc'
          ? (a.fileSize || 0) - (b.fileSize || 0)
          : (b.fileSize || 0) - (a.fileSize || 0);
      }
      const valA = (a.originalName || a.fileName || '').toLowerCase();
      const valB = (b.originalName || b.fileName || '').toLowerCase();
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  const sortMark = (field) => (sortField === field ? (sortDirection === 'asc' ? ' up' : ' down') : '');

  const actions = (file) => (
    <div className="flex items-center justify-end gap-1">
      <button type="button" className="btn btn-ghost btn-xs btn-square" title="Star" onClick={() => handleToggleStar(file.id)}>
        <Star className={`h-3.5 w-3.5 ${starredFiles.includes(file.id) ? 'fill-current' : ''}`} />
      </button>
      <button type="button" className="btn btn-ghost btn-xs btn-square" title="Preview" onClick={() => handleViewFile(file)}>
        <Eye className="h-3.5 w-3.5" />
      </button>
      <button type="button" className="btn btn-ghost btn-xs btn-square" title="Share" onClick={() => setSharingFile(file)}>
        <Share2 className="h-3.5 w-3.5" />
      </button>
      <button type="button" className="btn btn-ghost btn-xs btn-square" title="Download" onClick={() => downloadFile(file)}>
        <Download className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-xs btn-square text-error"
        title="Delete"
        disabled={deletingId === file.id}
        onClick={() => handleDelete(file.id)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );

  if (loading) {
    return <p className="text-sm text-base-content/70">Loading files</p>;
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
        <button type="button" className="btn btn-sm" onClick={fetchFiles}>Try again</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {viewingFile && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-medium truncate">{viewingFile.originalName || viewingFile.fileName}</h3>
                <p className="text-xs text-base-content/60">{formatFileSize(viewingFile.fileSize)}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn btn-sm" onClick={() => downloadFile(viewingFile)}>Download</button>
                <button type="button" className="btn btn-sm" onClick={() => setViewingFile(null)}>Close</button>
              </div>
            </div>
            <div className="mt-4">{getViewerContent(viewingFile)}</div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button type="button" onClick={() => setViewingFile(null)}>close</button>
          </form>
        </dialog>
      )}

      {sharingFile && (
        <ShareModal
          file={sharingFile}
          onClose={() => setSharingFile(null)}
          onShareSuccess={() => {
            fetchFiles();
            setSharingFile(null);
          }}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <input
            type="text"
            className="input input-bordered input-sm w-full sm:w-64"
            placeholder="Search files"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="join">
            {filters.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`btn btn-sm join-item ${fileTypeFilter === tab.id ? 'btn-active' : 'btn-ghost'}`}
                onClick={() => setFileTypeFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="join">
          <button type="button" className={`btn btn-sm join-item btn-square ${viewMode === 'grid' ? 'btn-active' : 'btn-ghost'}`} onClick={() => setViewMode('grid')} title="Grid">
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button type="button" className={`btn btn-sm join-item btn-square ${viewMode === 'table' ? 'btn-active' : 'btn-ghost'}`} onClick={() => setViewMode('table')} title="Table">
            <List className="h-4 w-4" />
          </button>
          <button type="button" className="btn btn-sm join-item" onClick={fetchFiles}>Refresh</button>
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="border border-base-300 bg-base-100 p-10 text-center">
          <p className="font-medium">No files found</p>
          <p className="text-sm text-base-content/70 mt-1">
            {searchQuery ? `Nothing matches "${searchQuery}".` : 'Upload a file to get started.'}
          </p>
          {!searchQuery && (
            <a href="/dashboard/upload" className="btn btn-primary btn-sm mt-4">Upload</a>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredFiles.map((file) => (
            <div key={file.id} className="card bg-base-100 border border-base-300">
              <div className="card-body p-4">
                <div className="flex items-start justify-between gap-2">
                  <button type="button" className="text-left font-medium truncate" onClick={() => handleViewFile(file)}>
                    {file.originalName || file.fileName}
                  </button>
                  <span className="text-xs text-base-content/60 shrink-0">
                    {file.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                <div className="text-xs text-base-content/60 flex justify-between">
                  <span>{formatFileSize(file.fileSize)}</span>
                  <span>{formatDate(file.uploadDate)}</span>
                </div>
                <div className="text-xs text-base-content/60">{file.ownerName || 'You'}</div>
                {actions(file)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-100 border border-base-300">
          <table className="table table-sm">
            <thead>
              <tr>
                <th><button type="button" className="link" onClick={() => handleSort('originalName')}>Name{sortMark('originalName')}</button></th>
                <th className="hidden sm:table-cell"><button type="button" className="link" onClick={() => handleSort('fileSize')}>Size{sortMark('fileSize')}</button></th>
                <th className="hidden md:table-cell">Owner</th>
                <th className="hidden lg:table-cell">Access</th>
                <th className="hidden md:table-cell"><button type="button" className="link" onClick={() => handleSort('uploadDate')}>Date{sortMark('uploadDate')}</button></th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr key={file.id}>
                  <td>
                    <button type="button" className="link text-left" onClick={() => handleViewFile(file)}>
                      {file.originalName || file.fileName}
                    </button>
                  </td>
                  <td className="hidden sm:table-cell">{formatFileSize(file.fileSize)}</td>
                  <td className="hidden md:table-cell">{file.ownerName || 'You'}</td>
                  <td className="hidden lg:table-cell">{file.isPublic ? 'Public' : 'Private'}</td>
                  <td className="hidden md:table-cell">{formatDate(file.uploadDate)}</td>
                  <td>{actions(file)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FilesList;
