import React, { useState, useEffect } from 'react';
import { Download, Eye, Star, Share2, LayoutGrid, List, Trash2, Info, X } from 'lucide-react';
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
  const [detailsFile, setDetailsFile] = useState(null);

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

  const sortMark = (field) => (sortField === field ? (sortDirection === 'asc' ? ' ↑' : ' ↓') : '');

  const fileTone = (file) => {
    const type = file.fileType || '';
    const name = file.originalName || file.fileName || '';
    const ext = (name.includes('.') ? name.split('.').pop() : 'FILE').slice(0, 4).toUpperCase();
    if (type.includes('pdf')) return { label: 'PDF', className: 'bg-rose-50 text-rose-600' };
    if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) {
      return { label: ext, className: 'bg-teal-50 text-teal-700' };
    }
    if (type.startsWith('image/') || type.startsWith('video/') || type.startsWith('audio/')) {
      return { label: ext, className: 'bg-violet-50 text-violet-600' };
    }
    if (type.includes('zip') || type.includes('compressed')) {
      return { label: ext, className: 'bg-amber-50 text-amber-700' };
    }
    return { label: ext, className: 'bg-blue-50 text-blue-700' };
  };

  const accessPill = (file) => (
    <span className={`sv-pill ${file.isPublic ? 'bg-teal-500/10 text-teal-700' : 'bg-amber-500/10 text-amber-800'}`}>
      {file.isPublic ? 'Public' : 'Private'}
    </span>
  );

  const actions = (file) => (
    <div className="flex items-center justify-end gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
      <button type="button" className="btn btn-ghost btn-xs btn-square" title="Star" onClick={() => handleToggleStar(file.id)}>
        <Star className={`h-3.5 w-3.5 ${starredFiles.includes(file.id) ? 'fill-amber-400 text-amber-500' : ''}`} />
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
      <button type="button" className="btn btn-ghost btn-xs btn-square" title="Details" onClick={() => setDetailsFile(file)}>
        <Info className="h-3.5 w-3.5" />
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

      <div className={`grid gap-4 ${detailsFile ? 'xl:grid-cols-[minmax(0,1fr)_320px]' : ''}`}>
        <div>
          {filteredFiles.length === 0 ? (
            <div className="sv-card p-10 text-center">
              <p className="font-medium">No files found</p>
              <p className="mt-1 text-sm text-slate-500">
                {searchQuery ? `Nothing matches "${searchQuery}".` : 'Upload a file to get started.'}
              </p>
              {!searchQuery && (
                <a href="/dashboard/upload" className="btn btn-primary btn-sm mt-4 rounded-full">Upload</a>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFiles.map((file) => {
                const tone = fileTone(file);
                return (
                  <div key={file.id} className="group sv-card p-4 transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-4px_rgba(37,99,235,0.08)]">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`sv-glyph ${tone.className}`}>{tone.label}</span>
                      {accessPill(file)}
                    </div>
                    <button type="button" className="mt-3 block w-full truncate text-left text-sm font-medium" onClick={() => handleViewFile(file)}>
                      {file.originalName || file.fileName}
                    </button>
                    <div className="mt-1 flex justify-between text-xs text-slate-500">
                      <span>{formatFileSize(file.fileSize)}</span>
                      <span>{formatDate(file.uploadDate)}</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-400">{file.ownerName || 'You'}</div>
                    <div className="mt-2">{actions(file)}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="sv-card overflow-x-auto">
              <table className="table table-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th><button type="button" onClick={() => handleSort('originalName')}>Name{sortMark('originalName')}</button></th>
                    <th className="hidden sm:table-cell"><button type="button" onClick={() => handleSort('fileSize')}>Size{sortMark('fileSize')}</button></th>
                    <th className="hidden md:table-cell">Owner</th>
                    <th className="hidden lg:table-cell">Access</th>
                    <th className="hidden md:table-cell"><button type="button" onClick={() => handleSort('uploadDate')}>Modified{sortMark('uploadDate')}</button></th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file) => {
                    const tone = fileTone(file);
                    return (
                      <tr key={file.id} className="group h-14 hover:bg-slate-100">
                        <td>
                          <button type="button" className="flex items-center gap-3 text-left" onClick={() => handleViewFile(file)}>
                            <span className={`sv-glyph ${tone.className}`}>{tone.label}</span>
                            <span className="max-w-[220px] truncate font-medium">{file.originalName || file.fileName}</span>
                          </button>
                        </td>
                        <td className="hidden sm:table-cell">{formatFileSize(file.fileSize)}</td>
                        <td className="hidden md:table-cell">{file.ownerName || 'You'}</td>
                        <td className="hidden lg:table-cell">{accessPill(file)}</td>
                        <td className="hidden md:table-cell">{formatDate(file.uploadDate)}</td>
                        <td>{actions(file)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {detailsFile && (
          <aside className="sv-card h-fit p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">File details</div>
                <h2 className="mt-1 break-all text-base font-semibold">{detailsFile.originalName || detailsFile.fileName}</h2>
              </div>
              <button type="button" className="btn btn-ghost btn-xs btn-square" onClick={() => setDetailsFile(null)} aria-label="Close details">
                <X className="h-4 w-4" />
              </button>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Size</dt>
                <dd>{formatFileSize(detailsFile.fileSize)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Uploaded</dt>
                <dd>{formatDate(detailsFile.uploadDate)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Owner</dt>
                <dd>{detailsFile.ownerName || 'You'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Access</dt>
                <dd>{accessPill(detailsFile)}</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="btn btn-primary btn-sm rounded-full" onClick={() => handleViewFile(detailsFile)}>Preview</button>
              <button type="button" className="btn btn-sm" onClick={() => setSharingFile(detailsFile)}>Share</button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default FilesList;
