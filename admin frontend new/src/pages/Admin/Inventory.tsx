import React from 'react';

const Inventory: React.FC = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
        <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
          <i className="fas fa-plus mr-2"></i>
          Add Stock
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-600 mb-4">Inventory management functionality coming soon...</p>
        <p className="text-gray-700 mb-2">This will include:</p>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>Stock level tracking for all products</li>
          <li>Low stock alerts and notifications</li>
          <li>Inventory reports and analytics</li>
          <li>Stock adjustment and transfers</li>
          <li>Reorder point management</li>
        </ul>
      </div>
    </div>
  );
};

export default Inventory;

