import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'rose' | 'sky';
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

const badgeColorClasses: Record<NonNullable<NavigationItem['badgeColor']>, string> = {
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200',
  sky: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200',
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { theme } = useTheme();

  const sections: NavigationSection[] = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-pie', path: '/dashboard' },
        { id: 'analytics', label: 'Analytics', icon: 'fas fa-chart-line', path: '/analytics' },
      ],
    },
    {
      title: 'Operations',
      items: [
        { id: 'products', label: 'Products', icon: 'fas fa-gem', path: '/products', badge: '474K', badgeColor: 'emerald' },
        { id: 'orders', label: 'Orders', icon: 'fas fa-shopping-cart', path: '/orders', badge: '12', badgeColor: 'amber' },
        { id: 'customers', label: 'Customers', icon: 'fas fa-user-friends', path: '/customers' },
      ],
    },
    {
      title: 'Pricing',
      items: [
        { id: 'metal-prices', label: 'Metal Prices', icon: 'fas fa-coins', path: '/metal-prices' },
        { id: 'prices', label: 'Prices', icon: 'fas fa-tags', path: '/prices' },
      ],
    },
    {
      title: 'Engagement',
      items: [
        { id: 'communication', label: 'Communication', icon: 'fas fa-comments', path: '/communication' },
        { id: 'blogs', label: 'Blogs', icon: 'fas fa-blog', path: '/blogs' },
      ],
    },
    {
      title: 'Administration',
      items: [
        { id: 'users', label: 'Users', icon: 'fas fa-user-shield', path: '/users' },
        { id: 'promocodes', label: 'Promo Codes', icon: 'fas fa-ticket-alt', path: '/promocodes' },
      ],
    },
  ];

  const filteredSections = sections
    .map((section) => ({
      title: section.title,
      items: section.items.filter((item) => {
        if ((item.id === 'users' || item.id === 'promocodes') && user?.role !== 'superadmin') {
          return false;
        }
        return true;
      }),
    }))
    .filter((section) => section.items.length > 0);

  const linkClasses = (isActive: boolean) =>
    `group flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-teal-50 text-teal-600 ring-1 ring-teal-500/40 dark:bg-teal-500/15 dark:text-teal-200 dark:ring-teal-500/30'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
    }`;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full border-r border-slate-200/80 bg-white/95 backdrop-blur-md transition-all duration-300 dark:border-slate-800/80 dark:bg-slate-950/95 ${
          isOpen ? 'w-[300px]' : 'w-0'
        } overflow-hidden`}
      >
        <div className="flex h-full flex-col">
          {/* Brand */}
          <div className="relative px-6 pb-6 pt-8">
            <div className="absolute inset-x-2 top-2 -z-10 h-28 rounded-3xl bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-purple-500/15 blur-2xl" />
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg">
                <i className="fas fa-gem text-xl"></i>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">KYNA Admin</h1>
                <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">
                  Cultivated with Love
                </p>
              </div>
            </div>
          </div>

          {/* User profile */}
          <div className="px-6">
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm transition dark:border-slate-800/70 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-white font-semibold">
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role || 'admin'}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                  Online
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-6 flex-1 overflow-y-auto px-4 pb-6 no-scrollbar">
            <div className="space-y-6">
              {filteredSections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {section.title}
                  </p>
                  <ul className="space-y-1">
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <NavLink
                          to={item.path}
                          className={({ isActive }) => linkClasses(isActive)}
                          onClick={() => {
                            if (window.innerWidth < 768) {
                              onToggle();
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-600 transition-all duration-200 dark:bg-slate-800/70 dark:text-slate-200 ${
                                theme === 'dark' ? 'group-hover:bg-teal-600/20' : 'group-hover:bg-teal-100'
                              }`}
                            >
                              <i className={`${item.icon}`}></i>
                            </span>
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                item.badgeColor ? badgeColorClasses[item.badgeColor] : 'bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-200'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-200/70 px-6 py-5 dark:border-slate-800/70">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
                <span>Version</span>
                <span className="font-semibold text-slate-500 dark:text-slate-300">v1.0.0</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
                <span>Support</span>
                <button className="text-teal-600 transition hover:text-teal-500 dark:text-teal-300 dark:hover:text-teal-200">
                  Help Center
                </button>
              </div>
              <button
                onClick={onToggle}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-teal-500 hover:text-teal-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-200"
              >
                <i className="fas fa-angles-left"></i>
                Collapse Sidebar
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Spacer */}
      <div
        className={`transition-all duration-300 flex-shrink-0 ${
          isOpen ? 'w-[300px]' : 'w-0'
        }`}
      />
    </>
  );
};

export default Sidebar;

