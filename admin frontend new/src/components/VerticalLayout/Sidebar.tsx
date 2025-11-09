import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: string;
  badgeColor?: 'primary' | 'warning' | 'danger' | 'success';
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      path: '/dashboard'
    },
    {
      id: 'products',
      label: 'Products',
      icon: 'fas fa-gem',
      path: '/products',
      badge: '474K',
      badgeColor: 'primary'
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: 'fas fa-shopping-cart',
      path: '/orders',
      badge: '12',
      badgeColor: 'warning'
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: 'fas fa-users',
      path: '/customers'
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: 'fas fa-boxes',
      path: '/inventory',
      badge: '5',
      badgeColor: 'danger'
    },
    {
      id: 'metal-prices',
      label: 'Metal Prices',
      icon: 'fas fa-coins',
      path: '/metal-prices'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'fas fa-chart-line',
      path: '/analytics'
    },
    {
      id: 'blogs',
      label: 'Blogs',
      icon: 'fas fa-blog',
      path: '/blogs'
    },
    {
      id: 'communication',
      label: 'Communication',
      icon: 'fas fa-comments',
      path: '/communication'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'fas fa-cog',
      path: '/settings'
    },
    {
      id: 'users',
      label: 'Users',
      icon: 'fas fa-user-shield',
      path: '/users'
    }
  ].filter(item => {
    // Only show Users menu for superadmin users
    if (item.id === 'users' && user?.role !== 'superadmin') {
      return false;
    }
    return true;
  });

  const getBadgeColorClass = (color?: string) => {
    switch (color) {
      case 'primary':
        return 'bg-teal-600';
      case 'warning':
        return 'bg-yellow-500';
      case 'danger':
        return 'bg-red-500';
      case 'success':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-teal-600 to-teal-700 transition-all duration-300 z-50 ${
          isOpen ? 'w-[280px]' : 'w-0'
        } overflow-hidden shadow-xl`}
      >
        <div className="flex flex-col h-full py-6">
          {/* Logo */}
          <div className="text-center mb-6 px-4">
            <div className="flex items-center justify-center mb-2">
              <i className="fas fa-gem text-3xl text-teal-200 mr-2"></i>
              <div>
                <h4 className="text-white font-bold text-lg mb-0">KYNA</h4>
                <small className="text-teal-100 text-xs">CULTIVATED WITH LOVE</small>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="px-4 mb-6">
            <div className="flex items-center bg-white bg-opacity-10 rounded-lg p-3">
              <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3">
                <i className="fas fa-user text-white"></i>
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold text-sm">
                  {user?.name || 'Admin User'}
                </div>
                <small className="text-teal-100 text-xs">admin</small>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 ${
                        isActive
                          ? 'bg-white bg-opacity-20 text-white'
                          : 'text-teal-100 hover:bg-white hover:bg-opacity-10'
                      }`
                    }
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        onToggle();
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <i className={`${item.icon} mr-3 w-5 text-center`}></i>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`${getBadgeColorClass(item.badgeColor)} text-white text-xs px-2 py-1 rounded-full`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="px-4 mt-auto">
            <div className="text-center">
              <small className="text-teal-200 text-xs">Jewelry Admin v1.0</small>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Spacer */}
      <div
        className={`transition-all duration-300 flex-shrink-0 ${
          isOpen ? 'w-[280px]' : 'w-0'
        }`}
      />
    </>
  );
};

export default Sidebar;

