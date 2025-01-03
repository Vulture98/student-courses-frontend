import React from 'react';
import { BiLoaderAlt } from 'react-icons/bi';

const OverlayLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center space-y-4">
        <BiLoaderAlt className="animate-spin text-4xl text-blue-600" />
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default OverlayLoader;
