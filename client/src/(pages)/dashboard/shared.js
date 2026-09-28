import React from 'react';
import SharedFiles from '../../components/Shared/SharedFiles';

const SharedPage = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-base-300 pb-3">
        <h1 className="font-display text-[28px] font-semibold leading-9">Shared with me</h1>
        <p className="text-sm text-base-content/70 mt-1">
          Files shared with you, and files you have shared.
        </p>
      </div>
      <SharedFiles />
    </div>
  );
};

export default SharedPage;
