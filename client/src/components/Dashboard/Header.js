import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Sun,
  Moon,
  Upload,
  User,
  LogOut,
  Menu,
  Folder,
  Share2,
  Settings,
} from 'lucide-react';
import FileSearchResults from '../Search/FileSearchResults';

const Header = ({ userName, userProfileImage, onMenuToggle }) => {
  const { logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [allFiles, setAllFiles] = useState([]);
  const searchContainerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchAllFiles = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const [filesRes, sharedRes] = await Promise.all([
          fetch('http://localhost:8080/api/files/with-details', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:8080/api/files/shared-with-me', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const combinedFiles = [];
        if (filesRes.ok) {
          const filesData = await filesRes.json();
          combinedFiles.push(...filesData.map((f) => ({ ...f, isOwned: true })));
        }
        if (sharedRes.ok) {
          const sharedData = await sharedRes.json();
          combinedFiles.push(...sharedData.map((f) => ({ ...f, isShared: true })));
        }
        setAllFiles(combinedFiles);
      } catch (error) {
        console.error('Error fetching files for search:', error);
      }
    };

    fetchAllFiles();

    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);
    setShowResults(true);

    searchTimeoutRef.current = setTimeout(() => {
      const lowercaseQuery = query.toLowerCase();
      const results = allFiles.filter((file) => {
        const filenameMatch = (file.fileName && file.fileName.toLowerCase().includes(lowercaseQuery))
          || (file.originalName && file.originalName.toLowerCase().includes(lowercaseQuery));
        const typeMatch = file.fileType && file.fileType.toLowerCase().includes(lowercaseQuery);
        const ownerMatch = file.user && file.user.fullName
          && file.user.fullName.toLowerCase().includes(lowercaseQuery);
        const ownerNameMatch = file.ownerName && file.ownerName.toLowerCase().includes(lowercaseQuery);
        return filenameMatch || typeMatch || ownerMatch || ownerNameMatch;
      });
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const getProfileImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/api/')) return `http://localhost:8080${url}`;
    return url;
  };

  const displayName = userName || user?.fullName || 'User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const avatarUrl = getProfileImageUrl(userProfileImage || user?.profileImageUrl);

  const go = (path) => {
    navigate(path);
  };

  return (
    <header className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-30 px-3 min-h-14">
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <button
          type="button"
          onClick={onMenuToggle}
          className="btn btn-ghost btn-sm btn-square lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="relative w-full" ref={searchContainerRef}>
          <label className="input input-bordered input-sm flex items-center gap-2 w-full">
            <Search className="h-4 w-4 opacity-60" />
            <input
              type="text"
              className="grow"
              placeholder="Search files"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.trim() && setShowResults(true)}
            />
            {searchQuery && (
              <button type="button" onClick={clearSearch} aria-label="Clear search">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
          {showResults && (
            <div className="absolute top-full left-0 mt-1 w-full min-w-[280px] z-50 bg-base-100 border border-base-300 shadow-sm p-3">
              <FileSearchResults
                results={searchResults}
                isLoading={isSearching}
                onClose={() => setShowResults(false)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 ml-2">
        <button
          type="button"
          className="btn btn-primary btn-sm hidden sm:inline-flex gap-1"
          onClick={() => go('/dashboard/upload')}
        >
          <Upload className="h-4 w-4" />
          Upload
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          onClick={() => toggleTheme()}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="dropdown dropdown-end">
          <button type="button" tabIndex={0} className="btn btn-ghost btn-sm" aria-label="Account menu">
            <span className="w-7 h-7 bg-base-300 flex items-center justify-center text-xs overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </span>
          </button>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 border border-base-300 w-52 mt-2 z-50 p-2">
            <li className="menu-title">
              <span className="font-medium text-base-content">{displayName}</span>
              <span className="text-xs font-normal truncate">{user?.email || ''}</span>
            </li>
            <li>
              <button type="button" onClick={() => go('/dashboard/profile')}>
                <User className="h-4 w-4" /> Profile
              </button>
            </li>
            <li>
              <button type="button" onClick={() => go('/dashboard/files')}>
                <Folder className="h-4 w-4" /> Files
              </button>
            </li>
            <li>
              <button type="button" onClick={() => go('/dashboard/shared')}>
                <Share2 className="h-4 w-4" /> Shared
              </button>
            </li>
            <li>
              <button type="button" onClick={() => go('/dashboard/settings')}>
                <Settings className="h-4 w-4" /> Settings
              </button>
            </li>
            <li>
              <button type="button" onClick={logout}>
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
