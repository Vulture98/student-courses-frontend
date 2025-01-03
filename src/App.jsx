import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import NotFound from './components/NotFound';
import StudentDetails from './components/admin/StudentDetails.jsx';
import CourseManagement from './components/admin/CourseManagement';
import AuthRoute from './components/AuthRoute';
import Profile from './components/Profile';

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Student Routes */}
            <Route path="/dashboard" element={
              <AuthRoute>
                <Dashboard />
              </AuthRoute>
            } />
            <Route
              path="/profile"
              element={
                <AuthRoute>
                  <Profile />
                </AuthRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route path="/admin/profile" element={
              <AuthRoute adminOnly={true}>
                <Profile />
              </AuthRoute>
            } />
            <Route path="/admin/dashboard" element={
              <AuthRoute adminOnly={true}>
                <AdminDashboard />
              </AuthRoute>
            } />
            <Route path="/admin/students/:studentId" element={
              <AuthRoute adminOnly={true}>
                <StudentDetails />
              </AuthRoute>
            } />
            <Route path="/admin/courses/:courseId" element={
              <AuthRoute adminOnly={true}>
                <CourseManagement />
              </AuthRoute>
            } />
            <Route path = "/logout" element={<Login />} />
            <Route path="/admin/logout/login" element={<AdminLogin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer />
      </div>
    </Router>
  );
};

export default App;
