import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6 mt-auto">
      <div className="flex justify-between items-center">
        <div>
          <small className="text-gray-500 text-sm">
            © 2024 Jewelry Admin Dashboard. All rights reserved.
          </small>
        </div>
        <div className="flex items-center space-x-4">
          <small className="text-gray-500 text-sm">Version 1.0.0</small>
          <div className="flex items-center space-x-2">
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <i className="fas fa-circle text-xs mr-1"></i>
              Online
            </span>
            <small className="text-gray-500 text-sm">
              Last updated: {new Date().toLocaleDateString()}
            </small>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

