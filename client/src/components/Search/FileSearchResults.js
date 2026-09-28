import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { downloadFile } from '../../utils/fileUtils';

const FileSearchResults = ({ results = [], isLoading, onClose }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const getUniqueTypes = () => {
    const types = results.map((file) => {
      if (!file.fileType) return 'other';
      if (file.fileType.includes('pdf')) return 'pdf';
      if (file.fileType.includes('image')) return 'image';
      if (file.fileType.includes('word') || file.fileType.includes('document')) return 'document';
      if (file.fileType.includes('sheet') || file.fileType.includes('excel')) return 'spreadsheet';
      return 'other';
    });
    return ['all', ...new Set(types)];
  };

  const matchesFilter = (file, filter) => {
    if (filter === 'all') return true;
    if (!file.fileType) return filter === 'other';
    switch (filter) {
      case 'pdf':
        return file.fileType.includes('pdf');
      case 'image':
        return file.fileType.includes('image');
      case 'document':
        return file.fileType.includes('word') || file.fileType.includes('document');
      case 'spreadsheet':
        return file.fileType.includes('sheet') || file.fileType.includes('excel');
      case 'other':
        return (
          !file.fileType.includes('pdf')
          && !file.fileType.includes('image')
          && !file.fileType.includes('word')
          && !file.fileType.includes('document')
          && !file.fileType.includes('sheet')
          && !file.fileType.includes('excel')
        );
      default:
        return true;
    }
  };

  const labelFor = (type) => {
    const names = { all: 'All', pdf: 'PDFs', image: 'Images', document: 'Docs', spreadsheet: 'Sheets', other: 'Other' };
    return names[type] || type;
  };

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
      return 'Recently';
    }
  };

  if (isLoading) {
    return <p className="text-sm text-base-content/70 p-2">Searching</p>;
  }

  if (results.length === 0) {
    return <p className="text-sm text-base-content/70 p-2">No matching files.</p>;
  }

  const uniqueTypes = getUniqueTypes();
  const filteredResults = results.filter((file) => matchesFilter(file, activeFilter));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span>{results.length} results</span>
        {uniqueTypes.length > 1 && (
          <div className="flex gap-1 flex-wrap justify-end">
            {uniqueTypes.map((type) => (
              <button
                key={type}
                type="button"
                className={`btn btn-xs ${activeFilter === type ? 'btn-active' : 'btn-ghost'}`}
                onClick={() => setActiveFilter(type)}
              >
                {labelFor(type)}
              </button>
            ))}
          </div>
        )}
      </div>
      <ul className="max-h-80 overflow-y-auto divide-y divide-base-300">
        {filteredResults.map((file) => (
          <li key={file.id} className="py-2 flex items-center justify-between gap-2">
            <button
              type="button"
              className="text-left min-w-0"
              onClick={() => {
                onClose && onClose();
                window.location.href = `/dashboard/files?selected=${file.id}`;
              }}
            >
              <div className="text-sm truncate">{file.fileName || file.originalName}</div>
              <div className="text-xs text-base-content/60">
                {formatFileSize(file.fileSize)} · {formatDate(file.uploadDate || file.sharedDate)}
              </div>
            </button>
            <div className="shrink-0">
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={() => window.open(`http://localhost:8080/api/files/download/${file.id}`, '_blank')}
              >
                View
              </button>
              <button type="button" className="btn btn-ghost btn-xs" onClick={() => downloadFile(file)}>
                Download
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileSearchResults;
