import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Folder,
  Upload,
  Settings,
  User,
  LogOut,
  Share2,
} from 'lucide-react';

const Sidebar = ({ onNavigate }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const [storageUsage, setStorageUsage] = useState({ usedMB: 0, totalMB: 500 });

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('http://localhost:8080/api/files/with-details', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const files = await res.json();
          const totalBytes = files.reduce((acc, f) => acc + (f.fileSize || 0), 0);
          const usedMB = (totalBytes / (1024 * 1024)).toFixed(1);
          setStorageUsage({ usedMB: parseFloat(usedMB), totalMB: 500 });
        }
      } catch (e) {
        // Keep default
      }
    };
    fetchUsage();
  }, [location.pathname]);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
    { icon: Folder, label: 'Files', path: '/dashboard/files' },
    { icon: Share2, label: 'Shared', path: '/dashboard/shared' },
    { icon: Upload, label: 'Upload', path: '/dashboard/upload' },
    { icon: User, label: 'Profile', path: '/dashboard/profile' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  const percentageUsed = Math.min(
    100,
    Math.round((storageUsage.usedMB / storageUsage.totalMB) * 100)
  );

  return (
    <aside className="flex flex-col justify-between min-h-full w-60 bg-base-100 border-r border-base-300">
      <div>
        <div className="flex items-center px-4 h-14 border-b border-base-300">
          <Link to="/" className="font-semibold text-sm" onClick={onNavigate}>
            File Sharing System
          </Link>
        </div>
        <ul className="menu w-full px-2 py-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path
              || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={onNavigate}
                  className={isActive ? 'menu-active' : ''}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="p-4 border-t border-base-300 space-y-3">
        <div className="text-xs text-base-content/70">
          <div className="flex justify-between mb-1">
            <span>Storage</span>
            <span>{percentageUsed}%</span>
          </div>
          <progress className="progress w-full" value={percentageUsed} max="100" />
          <div className="flex justify-between mt-1">
            <span>{storageUsage.usedMB} MB</span>
            <span>{storageUsage.totalMB} MB</span>
          </div>
        </div>
        <button type="button" onClick={logout} className="btn btn-ghost btn-sm w-full justify-start gap-2">
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
