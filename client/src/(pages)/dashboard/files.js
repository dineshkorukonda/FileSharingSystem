import React from 'react';
import FilesList from '../../components/Files/FilesList';

const FilesPage = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-base-300 pb-3">
        <h1 className="text-2xl font-semibold">Files</h1>
        <p className="text-sm text-base-content/70 mt-1">
          Browse, preview, star, and share your files.
        </p>
      </div>
      <FilesList />
    </div>
  );
};

export default FilesPage;
