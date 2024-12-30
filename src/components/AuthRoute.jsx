import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const AuthRoute = ({ children, requireAuth = true, adminOnly = false }) => {
  const [loading, setLoading] = useState(true);
  const [authInfo, setAuthInfo] = useState({ isAuthenticated: false, role: null });
  const location = useLocation();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/auth/verify`, {
          withCredentials: true
        });
        
        setAuthInfo({
          isAuthenticated: response.data.success,
          role: response.data.data?.role
        });
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthInfo({ isAuthenticated: false, role: null });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname]); // Re-check auth when path changes

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // For login/register pages, redirect to dashboard if already authenticated
  if (!requireAuth && authInfo.isAuthenticated) {
    return <Navigate to={authInfo.role === 'admin' ? '/admin/dashboard' : '/dashboard'} />;
  }

  // For protected pages, check authentication
  if (requireAuth && !authInfo.isAuthenticated) {
    return <Navigate to="/" />;
  }

  // For admin routes, check role
  if (adminOnly && authInfo.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default AuthRoute;
