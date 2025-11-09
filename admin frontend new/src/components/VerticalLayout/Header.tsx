import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/auth/actions';
import { RootState } from '../../store';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
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

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      {/* Left Side */}
      <div className="flex items-center">
        {/* Sidebar Toggle */}
        <button
          onClick={onToggleSidebar}
          className="mr-4 text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          <i className="fas fa-bars text-xl"></i>
        </button>

        {/* Page Title */}
        <div>
          <h5 className="text-gray-800 font-semibold mb-0">Jewelry Admin Dashboard</h5>
          <small className="text-gray-500 text-xs">Manage your jewelry business</small>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button className="relative text-gray-600 hover:text-gray-900 focus:outline-none">
            <i className="fas fa-bell text-xl"></i>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </button>
        </div>

        {/* Messages */}
        <div className="relative">
          <button className="relative text-gray-600 hover:text-gray-900 focus:outline-none">
            <i className="fas fa-envelope text-xl"></i>
            <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              5
            </span>
          </button>
        </div>

        {/* User Menu */}
        <div className="relative user-menu-container">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold text-gray-800">
                {user?.name || 'Admin User'}
              </div>
              <small className="text-xs text-gray-500">admin</small>
            </div>
            <i className="fas fa-chevron-down text-xs"></i>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-200">
                <div className="font-semibold text-sm text-gray-800">{user?.name || 'Admin User'}</div>
                <small className="text-xs text-gray-500">{user?.email || 'admin@jewelry.com'}</small>
              </div>
              <button
                onClick={handleProfile}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <i className="fas fa-user mr-2 w-4"></i>
                Profile
              </button>
              <button
                onClick={handleSettings}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <i className="fas fa-cog mr-2 w-4"></i>
                Settings
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <i className="fas fa-sign-out-alt mr-2 w-4"></i>
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

