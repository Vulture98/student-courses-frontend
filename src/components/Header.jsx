import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BiLoaderAlt } from "react-icons/bi";
import { clearAuthStatus, broadcastAuthChange } from "../utils/auth";
import { FaGraduationCap, FaSignOutAlt, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === "/dashboard";
  const adminDashboard = location.pathname === "/admin/dashboard" || location.pathname.startsWith("/admin/students/");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async (role) => {
    setIsLoggingOut(true);
    try {
      if (role === "user") {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/logout`,
          {},
          { withCredentials: true }
        );
        clearAuthStatus('user_auth_status');
        broadcastAuthChange('LOGOUT', 'user');
      } else if (role === "admin") {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/logout`,
          {},
          { withCredentials: true }
        );
        clearAuthStatus('admin_auth_status');
        broadcastAuthChange('LOGOUT', 'admin');
      }
      toast.success("Logout successful!");
      navigate(role === 'admin' ? '/admin/logout/login' : '/logout');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-lg w-full top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <Link
            to={isDashboard ? "/dashboard" : "/"}
            className="flex items-center space-x-3 group"
          >
            <div className="bg-white p-2 rounded-lg shadow-md transform group-hover:scale-105 transition-transform duration-200">
              <FaGraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold tracking-wider group-hover:text-blue-100 transition-colors">
              Academy
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileDrawer}
            className="md:hidden text-white hover:text-blue-200 transition-colors"
          >
            {mobileDrawerOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Navigation */}
          <nav className={`${
            mobileDrawerOpen ? 'block absolute top-full left-0 right-0 bg-blue-700 shadow-lg md:shadow-none' : 'hidden'
          } md:block md:static md:bg-transparent`}>
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 p-4 md:p-0">
              {isDashboard || adminDashboard ? (
                <button
                  onClick={() => handleLogout(isDashboard ? "user" : "admin")}
                  className="w-full md:w-auto px-6 py-2.5 rounded-lg bg-white text-blue-600 hover:bg-blue-50 
                           transition-all duration-200 font-medium flex items-center justify-center space-x-2
                           hover:shadow-md active:scale-95"
                >
                  {isLoggingOut ? (
                    <BiLoaderAlt className="animate-spin text-xl" />
                  ) : (
                    <>
                      <FaSignOutAlt className="text-lg" />
                      <span>Logout</span>
                    </>
                  )}
                </button>
              ) : (
                <>
                  <Link
                    to="/"
                    className="w-full md:w-auto flex items-center space-x-2 px-6 py-2.5 text-white 
                             hover:text-blue-100 hover:bg-blue-600/30 rounded-lg transition-all duration-200"
                  >
                    <FaSignInAlt className="text-lg" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="w-full md:w-auto flex items-center space-x-2 px-6 py-2.5 rounded-lg 
                             bg-white text-blue-600 hover:bg-blue-50 transition-all duration-200 
                             font-medium hover:shadow-md active:scale-95"
                  >
                    <FaUserPlus className="text-lg" />
                    <span>Get Started</span>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
