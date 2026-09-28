import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, Folder, Share2, Search } from 'lucide-react';

const actions = [
  { icon: Upload, label: 'Upload', description: 'Add a file', path: '/dashboard/upload' },
  { icon: Folder, label: 'Files', description: 'Browse your drive', path: '/dashboard/files' },
  { icon: Share2, label: 'Shared', description: 'Manage access', path: '/dashboard/shared' },
  { icon: Search, label: 'Find', description: 'Open the file list', path: '/dashboard/files' },
];

const QuickActions = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.label} to={action.path} className="card bg-base-100 border border-base-300 hover:border-base-content/30">
            <div className="card-body p-4">
              <Icon className="h-4 w-4" />
              <div className="font-medium text-sm mt-2">{action.label}</div>
              <div className="text-xs text-base-content/60">{action.description}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default QuickActions;
