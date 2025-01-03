import React from 'react';

const ActionLoader = ({ isLoading, message = 'Processing...' }) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-sm font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
};

export default ActionLoader;
