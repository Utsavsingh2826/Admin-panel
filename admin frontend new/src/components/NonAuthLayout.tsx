import React from 'react';

interface NonAuthLayoutProps {
  children: React.ReactNode;
}

const NonAuthLayout: React.FC<NonAuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white text-center py-6 px-6">
          <div className="flex items-center justify-center mb-2">
            <i className="fas fa-gem text-3xl mr-3 text-teal-200"></i>
            <div>
              <h3 className="text-2xl font-bold mb-0">KYNA</h3>
              <small className="text-teal-100 opacity-90 text-xs">CULTIVATED WITH LOVE</small>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {children}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 text-center py-3 px-6">
          <small className="text-gray-500 text-xs">
            © 2024 Jewelry Admin. All rights reserved.
          </small>
        </div>
      </div>
    </div>
  );
};

export default NonAuthLayout;

