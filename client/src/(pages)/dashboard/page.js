import React, { useState } from 'react';
import Header from '../../components/Dashboard/Header';
import Sidebar from '../../components/Dashboard/Sidebar';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="drawer lg:drawer-open min-h-screen bg-base-200">
      <input
        id="dashboard-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={isMobileOpen}
        onChange={(e) => setIsMobileOpen(e.target.checked)}
      />
      <div className="drawer-content flex flex-col min-h-screen">
        <ToastContainer position="bottom-right" autoClose={3000} theme={isDark ? 'dark' : 'light'} />
        <Header
          userName={user?.fullName || 'User'}
          userProfileImage={user?.profileImageUrl}
          onMenuToggle={() => setIsMobileOpen(true)}
        />
        <main className="flex-1 w-full px-4 py-6 sm:px-8">
          <Outlet />
        </main>
      </div>
      <div className="drawer-side z-40">
        <label htmlFor="dashboard-drawer" aria-label="Close sidebar" className="drawer-overlay" />
        <Sidebar onNavigate={() => setIsMobileOpen(false)} />
      </div>
    </div>
  );
};

export default Dashboard;
