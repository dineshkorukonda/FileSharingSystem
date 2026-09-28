import React from 'react';
import FilesList from '../../components/Files/FilesList';

const FilesPage = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-base-300 pb-3">
        <h1 className="font-display text-[28px] font-semibold leading-9">My Drive</h1>
        <p className="mt-1 text-sm text-slate-500">
          Browse, preview, star, and share your files.
        </p>
      </div>
      <FilesList />
    </div>
  );
};

export default FilesPage;
