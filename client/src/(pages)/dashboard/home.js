import React from 'react';
import DashboardHome from '../../components/Dashboard/Home/DashboardHome';

const HomePage = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-base-300 pb-3">
        <h1 className="font-display text-[28px] font-semibold leading-9">Overview</h1>
        <p className="text-sm text-base-content/70 mt-1">
          Storage, recent files, and documents shared with you.
        </p>
      </div>
      <DashboardHome />
    </div>
  );
};

export default HomePage;
