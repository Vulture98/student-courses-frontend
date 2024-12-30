import React from "react";
import { FaFacebook, FaTwitter, FaLinkedin, FaHeart } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-lg">
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row justify-between items-center px-4">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="text-sm md:text-base">Made with</span>
            <FaHeart className="text-red-400 animate-pulse" />
            <span className="text-sm md:text-base">by Academy Team</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transform hover:scale-110 hover:text-blue-300 transition-all duration-200"
            >
              <FaFacebook size={20} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transform hover:scale-110 hover:text-blue-300 transition-all duration-200"
            >
              <FaTwitter size={20} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transform hover:scale-110 hover:text-blue-300 transition-all duration-200"
            >
              <FaLinkedin size={20} />
            </a>
          </div>
          
          <div className="mt-4 md:mt-0 text-sm md:text-base">
            &copy; {new Date().getFullYear()} Academy. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
