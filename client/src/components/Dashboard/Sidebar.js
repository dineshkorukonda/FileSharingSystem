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
  Plus,
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
    { icon: Folder, label: 'My Drive', path: '/dashboard/files' },
    { icon: Share2, label: 'Shared with me', path: '/dashboard/shared' },
    { icon: Upload, label: 'Upload', path: '/dashboard/upload' },
    { icon: User, label: 'Profile', path: '/dashboard/profile' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  const percentageUsed = Math.min(
    100,
    Math.round((storageUsage.usedMB / storageUsage.totalMB) * 100)
  );

  return (
    <aside className="flex min-h-full w-[260px] flex-col justify-between border-r border-slate-200 bg-white">
      <div>
        <div className="flex h-[68px] items-center px-5">
          <Link to="/" className="font-display text-base font-semibold" onClick={onNavigate}>
            File Sharing
          </Link>
        </div>
        <div className="px-4">
          <Link
            to="/dashboard/upload"
            onClick={onNavigate}
            className="btn btn-primary w-full rounded-full shadow-[0_10px_25px_-3px_rgba(37,99,235,0.35)]"
          >
            <Plus className="h-4 w-4" />
            New upload
          </Link>
        </div>
        <ul className="menu mt-3 w-full px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path
              || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={onNavigate}
                  className={isActive ? 'bg-blue-50 font-medium text-[#2563eb]' : 'text-slate-600'}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="space-y-3 border-t border-slate-200 p-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          <div className="flex justify-between font-medium text-slate-800">
            <span>Storage</span>
            <span>{percentageUsed}%</span>
          </div>
          <progress className="progress progress-primary mt-2 w-full" value={percentageUsed} max="100" />
          <div className="mt-1 flex justify-between">
            <span>{storageUsage.usedMB} MB used</span>
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
