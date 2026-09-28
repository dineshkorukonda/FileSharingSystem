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
            <div className="flex items-center gap-4">
              <div
                className="grid h-[120px] w-[120px] place-items-center rounded-full"
                style={{
                  background: `conic-gradient(#2563eb ${percentage * 3.6}deg, #e2e8f0 0deg)`,
                }}
              >
                <div className="grid h-[84px] w-[84px] place-items-center rounded-full bg-white text-center">
                  <div>
                    <div className="font-display text-lg font-semibold">{formatBytes(storage?.used || 0)}</div>
                    <div className="text-[11px] text-slate-400">{percentage}%</div>
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium">{formatBytes(storage?.used || 0)} used</div>
                <div className="text-slate-500">of {formatBytes(storage?.total || 1000 * 1024 * 1024)}</div>
                <progress className="progress progress-primary mt-3 w-full" value={percentage} max="100" />
              </div>
            </div>
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
