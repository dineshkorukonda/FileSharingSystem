import React from 'react';

const StorageOverview = ({ storage, isLoading }) => {
  const formatBytes = (bytes, decimals = 1) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  };

  const percentage = !storage || !storage.total
    ? 0
    : Math.min(100, Math.round((storage.used / storage.total) * 100));
  const freeStorage = Math.max(0, (storage?.total || 1000 * 1024 * 1024) - (storage?.used || 0));

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-4">
        <h2 className="text-sm font-medium border-b border-base-300 pb-2">Storage</h2>
        {isLoading ? (
          <p className="text-sm text-base-content/60 mt-3">Loading</p>
        ) : (
          <div className="mt-3 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">{formatBytes(storage?.used || 0)}</span>
              <span className="text-base-content/60">
                {percentage}% of {formatBytes(storage?.total || 1000 * 1024 * 1024)}
              </span>
            </div>
            <progress className="progress w-full" value={percentage} max="100" />
            <div className="flex justify-between text-base-content/70">
              <span>Free {formatBytes(freeStorage)}</span>
              <span>Limit {formatBytes(storage?.total || 0)}</span>
            </div>
            {storage?.fileTypes?.length > 0 && (
              <ul className="border-t border-base-300 pt-2 space-y-1">
                {storage.fileTypes.slice(0, 4).map((fileType, index) => (
                  <li key={index} className="flex justify-between text-base-content/80">
                    <span className="capitalize">{fileType.type || 'other'} ({fileType.count})</span>
                    <span>{formatBytes(fileType.size)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageOverview;
