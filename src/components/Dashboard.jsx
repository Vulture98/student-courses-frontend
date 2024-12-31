import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaBook, FaGraduationCap, FaChartLine } from 'react-icons/fa';

const Dashboard = () => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [coursesByCategory, setCoursesByCategory] = useState({});
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    averageProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchAssignedCourses();
  }, []);

  const fetchAssignedCourses = async () => {
    try {
      setLoading(true);      
      const response = await axios.get(`${apiUrl}/api/student/courses`, {
        withCredentials: true
      });      

      // Get student info and enrolled courses
      const studentData = response.data.data;
      setStudentInfo(studentData);
      const enrolledCourses = studentData.enrolledCourses || [];      

      // Group courses by subject (case-insensitive)
      const groupedCourses = enrolledCourses.reduce((acc, enrollment) => {
        const course = enrollment.course;
        if (!course) return acc; // Skip if course is null

        const subject = (course.subject || 'Other').trim();
        if (!acc[subject]) {
          acc[subject] = [];
        }

        acc[subject].push({
          ...course,
          _id: course._id, // Ensure we have the course ID
          completed: enrollment.completed,
          progress: enrollment.progress
        });
        return acc;
      }, {});
      
      setCoursesByCategory(groupedCourses);

      // Calculate stats
      const completed = enrolledCourses.filter(enrollment => enrollment.completed).length;
      const avgProgress = enrolledCourses.reduce((acc, enrollment) => acc + (enrollment.progress || 0), 0) / (enrolledCourses.length || 1);

      setStats({
        totalCourses: enrolledCourses.length,
        completedCourses: completed,
        averageProgress: avgProgress
      });
    } catch (error) {
      console.error('Error fetching courses:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Error fetching your courses');
    } finally {
      // await new Promise(resolve => setTimeout(resolve, 2000));
      setLoading(false);
    }
  };

  const toggleCourseCompletion = async (courseId) => {
    try {
      setToggleLoading(true);
      const response = await axios.patch(
        `${apiUrl}/api/student/toggle-completion/${courseId}`,
        {},
        { withCredentials: true }
      );
      // await fetchAssignedCourses();
      // Update local state with the response
      if (response.data.success) {
        setCoursesByCategory(prev => {
          const newState = { ...prev };
          // Find and update the course completion status
          Object.keys(newState).forEach(category => {
            const courseIndex = newState[category].findIndex(course => 
              course._id === courseId
            );
            if (courseIndex !== -1) {
              newState[category][courseIndex].completed = 
                !newState[category][courseIndex].completed;
              newState[category][courseIndex].progress = 
                newState[category][courseIndex].completed ? 100 : 0;
            }
          });
          return newState;
        });
        toast.success('Course status updated');
      }
    } catch (error) {
      console.error('Error updating course status:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to update course status');
    } finally {
      // Simulate network delay locally
      // await new Promise(resolve => setTimeout(resolve, 2000));
      setToggleLoading(false);
    }
  };

  // Main page loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Overlay loading for toggle action
  const LoadingOverlay = () => toggleLoading ? (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  ) : null;

  const courseCategories = Object.keys(coursesByCategory);
  const hasNoCourses = courseCategories.length === 0;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <LoadingOverlay />
      <div className="max-w-7xl mx-auto">
        {/* Student Info Card */}
        {studentInfo && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{studentInfo.name}</h2>
                <p className="text-gray-600">{studentInfo.email}</p>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Joined: {new Date(studentInfo.createdAt).toLocaleDateString()}</p>
                  {studentInfo.lastActive && (
                    <p>Last Active: {new Date(studentInfo.lastActive).toLocaleString()}</p>
                  )}
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full ${studentInfo.isSuspended
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
                }`}>
                {studentInfo.isSuspended ? 'Suspended' : 'Active'}
              </div>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Total Courses</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.totalCourses}</p>
              </div>
              <FaBook className="text-blue-200 text-4xl" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Completed</h3>
                <p className="text-3xl font-bold text-green-600">{stats.completedCourses}</p>
              </div>
              <FaGraduationCap className="text-green-200 text-4xl" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Average Progress</h3>
                <p className="text-3xl font-bold text-purple-600">{stats.averageProgress.toFixed(1)}%</p>
              </div>
              <FaChartLine className="text-purple-200 text-4xl" />
            </div>
          </div>
        </div>

        {/* Courses Section */}
        {hasNoCourses ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <FaBook className="mx-auto text-gray-300 text-5xl mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">You haven't been assigned any courses yet.</h3>
            <p className="text-gray-500">Check back later or contact your administrator.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {courseCategories.map(category => (
              <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                  <h2 className="text-xl font-semibold text-gray-900">{category}</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coursesByCategory[category].map(course => (
                      <div key={course._id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">{course.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-600">{course.subject}</span>
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                {course.level}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleCourseCompletion(course._id)}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${course.completed
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                          >
                            {course.completed ? 'Completed' : 'Mark Complete'}
                          </button>
                        </div>
                        {course.description && (
                          <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                        )}
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{course.progress || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 rounded-full h-2"
                              style={{ width: `${course.progress || 0}%` }}
                            />
                          </div>
                        </div>
                        {course.videoUrl && (
                          <a
                            href={course.isSuspended ? "#" : course.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`mt-4 block text-center py-2 px-4 rounded-md ${course.isSuspended
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                            title={course.isSuspended ? "This course has been suspended" : ""}
                            onClick={(e) => course.isSuspended && e.preventDefault()}
                          >
                            Watch Course
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div >
  );
};

export default Dashboard;
