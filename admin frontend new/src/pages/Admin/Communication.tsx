import React from 'react';

const Communication: React.FC = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Communication</h2>
        <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
          <i className="fas fa-plus mr-2"></i>
          New Message
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-600 mb-4">Communication management functionality coming soon...</p>
        <p className="text-gray-700 mb-2">This will include:</p>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>WhatsApp integration for customer communication</li>
          <li>Email management and templates</li>
          <li>Message history and tracking</li>
          <li>Automated responses and notifications</li>
          <li>Communication analytics</li>
        </ul>
      </div>
    </div>
  );
};

export default Communication;

