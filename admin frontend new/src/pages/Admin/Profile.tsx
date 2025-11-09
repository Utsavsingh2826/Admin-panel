import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const Profile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
        <p className="text-gray-600 mt-1">Manage your profile information</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-teal-600 flex items-center justify-center text-white text-2xl font-bold mr-4">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{user?.name || 'Admin User'}</h3>
            <p className="text-gray-600">{user?.email || 'admin@jewelry.com'}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-semibold">
              Admin
            </span>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <p className="text-gray-600 mb-4">Profile management functionality coming soon...</p>
          <p className="text-gray-700 mb-2">This will include:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Update personal information</li>
            <li>Change password</li>
            <li>Profile picture upload</li>
            <li>Notification preferences</li>
            <li>Account security settings</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Profile;

