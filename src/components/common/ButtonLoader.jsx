import React from 'react';
import { BiLoaderAlt } from 'react-icons/bi';

const ButtonLoader = ({ 
  isLoading, 
  children, 
  onClick, 
  className = '',
  loadingText = 'Processing...'
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`relative inline-flex items-center justify-center transition-all duration-300 ${className} ${
        isLoading ? 'cursor-not-allowed opacity-80' : ''
      }`}
    >
      {isLoading ? (
        <>
          <BiLoaderAlt className="animate-spin mr-2" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default ButtonLoader;
