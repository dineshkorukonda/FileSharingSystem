import React, { useState, useCallback } from 'react';
import UploadArea from '../../components/Upload/UploadArea';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '../../context/ThemeContext';

const UploadPage = () => {
  const [recentUploads, setRecentUploads] = useState([]);
  const { isDark } = useTheme();

  const onUploadSuccess = useCallback((fileInfo) => {
    setRecentUploads((prev) => [fileInfo, ...prev].slice(0, 5));
    toast.success(`"${fileInfo.name}" uploaded`);
  }, []);

  const onUploadError = useCallback((error, fileName) => {
    toast.error(`Failed to upload "${fileName}": ${error}`);
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-base-300 pb-3">
        <h1 className="text-2xl font-semibold">Upload</h1>
        <p className="text-sm text-base-content/70 mt-1">
          Add a file. The limit is 25MB.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <UploadArea onUploadSuccess={onUploadSuccess} onUploadError={onUploadError} />
          {recentUploads.length > 0 && (
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body p-4">
                <h2 className="text-sm font-medium border-b border-base-300 pb-2">
                  This session
                </h2>
                <ul className="mt-3 divide-y divide-base-300 text-sm">
                  {recentUploads.map((file, index) => (
                    <li key={index} className="flex items-center justify-between py-2 gap-3">
                      <span className="truncate">{file.name}</span>
                      <span className="text-base-content/60 text-xs shrink-0">
                        {new Date(file.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="card bg-base-100 border border-base-300 h-fit">
          <div className="card-body p-4 text-sm">
            <h2 className="font-medium border-b border-base-300 pb-2">Limits</h2>
            <ul className="mt-3 space-y-2 text-base-content/80">
              <li>25MB per file.</li>
              <li>PDF, documents, spreadsheets, images, and archives.</li>
              <li>Share a file from the Files page after it uploads.</li>
            </ul>
          </div>
        </div>
      </div>

      <ToastContainer position="bottom-right" theme={isDark ? 'dark' : 'light'} />
    </div>
  );
};

export default UploadPage;
