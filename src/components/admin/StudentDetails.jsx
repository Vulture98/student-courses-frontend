import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBook, FaClock, FaGraduationCap, FaChartLine, FaCalendar } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );
};

const StudentDetails = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removingCourse, setRemovingCourse] = useState(null);
  const { studentId } = useParams();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchStudentDetails = async () => {
    try {      
      const response = await axios.get(`${apiUrl}/api/admin/students/${studentId}`, {
        withCredentials: true
      });
      // console.log(`response.data.data: `, response.data.data);
      setStudent(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching student details:', error);
      toast.error('Error fetching student details');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDetails();
  }, [studentId]);

  const handleRemoveCourse = async (courseId, courseName, enrollmentId) => {
    if (!courseId || !enrollmentId) return;

    // Set the course being removed
    setRemovingCourse(courseId);

    // Ask for confirmation
    if (!window.confirm(`Are you sure you want to remove "${courseName || 'this course'}"?`)) {
      setRemovingCourse(null);
      return;
    }

    try {
      const response = await axios.post(
        `${apiUrl}/api/admin/unassign-courses`,
        {
          studentIds: [studentId],
          courseIds: [courseId]
        },
        { withCredentials: true }
      );      

      if (response.data.success) {
        // Update the local state with the new student data using enrollmentId
        setStudent(prevStudent => ({
          ...prevStudent,
          enrolledCourses: prevStudent.enrolledCourses.filter(
            enrollment => enrollment._id !== enrollmentId
          )
        }));
        toast.success(response.data.message || 'Course removed successfully');
        
        // If we have detailed results, show additional info
        if (response.data.data?.results) {
          const { results } = response.data.data;
          if (results[0]?.notEnrolled > 0) {
            toast.info('Student was not enrolled in this course');
          }
        }
      }
    } catch (error) {
      console.error('Error removing course:', error);
      toast.error(error.response?.data?.message || 'Error removing course');
      // Refresh data to ensure UI is in sync
      fetchStudentDetails();
    } finally {
      setRemovingCourse(null);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </button>
          <h2 className="text-xl font-bold text-red-500">Student not found</h2>
        </div>
      </div>
    );
  }

  const enrolledCourses = student.enrolledCourses || [];
  const totalCourses = enrolledCourses.length;
  const completedCourses = enrolledCourses.filter(enrollment => enrollment.completed).length;
  const averageProgress = enrolledCourses.reduce((acc, enrollment) => acc + (enrollment.progress || 0), 0) / (totalCourses || 1);

  const coursesBySubject = enrolledCourses.reduce((acc, enrollment) => {
    const subject = enrollment.course?.subject || 'Other';
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(enrollment);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Student Details</h1>
        </div>

        {/* Student Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{student.name}</h2>
              <p className="text-gray-600">{student.email}</p>
              <p className="text-sm text-gray-500 mt-2">
                <FaCalendar className="inline mr-2" />
                Joined: {new Date(student.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
              {student.isSuspended ? 'Suspended' : 'Active'}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Total Courses</h3>
                  <p className="text-3xl font-bold text-blue-600">{totalCourses}</p>
                </div>
                <FaBook className="text-blue-200 text-4xl" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Completed</h3>
                  <p className="text-3xl font-bold text-green-600">{completedCourses}</p>
                </div>
                <FaGraduationCap className="text-green-200 text-4xl" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Average Progress</h3>
                  <p className="text-3xl font-bold text-purple-600">{averageProgress.toFixed(1)}%</p>
                </div>
                <FaChartLine className="text-purple-200 text-4xl" />
              </div>
            </div>
          </div>

          {/* Enrolled Courses */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Enrolled Courses</h3>
            {enrolledCourses.length > 0 ? (
              <div className="space-y-6">
                {Object.entries(coursesBySubject).map(([subject, courses]) => (
                  <div key={subject} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 capitalize">{subject}</h4>
                    <div className="space-y-4">
                      {courses.map(enrollment => {
                        // Skip if course is null or undefined
                        if (!enrollment.course) return null;
                        
                        const course = enrollment.course;
                        return (
                          <div key={`${course._id}-${enrollment._id}`} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">
                                  {course.title || 'Untitled Course'}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {course.subject} • {course.level || 'No Level'}
                                </p>
                                {course.description && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    {course.description}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => handleRemoveCourse(course._id, course.title, enrollment._id)}
                                disabled={removingCourse === course._id}
                                className={`px-3 py-1.5 rounded text-sm font-medium text-white
                                  ${removingCourse === course._id
                                    ? 'bg-red-400 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700'
                                  } transition-colors duration-200`}
                              >
                                {removingCourse === course._id ? 'Removing...' : 'Remove'}
                              </button>
                            </div>

                            <div className="mt-4">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{enrollment.progress || 0}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${enrollment.completed ? 'bg-green-600' : 'bg-blue-600'
                                    }`}
                                  style={{ width: `${enrollment.progress || 0}%` }}
                                />
                              </div>
                            </div>

                            <div className="mt-3 flex justify-between items-center">
                              <span className={`text-sm ${enrollment.completed ? 'text-green-500' : 'text-yellow-500'}`}>
                                {enrollment.completed ? 'Completed' : 'In Progress'}
                              </span>
                              <button
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                onClick={() => {/* TODO: Implement watch course */ }}
                              >
                                {/* Watch Course */}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No courses enrolled</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
