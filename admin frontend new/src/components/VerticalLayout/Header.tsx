import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/auth/actions';
import { RootState } from '../../store';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
    setShowUserMenu(false);
  };

  const handleSettings = () => {
    navigate('/settings');
    setShowUserMenu(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const iconButtonClasses =
    'relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/70 text-slate-500 transition hover:border-teal-500 hover:text-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:border-slate-700 dark:text-slate-300 dark:hover:border-teal-400 dark:hover:text-teal-200';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md transition-colors duration-300 md:px-8 dark:border-slate-800 dark:bg-slate-900/75">
      {/* Left Side */}
      <div className="flex items-center gap-3">
        {/* Sidebar Toggle */}
        <button
          onClick={onToggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/70 text-slate-500 transition hover:border-teal-500 hover:text-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:border-slate-700 dark:text-slate-300 dark:hover:border-teal-400 dark:hover:text-teal-200"
          aria-label="Toggle sidebar"
        >
          <i className="fas fa-bars text-lg"></i>
        </button>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-300">Jewellery Intelligence</p>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Jewelry Admin Dashboard</h1>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={iconButtonClasses}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <i className="fas fa-sun text-base"></i>
          ) : (
            <i className="fas fa-moon text-base"></i>
          )}
        </button>

        {/* Notifications */}
        <button className={iconButtonClasses} aria-label="Notifications">
          <i className="fas fa-bell text-base"></i>
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
            3
          </span>
        </button>

        {/* Messages */}
        <button className={iconButtonClasses} aria-label="Messages">
          <i className="fas fa-envelope text-base"></i>
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-semibold text-white">
            5
          </span>
        </button>

        {/* User Menu */}
        <div className="relative user-menu-container">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-1.5 text-slate-600 transition hover:border-teal-500/60 hover:bg-teal-50 hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:text-slate-200 dark:hover:border-teal-400/60 dark:hover:bg-teal-500/10 dark:hover:text-teal-200"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || 'admin@jewelry.com'}</p>
            </div>
            <i className={`fas fa-chevron-down text-xs transition ${showUserMenu ? 'rotate-180' : ''}`}></i>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-xl transition dark:border-slate-700 dark:bg-slate-900/95">
              <div className="bg-slate-50 px-4 py-3 dark:bg-slate-800/80">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || 'admin@jewelry.com'}</p>
              </div>
              <button
                onClick={handleProfile}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-teal-600 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-teal-200"
              >
                <i className="fas fa-user text-sm"></i>
                Profile
              </button>
              <button
                onClick={handleSettings}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-teal-600 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-teal-200"
              >
                <i className="fas fa-cog text-sm"></i>
                Settings
              </button>
              <div className="my-1 border-t border-slate-200 dark:border-slate-800"></div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
              >
                <i className="fas fa-sign-out-alt text-sm"></i>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

