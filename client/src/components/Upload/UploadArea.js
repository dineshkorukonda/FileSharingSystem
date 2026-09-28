import React, { useState, useRef } from 'react';
import { CloudUpload } from 'lucide-react';

const UploadArea = ({ onUploadSuccess, onUploadError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    setUploadError('');
    const file = files[0];
    setSelectedFile({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'pending',
    });
    uploadFile(file);
  };

  const uploadFile = async (file) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setSelectedFile((prev) => ({
            ...prev,
            progress: percent,
            status: percent === 100 ? 'processing' : 'uploading',
          }));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          let response = {};
          try {
            response = JSON.parse(xhr.responseText);
          } catch {
            response = {};
          }
          setSelectedFile((prev) => ({
            ...prev,
            progress: 100,
            status: 'completed',
            id: response.id || null,
          }));
          if (onUploadSuccess) {
            onUploadSuccess({
              id: response.id,
              name: file.name,
              size: file.size,
              type: file.type,
              timestamp: new Date().toISOString(),
            });
          }
        } else {
          const errorMsg = `Upload failed (${xhr.statusText || 'Server error'})`;
          setUploadError(errorMsg);
          setSelectedFile((prev) => ({ ...prev, status: 'error' }));
          if (onUploadError) onUploadError(errorMsg, file.name);
        }
        setIsUploading(false);
      });

      xhr.addEventListener('error', () => {
        const errorMsg = 'Upload failed: Network connection error';
        setUploadError(errorMsg);
        setSelectedFile((prev) => ({ ...prev, status: 'error' }));
        if (onUploadError) onUploadError('Network error', file.name);
        setIsUploading(false);
      });

      xhr.open('POST', 'http://localhost:8080/api/files/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
      xhr.send(formData);
    } catch (error) {
      const errorMsg = error.message || 'Unknown error occurred';
      setUploadError(errorMsg);
      setSelectedFile((prev) => ({ ...prev, status: 'error' }));
      if (onUploadError) onUploadError(errorMsg, file.name);
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      <div
        className={`flex min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center ${
          isDragging ? 'border-[#2563eb] bg-blue-50' : 'border-[#2563eb]/50 bg-[#eff6ff]'
        } ${isUploading ? 'pointer-events-none' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {!selectedFile ? (
          <div className="space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#2563eb] shadow-sm">
              <CloudUpload className="h-7 w-7" />
            </div>
            <div className="font-display text-lg font-semibold text-slate-900">Drag and drop a file here</div>
            <p className="text-sm text-slate-500">PDF, images, documents, and archives. 25MB max.</p>
            <span className="btn btn-primary btn-sm mt-2 rounded-full">Choose file</span>
          </div>
        ) : (
          <div className="w-full max-w-md text-left" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-medium">{selectedFile.name}</div>
                <div className="text-xs text-base-content/60">
                  {formatBytes(selectedFile.size)} · {selectedFile.status}
                </div>
              </div>
              {selectedFile.status !== 'completed' && (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    setSelectedFile(null);
                    setUploadError('');
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
            {selectedFile.status !== 'completed' && selectedFile.status !== 'error' && (
              <progress className="progress w-full mt-3" value={selectedFile.progress} max="100" />
            )}
            {selectedFile.status === 'completed' && (
              <div className="flex gap-2 mt-3">
                <button type="button" className="btn btn-sm" onClick={() => setSelectedFile(null)}>
                  Upload another
                </button>
                <a href="/dashboard/files" className="btn btn-primary btn-sm">
                  View files
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {uploadError && <div className="alert alert-error text-sm">{uploadError}</div>}
    </div>
  );
};

export default UploadArea;
