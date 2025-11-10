import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

// Layout Components
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { ThemeProvider, useTheme } from '../../context/ThemeContext';

const LayoutShell: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme } = useTheme();

  // Handle sidebar toggle
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once on mount

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`flex min-h-screen bg-gray-50 transition-colors duration-300 dark:bg-slate-950 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col bg-white/60 backdrop-blur dark:bg-slate-950/60">
        {/* Header */}
        <Header onToggleSidebar={toggleSidebar} />
        
        {/* Page Content */}
        <main className="flex-1 px-6 pb-10 pt-8 transition-colors duration-300 md:px-8 md:pt-10">
          <Outlet />
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

const VerticalLayout: React.FC = () => {
  return (
    <ThemeProvider>
      <LayoutShell />
    </ThemeProvider>
  );
};

export default VerticalLayout;

