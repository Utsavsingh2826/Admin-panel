import React from 'react';

const Analytics: React.FC = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Analytics & Reports</h2>
        <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
          <i className="fas fa-download mr-2"></i>
          Export Report
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-600 mb-4">Analytics and reporting functionality coming soon...</p>
        <p className="text-gray-700 mb-2">This will include:</p>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>Sales analytics and trends</li>
          <li>Product performance reports</li>
          <li>Customer analytics</li>
          <li>Revenue and profit analysis</li>
          <li>Custom report generation</li>
        </ul>
      </div>
    </div>
  );
};

export default Analytics;

