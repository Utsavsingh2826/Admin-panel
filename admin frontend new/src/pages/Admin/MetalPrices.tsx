import React from 'react';

const MetalPrices: React.FC = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Metal Prices</h2>
        <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
          <i className="fas fa-sync mr-2"></i>
          Refresh Prices
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-600 mb-4">Metal prices management functionality coming soon...</p>
        <p className="text-gray-700 mb-2">This will include:</p>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>Real-time gold, silver, and platinum prices</li>
          <li>Price history and trends</li>
          <li>Automatic price updates</li>
          <li>Price alerts and notifications</li>
          <li>Price impact on product pricing</li>
        </ul>
      </div>
    </div>
  );
};

export default MetalPrices;

